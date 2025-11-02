import Model3D from './Model3D';
import { getModelo } from '../config/modelConfig';
import { useEscenario } from '../../../common/contexts';
import { useECSSceneContext } from '../context/ECSSceneContext';

/**
 * Componente que renderiza todas las entidades del ECS como modelos 3D
 */
const ECSSceneRenderer = () => {
    const { setDispositivoSeleccionado, dispositivoSeleccionado } = useEscenario();
    const { processEntities } = useECSSceneContext();
    const handleEntityClick = (entity: unknown) => {
        console.log('Entidad clickeada:', entity);
        setDispositivoSeleccionado(entity);
        console.log('Dispositivo seleccionado actualizado:', dispositivoSeleccionado);
    };

    const processedEntities = processEntities();

    return (
        <>
            {/* Asegúrate de desestructurar con el nombre correcto: 'entidadId' */}
            {processedEntities.map(({ objetoConTipo, position, rotacionY, entidadId, entidadCompleta }) => {
                const modelPath = getModelo(objetoConTipo);

                if (modelPath === "") return null;
                return (
                    <Model3D
                        // Usa entidadId para la key de React
                        key={`entity-${entidadId}`}
                        modelPath={modelPath}
                        position={position}
                        rotation={[0, rotacionY, 0]}
                        scale={1}
                        // Pasamos la entidad procesada completa, que incluye el ID, para la interacción
                        onClick={() => handleEntityClick({ objetoConTipo, entidadId, entidadCompleta })}
                    />
                );
            })}
        </>
    );
};

export default ECSSceneRenderer;