import React from 'react';
import { NavLink } from 'react-router';
import styles from '../styles/Sidebar.module.css';

const NavigationLink: React.FC<{icon: React.ReactNode, label: string, to: string}> = ({icon, label, to}) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `${styles.dockItem} ${isActive ? styles.active : ''}`}
        >
            {icon}
            <span className={styles.tooltip}>{label}</span>
        </NavLink>
    );
};

export default NavigationLink;
