import React from 'react';
import styles from '../styles/Header.module.css';
import NavigationLink from './Navigation';
import DevicesIcon from '../icons/DevicesIcon';
import OfficeIcon from '../icons/OfficeIcon';
import { useEscenarioActual } from '../contexts/EscenarioContext';
import { useECSScene } from "../../features/escenarios-simulados/hooks/useECSScene";
import { useEffect } from 'react';
import ChatLauncher from '../../features/chat/components/ChatLauncher';

const Header: React.FC = () => {
    const escenario = useEscenarioActual();
    const { pause, resume, iniciar, isPaused } = useECSScene();
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
                    <button onClick={() => { pause && pause() }}>Pausar</button>
                    <button onClick={() => { resume && resume() }}>Reanudar</button>
                    <ChatLauncher />
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