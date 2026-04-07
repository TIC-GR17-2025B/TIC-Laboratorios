import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Model3D from './Model3D';
import { getModelo } from '../config/modelConfig';
import { useEscenario, useModal } from '../../../common/contexts';
import { useECSSceneContext } from '../context/ECSSceneContext';
import { useScreenTransition } from '../../../common/contexts/ScreenTransitionContext';
import ModalFirewall from '../../simulacion-redes/components/ModalFirewall';
import ModalVPN from '../../simulacion-redes/components/ModalVPN';

/**
 * Componente que renderiza todas las entidades del ECS como modelos 3D
 */
const ECSSceneRenderer: React.FC = () => {
    const { setDispositivoSeleccionado, entidadSeleccionadaId } = useEscenario();
    const { processEntities } = useECSSceneContext();
    const { openModal } = useModal();
    const { startZoom, isZooming, desktopMode } = useScreenTransition();
    const [menuOpenForEntity, setMenuOpenForEntity] = useState<number | null>(null);
    const [clickedEntityId, setClickedEntityId] = useState<number | null>(null);
    const navigate = useNavigate();

    // Handle zoom-to-screen transition for workstations
    const handleZoomToDevice = useCallback((position: [number, number, number], rotationY: number) => {
        if (isZooming || desktopMode) return;
        startZoom(position, rotationY);
    }, [isZooming, desktopMode, startZoom]);

    useEffect(() => {
        setDispositivoSeleccionado(null);
    }, []);

    const handleEntityClick = (entity: unknown) => {
        const e = entity as { objetoConTipo?: { tipo?: string }; entidadId?: number };
        if (e.objetoConTipo?.tipo === 'espacio') return;
        setClickedEntityId(e.entidadId ?? null);
        setDispositivoSeleccionado(entity);
    };

    const handleEntityHover = (entity: unknown) => {
        const e = entity as { objetoConTipo?: { tipo?: string } };
        if (e.objetoConTipo?.tipo === 'espacio') return;
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

    const handleContextMenu = (entity: unknown) => {
        const e = entity as { objetoConTipo?: { tipo?: string }; entidadId?: number };
        if (e.objetoConTipo?.tipo !== 'espacio') {
            setDispositivoSeleccionado(entity);
            setMenuOpenForEntity(e.entidadId ?? null);
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

            {processedEntities.map(({ objetoConTipo, position, rotacionY, entidadId, entidadCompleta }) => {
                const modelPath = getModelo(objetoConTipo);
                const isEspacio = objetoConTipo?.tipo === 'espacio';

                if (modelPath === "") return null;
                return (
                    <Model3D
                        key={`entity-${entidadId}`}
                        modelPath={modelPath}
                        position={position}
                        rotation={[0, rotacionY, 0]}
                        scale={1}
                        onClick={isEspacio ? undefined : () => handleEntityClick({ objetoConTipo, entidadId, entidadCompleta })}
                        onContextMenu={isEspacio ? undefined : () => handleContextMenu({ objetoConTipo, entidadId, entidadCompleta })}
                        onHover={isEspacio ? undefined : () => handleEntityHover({ objetoConTipo, entidadId, entidadCompleta })}
                        onHoverEnd={isEspacio ? undefined : handleEntityHoverEnd}
                        isSelected={!isEspacio && entidadSeleccionadaId === entidadId}
                        enableHover={!isEspacio && !desktopMode}
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
