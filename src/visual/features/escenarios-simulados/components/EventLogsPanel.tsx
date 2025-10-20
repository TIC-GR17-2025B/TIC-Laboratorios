import React, { useState } from 'react';
import styles from '../styles/EventLogsPanel.module.css';

import logsMock from "../../../mocks/LogsMock";
import { obtenerColorCategoria, obtenerIconoCategoria } from '../utils/getCategoryDetails';

const LogItem = (log: Log) => (
    <article className={styles.logItem} style={{ borderLeft: `2px solid ${obtenerColorCategoria(log.category)}` }}>
        <div className={styles.logItemTime} style={{ color: obtenerColorCategoria(log.category) }}>
            {obtenerIconoCategoria(log.category)}
            <time>{log.time}</time>
        </div>
        <p>{log.content}</p>
    </article>
);

const EventLogsPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <aside
                className={`${styles.logsPanel} ${!isOpen ? styles.hidden : ''}`}
                aria-label="Panel de registros de eventos"
                aria-hidden={!isOpen}
            >
                <header className={styles.logsHeader}>
                    <h2 className={styles.logsTitle}>Logs</h2>
                    <button
                        className={styles.toggleButton}
                        onClick={togglePanel}
                        aria-label="Cerrar panel de registros"
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 9h1m4 0h3m-8 4h5M8 4h10a3 3 0 0 1 3 3v8c0 .577-.163 1.116-.445 1.573M18 18h-5l-5 3v-3H6a3 3 0 0 1-3-3V7c0-1.085.576-2.036 1.439-2.562M3 3l18 18" /></svg>
                    </button>
                </header>
                <section className={styles.logsContent} aria-label="Lista de eventos registrados">
                    {logsMock.map((log: Log, index: number) => (
                        <LogItem key={index} {...log} />
                    ))}
                </section>
            </aside>

            {!isOpen && (
                <button
                    className={styles.toggleButtonCollapsed}
                    onClick={togglePanel}
                    aria-label="Abrir panel de registros"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 9h8m-8 4h6m1 5h-2l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5.5M19 16v3m0 3v.01" /></svg> </button>
            )}
        </>
    );
};

export default EventLogsPanel;
