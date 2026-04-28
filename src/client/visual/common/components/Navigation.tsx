import React from 'react';
import { NavLink } from 'react-router';
import styles from '../styles/Sidebar.module.css';
import Tooltip from './Tooltip';

const NavigationLink: React.FC<{icon: React.ReactNode, label: string, to: string, forceInactive?: boolean, 'data-tour'?: string}> = ({icon, label, to, forceInactive = false, 'data-tour': dataTour}) => {
    return (
        <Tooltip text={label}>
            <NavLink
                to={to}
                className={({ isActive }) => `${styles.dockItem} ${isActive && !forceInactive ? styles.active : ''}`}
                data-tour={dataTour}
            >
                {icon}
            </NavLink>
        </Tooltip>
    );
};

export default NavigationLink;
