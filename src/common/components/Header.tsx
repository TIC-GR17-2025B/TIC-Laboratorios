import React from 'react';
import styles from '../styles/Header.module.css';
import NavigationLink from './Navigation';
import DevicesIcon from '../icons/DevicesIcon';
import OfficeIcon from '../icons/OfficeIcon';
import EstrellasIcon from '../icons/EstrellasIcon';

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className={styles.header}>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.rightSideSection}>
                    <span aria-label='Animación actualmente pausada'>
                        Pausado
                    </span>
                    <button>
                        Chatbot <EstrellasIcon />
                    </button>
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