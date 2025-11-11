import { useState } from 'react';
import ComboBox from '../../../common/components/ComboBox';
import styles from '../styles/ModalFirewall.module.css';
import { useFirewall } from '../hooks';
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext';
import { useEscenario } from '../../../common/contexts';
import { useFirewallLogs } from '../context/FirewallLogsContext';

/**
 * Componente para configurar el Firewall de un router
 * Permite permitir o denegar servicios por red y dirección
 */

const SERVICIOS = [
    { label: 'HTTP', value: 'http' },
    { label: 'HTTPS', value: 'https' },
    { label: 'FTP', value: 'ftp' },
    { label: 'SSH', value: 'ssh' },
    { label: 'Email', value: 'email' },
    { label: 'Web Server', value: 'web_server' },
];

const REDES = [
    { label: 'LAN 1', value: 'lan1' },
    { label: 'Internet', value: 'internet' },
];

type RedOption = typeof REDES[number];

interface ModalFirewallProps {
    entidadRouter?: number | null;
}

export default function ModalFirewall({ entidadRouter: entidadRouterProp }: ModalFirewallProps = {}) {
    const [redSeleccionada, setRedSeleccionada] = useState<RedOption | null>(REDES[0]);
    const { ecsManager } = useECSSceneContext();
    const { dispositivoSeleccionado } = useEscenario();
    const { obtenerLogsPorRouter } = useFirewallLogs();
    
    // Usar el prop si viene, sino extraer del contexto
    const entidadRouter = entidadRouterProp ?? (dispositivoSeleccionado as { entidadId?: number })?.entidadId ?? null;
    
    const {
        obtenerRegla,
        estaServicioBloqueado,
        toggleServicio,
        toggleTodos,
        router
    } = useFirewall(entidadRouter, ecsManager);
    
    // Obtener logs del router específico
    const logs = router ? obtenerLogsPorRouter(router.nombre).map(log => log.mensaje) : [];



    return (
        <div className={styles.modalFirewallContainer}>
            <h2 className={styles.modalFirewallTitle}>Configuración de Firewall</h2>
            <p className={styles.descripcion}>
                Configura qué servicios bloquear para cada red y dirección de tráfico
            </p>

            <ComboBox
                items={REDES}
                value={redSeleccionada}
                onChange={setRedSeleccionada}
                getKey={(item) => item.value}
                getLabel={(item) => item.label}
                placeholder="Selecciona una red"
            />

            {redSeleccionada && (
                <div className={styles.reglasGrid}>
                    {[redSeleccionada].map(red => (
                        <div key={red.value} className={styles.redSection}>
                            <div className={styles.direccionGroup}>
                                <div className={styles.direccionHeader}>
                                    <span className={styles.direccionLabel}>
                                        <span className={styles.direccionIcon}>←</span>
                                        Entrante desde
                                    </span>
                                    <button
                                        className={styles.toggleTodosBtn}
                                        onClick={() => toggleTodos(red.value, 'inbound')}
                                        title={obtenerRegla(red.value, 'inbound').servicios.length === SERVICIOS.length
                                            ? "Permitir todos"
                                            : "Bloquear todos"}
                                    >
                                        {obtenerRegla(red.value, 'inbound').servicios.length === SERVICIOS.length
                                            ? '✓ Permitir todos'
                                            : '✗ Bloquear todos'}
                                    </button>
                                </div>
                                <div className={styles.serviciosGrid}>
                                    {SERVICIOS.map(servicio => {
                                        const bloqueado = estaServicioBloqueado(red.value, 'inbound', servicio.value);
                                        return (
                                            <button
                                                key={servicio.value}
                                                className={`${styles.servicioBtn} ${bloqueado ? styles.bloqueado : styles.permitido}`}
                                                onClick={() => toggleServicio(red.value, 'inbound', servicio.value)}
                                            >
                                                <span className={styles.servicioNombre}>{servicio.label}</span>

                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={styles.separator} />

                            <div className={styles.direccionGroup}>
                                <div className={styles.direccionHeader}>
                                    <span className={styles.direccionLabel}>
                                        <span className={styles.direccionIcon}>→</span>
                                        Saliente hacia
                                    </span>
                                    <button
                                        className={styles.toggleTodosBtn}
                                        onClick={() => toggleTodos(red.value, 'outbound')}
                                        title={obtenerRegla(red.value, 'outbound').servicios.length === SERVICIOS.length
                                            ? "Permitir todos"
                                            : "Bloquear todos"}
                                    >
                                        {obtenerRegla(red.value, 'outbound').servicios.length === SERVICIOS.length
                                            ? '✓ Permitir todos'
                                            : '✗ Bloquear todos'}
                                    </button>
                                </div>
                                <div className={styles.serviciosGrid}>
                                    {SERVICIOS.map(servicio => {
                                        const bloqueado = estaServicioBloqueado(red.value, 'outbound', servicio.value);
                                        return (
                                            <button
                                                key={servicio.value}
                                                className={`${styles.servicioBtn} ${bloqueado ? styles.bloqueado : styles.permitido}`}
                                                onClick={() => toggleServicio(red.value, 'outbound', servicio.value)}
                                            >
                                                <span className={styles.servicioNombre}>{servicio.label}</span>

                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.logsSection}>
                <div className={styles.logsHeader}>
                    <h3 className={styles.subtitle}>Resumen de bloqueos</h3>
                </div>
                <div className={styles.resumenContent}>
                    {logs.length === 0 ? (
                        <p className={styles.textoVacio}>No hay logs sobre bloqueos.</p>
                    ) : (
                        <div className={styles.resumenGrid}>
                            {logs.map((log, index) => (
                                <div key={index} className={styles.resumenItem}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}