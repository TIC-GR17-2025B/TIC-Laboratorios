import React from 'react';
import { NavLink } from 'react-router';
import styles from '../styles/Header.module.css';

const NavigationLink: React.FC<{icon: React.ReactNode, label: string, to: string}> = ({icon, label, to}) => {
    return (
            <NavLink 
                to={to} 
                className={({ isActive }) => `${styles.linkWithIcon} ${isActive ? styles.active : ''}`}
            >
                {icon}
                {label}
            </NavLink>
               
    );
};

export default NavigationLink;
