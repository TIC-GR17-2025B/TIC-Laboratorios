import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import styles from '../styles/Sidebar.module.css';
import NavigationLink from './Navigation';
import DevicesIcon from '../icons/DevicesIcon';
import OfficeIcon from '../icons/OfficeIcon';
import RedesIcon from '../icons/RedesIcon';
import EstrellaPartidaIcon from '../icons/EstrellaPartidaIcon';
import EstrellasIcon from '../icons/EstrellasIcon';
import { formatearTiempo } from '../utils/formatearTiempo';
import { useECSSceneContext } from '../../features/escenarios-simulados/context/ECSSceneContext';
import { useChatContext } from '../../features/chat/context/ChatContext';
import ChatContainer from '../../features/chat/components/ChatContainer';
import { useScreenTransition } from '../contexts/ScreenTransitionContext';
import { useEscenario } from '../contexts';

const Sidebar: React.FC = () => {
    const { pause, resume, isPaused, tiempoTranscurrido, processEntities } = useECSSceneContext();
    const { isChatOpen, toggleChat } = useChatContext();
    const { startZoom, isZooming, desktopMode, requestZoomToDevice, exitDesktopMode } = useScreenTransition();
    const { entidadSeleccionadaId } = useEscenario();
    const location = useLocation();
    const navigate = useNavigate();

    const handleDispositivosClick = () => {
        if (isZooming || desktopMode) return;

        const entities = processEntities();
        let target: { position: [number, number, number]; rotationY: number } | null = null;

        // Try selected entity (if it's a workstation)
        if (entidadSeleccionadaId != null) {
            const selected = entities.find(
                e => e.entidadId === entidadSeleccionadaId &&
                     e.objetoConTipo.tipo?.toUpperCase() === 'WORKSTATION'
            );
            if (selected) {
                target = { position: selected.position, rotationY: selected.rotacionY };
            }
        }

        // Fallback: first workstation in current zone
        if (!target) {
            const firstWorkstation = entities.find(
                e => e.objetoConTipo.tipo?.toUpperCase() === 'WORKSTATION'
            );
            if (firstWorkstation) {
                target = { position: firstWorkstation.position, rotationY: firstWorkstation.rotacionY };
            }
        }

        if (!target) return;

        if (location.pathname === '/') {
            startZoom(target.position, target.rotationY);
        } else {
            requestZoomToDevice(target.position, target.rotationY);
            navigate('/');
        }
    };

    return (
        <nav className={styles.dock} data-tour="dock">
            <div className={styles.navSection}>
                {desktopMode && !isZooming ? (
                    <button
                        className={styles.dockItem}
                        onClick={exitDesktopMode}
                    >
                        <OfficeIcon size={20} />
                        <span className={styles.tooltip}>Oficina</span>
                    </button>
                ) : (
                    <NavigationLink icon={<OfficeIcon size={20} />} label="Oficina" to="/" forceInactive={desktopMode || isZooming} data-tour="dock-oficina" />
                )}
                <button
                    className={`${styles.dockItem} ${desktopMode || isZooming ? styles.active : ''}`}
                    onClick={handleDispositivosClick}
                    data-tour="dock-dispositivos"
                >
                    <DevicesIcon size={20} />
                    <span className={styles.tooltip}>Dispositivos</span>
                </button>
                <NavigationLink icon={<RedesIcon size={20} />} label="Redes" to="/redes" data-tour="dock-redes" />
                <NavigationLink icon={<EstrellaPartidaIcon size={20} />} label="Partida" to="/fases-partida" data-tour="dock-partida" />
            </div>

            <div className={styles.spacer} />

            <div className={styles.controlsSection}>
                <div className={styles.tiempoDisplay} data-tour="dock-tiempo">
                    {formatearTiempo(tiempoTranscurrido)}
                </div>

                <button
                    className={styles.controlBtn}
                    onClick={() => { if (isPaused) resume(); else pause(); }}
                    data-tour="dock-pausa"
                    aria-label={isPaused ? 'Reanudar animacion' : 'Pausar animacion'}
                >
                    {isPaused ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M16 19q-.825 0-1.412-.587T14 17V7q0-.825.588-1.412T16 5t1.413.588T18 7v10q0 .825-.587 1.413T16 19m-8 0q-.825 0-1.412-.587T6 17V7q0-.825.588-1.412T8 5t1.413.588T10 7v10q0 .825-.587 1.413T8 19" />
                        </svg>
                    )}
                    <span className={styles.tooltip}>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                </button>

                <div className={styles.chatWrapper}>
                    <button
                        className={`${styles.chatBtn} ${isChatOpen ? styles.chatActive : ''}`}
                        onClick={() => toggleChat()}
                        aria-label={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
                        data-chat-toggle="true"
                    >
                        <EstrellasIcon size={20} />
                        <span className={styles.tooltip}>Chatbot</span>
                    </button>
                    <ChatContainer
                        isOpen={isChatOpen}
                        webhookUrl="https://pymwebhooks.pymbots.com/webhook/5b947366-065c-4f88-878b-176f8ebdf392"
                    />
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;
