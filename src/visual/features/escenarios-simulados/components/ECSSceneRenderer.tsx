import React from 'react';
import Model3D from './Model3D';
import type { ECSSceneEntity } from '../hooks/useECSScene';
import {
    getMuebleModel,
    getDispositivoModel,
    getMuebleHeight,
    getDispositivoHeight,
} from '../config/modelConfig';
import { useEscenario } from '../../../common/contexts';

interface ECSSceneRendererProps {
    entities: ECSSceneEntity[];
}

/**
 * Componente que renderiza todas las entidades del ECS como modelos 3D
 */
const ECSSceneRenderer: React.FC<ECSSceneRendererProps> = ({ entities }) => {

    const { setDispositivoSeleccionado, dispositivoSeleccionado } = useEscenario();

    const handleEntityClick = (entity: any) => {
        console.log('Entidad clickeada:', entity);
        setDispositivoSeleccionado(entity);
        console.log('Dispositivo seleccionado actualizado:', dispositivoSeleccionado);
    };

    return (
        <>
            {entities.map((entity) => {
                let modelPath = '';
                let showButton = false;
                let adjustedPosition: [number, number, number] = [...entity.position];

                if (entity.type === 'espacio' && entity.muebleTipo) {
                    modelPath = getMuebleModel(entity.muebleTipo);
                    const muebleHeight = getMuebleHeight(entity.muebleTipo);
                    adjustedPosition = [entity.position[0], muebleHeight, entity.position[2]];
                } else if (entity.type === 'dispositivo' && entity.dispositivoTipo) {
                    modelPath = getDispositivoModel(entity.dispositivoTipo);
                    showButton = true;
                    const deviceHeight = getDispositivoHeight(entity.dispositivoTipo);
                    adjustedPosition = [entity.position[0], deviceHeight, entity.position[2]];
                }

                if (!modelPath) return null;

                return (
                    <Model3D
                        key={`entity-${entity.id}`}
                        modelPath={modelPath}
                        position={adjustedPosition}
                        rotation={[0, entity.rotation, 0]}
                        scale={1}
                        showHoverButton={showButton}
                        onClick={() => handleEntityClick(entity)}
                    />
                );
            })}
        </>
    );
};

export default ECSSceneRenderer;
