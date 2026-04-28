import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Model3D from './Model3D';
import { getModelo } from '../config/modelConfig';
import { useEscenario, useModal } from '../../../common/contexts';
import type { ECSEntityRef } from '../../../common/contexts/EscenarioContext';
import { useECSSceneContext } from '../context/ECSSceneContext';
import { useScreenTransition } from '../../../common/contexts/ScreenTransitionContext';
import ModalFirewall from '../../simulacion-redes/components/ModalFirewall';
import ModalVPN from '../../simulacion-redes/components/ModalVPN';

const ECSSceneRenderer: React.FC = () => {
    const { setDispositivoSeleccionado, entidadSeleccionadaId } = useEscenario();
    const { processEntities } = useECSSceneContext();
    const { openModal } = useModal();
    const { startZoom, isZooming, desktopMode } = useScreenTransition();
    const [menuOpenForEntity, setMenuOpenForEntity] = useState<number | null>(null);
    const [clickedEntityId, setClickedEntityId] = useState<number | null>(null);
    const navigate = useNavigate();

    const handleZoomToDevice = useCallback((position: [number, number, number], rotationY: number) => {
        if (isZooming || desktopMode) return;
        startZoom(position, rotationY);
    }, [isZooming, desktopMode, startZoom]);

    useEffect(() => {
        setDispositivoSeleccionado(null);
    }, []);

    const handleEntityClick = (entity: ECSEntityRef) => {
        if (entity.objetoConTipo?.tipo === 'espacio') return;
        setClickedEntityId(entity.entidadId ?? null);
        setDispositivoSeleccionado(entity);
    };

    const handleEntityHover = (entity: ECSEntityRef) => {
        if (entity.objetoConTipo?.tipo === 'espacio') return;
        if (clickedEntityId === null) {
            setDispositivoSeleccionado(entity);
        }
    };

    const handleEntityHoverEnd = () => {
        if (clickedEntityId === null) {
            setDispositivoSeleccionado(null);
        }
    };

    const processedEntities = processEntities();

    const handleBackgroundClick = () => {
        setClickedEntityId(null);
        setDispositivoSeleccionado(null);
        setMenuOpenForEntity(null);
    };

    const handleContextMenu = (entity: ECSEntityRef) => {
        if (entity.objetoConTipo?.tipo !== 'espacio') {
            setClickedEntityId(entity.entidadId ?? null);
            setDispositivoSeleccionado(entity);
            setMenuOpenForEntity(entity.entidadId ?? null);
        }
    };

    const getMenuOptions = (rotacionY: number, position: [number, number, number]) => {
        const selectedEntity = processedEntities.find(e => e.entidadId === menuOpenForEntity);
        const deviceType = selectedEntity?.objetoConTipo?.tipo?.toUpperCase();

        if (deviceType === 'WORKSTATION') {
            return [
                {
                    label: 'Configurar',
                    onClick: () => {
                        setMenuOpenForEntity(null);
                        handleZoomToDevice(position, rotacionY);
                    },
                }
            ];
        } else if (deviceType === 'ROUTER') {
            return [
                {
                    label: 'Configurar Firewall',
                    onClick: () => {
                        openModal(<ModalFirewall />, 'Configuración de Firewall');
                        setMenuOpenForEntity(null);
                    },
                }
            ];
        } else if (deviceType === 'VPN') {
            return [
                {
                    label: 'Configurar VPN',
                    onClick: () => {
                        openModal(<ModalVPN />, "Configuración de VPN Gateway");
                        setMenuOpenForEntity(null);
                    }
                }];
        }
        return [
            {
                label: 'Configurar',
                onClick: () => {
                    setMenuOpenForEntity(null);
                    handleZoomToDevice(position, rotacionY);
                },
            }
        ];
    };

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

            {processedEntities.map(({ objetoConTipo, position, rotacionY, entidadId, entidadCompleta, esInteractiva }) => {
                const modelPath = getModelo(objetoConTipo);
                const isEspacio = objetoConTipo?.tipo === 'espacio';
                const isInteractive = !isEspacio && esInteractiva;

                if (modelPath === "") return null;
                return (
                    <Model3D
                        key={`entity-${entidadId}`}
                        modelPath={modelPath}
                        position={position}
                        rotation={[0, rotacionY, 0]}
                        scale={1}
                        onClick={isInteractive ? () => handleContextMenu({ objetoConTipo, entidadId, entidadCompleta }) : undefined}
                        onHover={isInteractive ? () => handleEntityHover({ objetoConTipo, entidadId, entidadCompleta }) : undefined}
                        onHoverEnd={isInteractive ? handleEntityHoverEnd : undefined}
                        isSelected={isInteractive && entidadSeleccionadaId === entidadId}
                        enableHover={isInteractive && !desktopMode}
                        showMenu={menuOpenForEntity === entidadId}
                        menuOptions={getMenuOptions(rotacionY, position)}
                        onMenuClose={() => setMenuOpenForEntity(null)}
                        onNavigate={(path) => navigate(path)}
                    />
                );
            })}
        </>
    );
};

export default ECSSceneRenderer;
