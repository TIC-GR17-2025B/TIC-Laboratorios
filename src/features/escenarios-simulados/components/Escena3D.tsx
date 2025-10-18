import React from 'react';
import styles from '../styles/Escena3D.module.css';
import Controles3D from './Controles3D';

const Escena3D: React.FC = () => {
    return (
        <section className={styles.vista3D} aria-label="Vista 3D de la escena">
            <Controles3D />
            <div className={styles.canvas} aria-label="Renderizado 3D de la oficina">
            </div>
        </section>
    );
};

export default Escena3D;
