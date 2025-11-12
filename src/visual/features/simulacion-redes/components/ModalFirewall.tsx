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
    console.log('logsFirewall sin tipo VPN', logsFirewall.filter(log => !log.mensaje.includes('VPN')));
    const logs = logsFirewall.map((log: any) => log.mensaje);

    const protocolos = useMemo(() => {
        return ConfiguracionProtocolos.map(p => p.protocolo);
    }, []);

    return (
        <div className={styles.modalFirewallContainer}>
            <div style={{ width: "180px" }}>
                <ComboBox
                    items={REDES}
                    value={redSeleccionada}
                    onChange={setRedSeleccionada}
                    getKey={(item) => item.value}
                    getLabel={(item) => item.label}
                    placeholder="Selecciona una red"
                />
            </div>

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
                <h3 className={styles.subtitle}>Registro de Actividad</h3>
                <div className={styles.logsContent}>
                    {logs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No hay registro de actividad en el firewall.</p>
                        </div>
                    ) : (
                        <div className={styles.logsGrid}>
                            {logsFirewall.map((log: any, index) => (
                                <LogItem key={index} log={log} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

interface LogItemProps {
    log: {
        tipo: 'PERMITIDO' | 'BLOQUEADO' | string;
        origen: string;
        destino: string;
        protocolo: string;
        router?: string;
        mensaje: string;
    };
}

function LogItem({ log }: LogItemProps) {
    const esPermitido = log.tipo === 'PERMITIDO';

    return (
        <div className={`${styles.logItem} ${esPermitido ? styles.logPermitido : styles.logBloqueado}`}>
            <div className={styles.logEstado}>
                {esPermitido ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
                    </svg>
                )}
            </div>
            <div className={styles.logDetalles}>
                <div className={styles.logConexion}>
                    <span className={styles.logOrigen}>{log.origen}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className={styles.logFlecha}>
                        <path fill="currentColor" d="M16.15 13H5q-.425 0-.712-.288T4 12t.288-.712T5 11h11.15L13.3 8.15q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L19.3 11.3q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.575 4.575q-.3.3-.712.288t-.713-.313q-.275-.3-.288-.7t.288-.7z" />
                    </svg>
                    <span className={styles.logDestino}>{log.destino}</span>
                </div>
                <div className={styles.logMeta}>
                    <span className={styles.logProtocolo}>{log.protocolo}</span>
                    {log.router && (
                        <>
                            <span className={styles.logSeparador}>•</span>
                            <span className={styles.logRouter}>{log.router}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}