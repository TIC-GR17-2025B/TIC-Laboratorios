import React from 'react';
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

const Sidebar: React.FC = () => {
    const { pause, resume, isPaused, tiempoTranscurrido } = useECSSceneContext();
    const { isChatOpen, toggleChat } = useChatContext();

    return (
        <nav className={styles.dock}>
            <div className={styles.navSection}>
                <NavigationLink icon={<OfficeIcon size={20} />} label="Oficina" to="/" />
                <NavigationLink icon={<DevicesIcon size={20} />} label="Dispositivos" to="/dispositivos" />
                <NavigationLink icon={<RedesIcon size={20} />} label="Redes" to="/redes" />
                <NavigationLink icon={<EstrellaPartidaIcon size={20} />} label="Partida" to="/fases-partida" />
            </div>

            <div className={styles.spacer} />

            <div className={styles.controlsSection}>
                <div className={styles.controlBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m.5-13H11v6l5.2 3.2l.8-1.3l-4.5-2.7z" />
                    </svg>
                    <span className={styles.tooltip}>{formatearTiempo(tiempoTranscurrido)}</span>
                </div>

                <button
                    className={styles.controlBtn}
                    onClick={() => { if (isPaused) resume(); else pause(); }}
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
