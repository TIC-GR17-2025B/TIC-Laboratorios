import React from 'react';
import Model3D from './Model3D';
import { getModelo } from '../config/modelConfig';
import { useEscenario } from '../../../common/contexts';
import { useECSScene } from '../hooks/useECSScene';

interface ECSSceneRendererProps {
    entities: any;
}
/**
 * Componente que renderiza todas las entidades del ECS como modelos 3D
 */
const ECSSceneRenderer: React.FC<ECSSceneRendererProps> = ({ entities }) => {
    const { setDispositivoSeleccionado, dispositivoSeleccionado } = useEscenario();
    const { processEntities } = useECSScene();

    const handleEntityClick = (entity: any) => {
        console.log('Entidad clickeada:', entity);
        setDispositivoSeleccionado(entity);
        console.log('Dispositivo seleccionado actualizado:', dispositivoSeleccionado);
    };

    const processedEntities = processEntities();

    return (
        <>
            {processedEntities.map(({ objetoConTipo, position, rotacionY, entityIndex }) => {
                const modelPath = getModelo(objetoConTipo);

                if (modelPath === "") return null;

                return (
                    <Model3D
                        key={`entity-${entityIndex}`}
                        modelPath={modelPath}
                        position={position}
                        rotation={[0, rotacionY, 0]}
                        scale={1}
                        onClick={() => handleEntityClick(objetoConTipo)}
                    />
                );
            })}
        </>
    );
};

export default ECSSceneRenderer;