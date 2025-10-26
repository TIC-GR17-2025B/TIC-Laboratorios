import React from 'react';
import styles from '../styles/Header.module.css';
import NavigationLink from './Navigation';
import DevicesIcon from '../icons/DevicesIcon';
import OfficeIcon from '../icons/OfficeIcon';
import ChatToggleButton from '../../features/chat/components/ChatToggleButton/ChatToggleButton';
import { useChatContext } from '../../features/chat/context/ChatContext';
import { useEscenarioActual } from '../contexts/EscenarioContext';
import {useECSScene} from "../../features/escenarios-simulados/hooks/useECSScene";
import { useEffect } from 'react';

const Header: React.FC = () => {
    const escenario = useEscenarioActual();
    const {pause, resume, iniciar, isPaused} = useECSScene();
    const { isChatOpen, isContextModeActive, toggleChat } = useChatContext();
    useEffect(() => {
        // iniciar la simulación una sola vez al montar
        iniciar && iniciar();
    }, [iniciar]);
    return (
        <header className={styles.header}>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>{escenario.titulo}</h1>
                <div className={styles.rightSideSection}>
                    <span aria-label='Estado de la animación'>
                        {isPaused && isPaused() ? 'Pausado' : 'En ejecución'}
                    </span>
                    <button onClick={()=>{pause && pause()}}>Pausar</button>
                    <button onClick={()=>{resume && resume()}}>Reanudar</button>
                    <ChatToggleButton 
                        isOpen={isChatOpen}
                        isContextModeActive={isContextModeActive}
                        onToggle={toggleChat}
                    />
                </div>
            </div>
            <nav className={styles.nav}>
                <NavigationLink icon={<OfficeIcon />} label="Oficina" to="/" />
                <NavigationLink icon={<DevicesIcon />} label="Dispositivos" to="/dispositivos" />
            </nav>

        </header>
    );
};

export default Header;