import { useState, useMemo } from 'react';
import ComboBox from '../../../common/components/ComboBox';
import styles from '../styles/ModalFirewall.module.css';
import { useFirewall } from '../hooks';
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext';
import { useEscenario } from '../../../common/contexts';
import { ConfiguracionProtocolos } from '../../../../data/configuraciones/configProtocolos';

/**
 * Componente para configurar el Firewall de un router
 * Permite permitir o denegar servicios por red y dirección
 */

type RedOption = {
    label: string;
    value: string;
};

export default function ModalFirewall() {
    const { ecsManager } = useECSSceneContext();
    const { entidadSeleccionadaId } = useEscenario();

    const {
        router,
        redesRouter,
        estaProtocoloBloqueado,
        toggleProtocolo,
        bloquearTodos,
        permitirTodos,
        modoEntrante,
        modoSaliente,
        logsFirewall
    } = useFirewall(entidadSeleccionadaId, ecsManager);

    const REDES: RedOption[] = useMemo(() => {
        return redesRouter.map(red => ({
            label: red.nombre,
            value: red.nombre.toLowerCase().replace(/\s+/g, '_')
        }));
    }, [redesRouter]);

    const [redSeleccionada, setRedSeleccionada] = useState<RedOption | null>(REDES[0] || null);

    const logs = logsFirewall.map((log: any) => log.mensaje);

    const protocolos = useMemo(() => {
        return ConfiguracionProtocolos.map(p => p.protocolo);
    }, []);

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
                                        onClick={() => {
                                            if (modoEntrante === 'bloquear') {
                                                bloquearTodos(protocolos, 'ENTRANTE');
                                            } else {
                                                permitirTodos(protocolos, 'ENTRANTE');
                                            }
                                        }}
                                        title={modoEntrante === 'permitir' ? "Permitir todos" : "Bloquear todos"}
                                    >
                                        {modoEntrante === 'permitir' ? '✓ Permitir todos' : '✗ Bloquear todos'}
                                    </button>
                                </div>
                                <div className={styles.serviciosGrid}>
                                    {ConfiguracionProtocolos.map(protocolo => {
                                        const bloqueado = estaProtocoloBloqueado(protocolo.protocolo, 'ENTRANTE');
                                        return (
                                            <button
                                                key={protocolo.protocolo}
                                                className={`${styles.servicioBtn} ${bloqueado ? styles.bloqueado : styles.permitido}`}
                                                onClick={() => toggleProtocolo(protocolo.protocolo, 'ENTRANTE')}
                                            >
                                                <span className={styles.servicioNombre}>{protocolo.nombre}</span>
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
                                        onClick={() => {
                                            if (modoSaliente === 'bloquear') {
                                                bloquearTodos(protocolos, 'SALIENTE');
                                            } else {
                                                permitirTodos(protocolos, 'SALIENTE');
                                            }
                                        }}
                                        title={modoSaliente === 'permitir' ? "Permitir todos" : "Bloquear todos"}
                                    >
                                        {modoSaliente === 'permitir' ? '✓ Permitir todos' : '✗ Bloquear todos'}
                                    </button>
                                </div>
                                <div className={styles.serviciosGrid}>
                                    {ConfiguracionProtocolos.map(protocolo => {
                                        const bloqueado = estaProtocoloBloqueado(protocolo.protocolo, 'SALIENTE');
                                        return (
                                            <button
                                                key={protocolo.protocolo}
                                                className={`${styles.servicioBtn} ${bloqueado ? styles.bloqueado : styles.permitido}`}
                                                onClick={() => toggleProtocolo(protocolo.protocolo, 'SALIENTE')}
                                            >
                                                <span className={styles.servicioNombre}>{protocolo.nombre}</span>
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