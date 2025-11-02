import { useState } from 'react';
import { useNavigate } from 'react-router';
import Model3D from './Model3D';
import { getModelo } from '../config/modelConfig';
import { useEscenario } from '../../../common/contexts';
import { useECSSceneContext } from '../context/ECSSceneContext';

/**
 * Componente que renderiza todas las entidades del ECS como modelos 3D
 */
const ECSSceneRenderer: React.FC = () => {
    const { setDispositivoSeleccionado, entidadSeleccionadaId } = useEscenario();
    const { processEntities } = useECSSceneContext();
    const [menuOpenForEntity, setMenuOpenForEntity] = useState<number | null>(null);
    const navigate = useNavigate();

    const handleEntityClick = (entity: unknown) => {
        console.log('Entidad clickeada:', entity);
        const e = entity as { objetoConTipo?: { tipo?: string } };
        // No permitir seleccionar espacios
        if (e.objetoConTipo?.tipo === 'espacio') {
            return;
        }
        setDispositivoSeleccionado(entity);
    };

    const processedEntities = processEntities();

    const handleBackgroundClick = () => {
        setDispositivoSeleccionado(null);
        setMenuOpenForEntity(null);
    };

    const handleContextMenu = (entity: unknown) => {
        const e = entity as { objetoConTipo?: { tipo?: string }; entidadId?: number };
        if (e.objetoConTipo?.tipo !== 'espacio') {
            setDispositivoSeleccionado(entity);
            setMenuOpenForEntity(e.entidadId ?? null);
        }
    };

    const menuOptions = [
        {
            label: 'Configurar',
            to: '/dispositivos',
            onClick: () => {
                console.log('Configurar entidad:', menuOpenForEntity);
                setMenuOpenForEntity(null);
            },
            color: '#0088ff'
        }
    ];

    return (
        <>
            <mesh
                position={[0, 0, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={handleBackgroundClick}
                onContextMenu={(e) => {
                    e.stopPropagation();
                    handleBackgroundClick();
                }}
            >
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial visible={false} />
            </mesh>

            {/* Asegúrate de desestructurar con el nombre correcto: 'entidadId' */}
            {processedEntities.map(({ objetoConTipo, position, rotacionY, entidadId, entidadCompleta }) => {
                const modelPath = getModelo(objetoConTipo);
                const isEspacio = objetoConTipo?.tipo === 'espacio';

                if (modelPath === "") return null;
                return (
                    <Model3D
                        // Usa entidadId para la key de React
                        key={`entity-${entidadId}`}
                        modelPath={modelPath}
                        position={position}
                        rotation={[0, rotacionY, 0]}
                        scale={1}
                        // Solo permitir onClick y selección en dispositivos, no en espacios
                        onClick={isEspacio ? undefined : () => handleEntityClick({ objetoConTipo, entidadId, entidadCompleta })}
                        onContextMenu={isEspacio ? undefined : () => handleContextMenu({ objetoConTipo, entidadId, entidadCompleta })}
                        isSelected={!isEspacio && entidadSeleccionadaId === entidadId}
                        enableHover={!isEspacio} // Deshabilitar hover en espacios
                        showMenu={menuOpenForEntity === entidadId}
                        menuOptions={menuOptions}
                        onMenuClose={() => setMenuOpenForEntity(null)}
                        onNavigate={(path) => navigate(path)}
                    />
                );
            })}
        </>
    );
};

export default ECSSceneRenderer;