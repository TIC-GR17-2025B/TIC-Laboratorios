import React from 'react';
import { NavLink } from 'react-router';
import styles from '../styles/Sidebar.module.css';

const NavigationLink: React.FC<{icon: React.ReactNode, label: string, to: string, forceInactive?: boolean, 'data-tour'?: string}> = ({icon, label, to, forceInactive = false, 'data-tour': dataTour}) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `${styles.dockItem} ${isActive && !forceInactive ? styles.active : ''}`}
            data-tour={dataTour}
        >
            {icon}
            <span className={styles.tooltip}>{label}</span>
        </NavLink>
    );
};

export default NavigationLink;
