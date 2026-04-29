import { useState } from 'react';
import { useParams, useLocation } from 'react-router';
import { useProgresoEstudiante } from '../hooks/useEstudiantes';
import Breadcrumb from '../components/Breadcrumb';
import Identicon from '../../../common/components/Identicon';
import styles from '../styles/VistaDetalleEstudiante.module.css';

export default function VistaDetalleEstudiante() {
    const { idEstudiante } = useParams<{ idEstudiante: string }>();
    const location = useLocation();
    const state = location.state as {
        fromGrupo?: { id: number; nombre: string };
        estudiante?: { nombre: string; correo: string };
    } | null;
    const fromGrupo = state?.fromGrupo;
    const estudiante = state?.estudiante;

    const [expandedEscenarios, setExpandedEscenarios] = useState<Set<string>>(new Set());

    const { progresos, loading, error } =
        useProgresoEstudiante(idEstudiante ? parseInt(idEstudiante) : null);

    const progresosPorEscenario = progresos.reduce((acc, p) => {
        const slug = p.slug_escenario;
        if (!slug) return acc;
        if (!acc[slug]) acc[slug] = { nombre: p.nombre_escenario, slug_escenario: slug, intentos: [], completado: false };
        acc[slug].intentos.push(p);
        if (p.terminado) acc[slug].completado = true;
        return acc;
    }, {} as Record<string, { nombre: string; slug_escenario: string; intentos: typeof progresos; completado: boolean }>);

    const escenarios = Object.values(progresosPorEscenario).filter(e => e.slug_escenario !== 'ai-generated-scenario');

    const formatTiempo = (t: number | null) => {
        if (t === null) return '--:--';
        const mins = Math.floor(t / 60).toString().padStart(2, '0');
        const secs = Math.floor(t % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const formatFecha = (fecha?: string) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const time = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

        if (isToday) return `Hoy, ${time}`;
        if (isYesterday) return `Ayer, ${time}`;
        return date.toLocaleDateString('es', { day: 'numeric', month: 'short' }) + `, ${time}`;
    };

    return (
        <div className={styles.main}>
            <Breadcrumb items={[
                { label: 'Mis Cursos', to: '/docente' },
                ...(fromGrupo
                    ? [{ label: fromGrupo.nombre, to: `/docente/grupo/${fromGrupo.id}` }]
                    : []),
                { label: estudiante?.nombre || 'Estudiante' },
            ]} />

            {estudiante && (
                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                        <Identicon seed={estudiante.correo || 'user'} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>{estudiante.nombre}</h1>
                        <div className={styles.profileMetaRow}>
                            <p className={styles.meta}>{estudiante.correo}</p>
                            {fromGrupo && (
                                <>
                                    <span className={styles.metaDot}>·</span>
                                    <p className={styles.meta}>{fromGrupo.nombre}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <section className={styles.historialSection}>
                    <h2 className={styles.historialTitle}>Historial de evaluaciones</h2>
                    <div className={styles.historialList}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={styles.skeletonItem} aria-hidden="true" />
                        ))}
                    </div>
                </section>
            )}

            {error && <p className={styles.errorText}>{error}</p>}

            {!loading && !error && (
                <section className={styles.historialSection}>
                    <h2 className={styles.historialTitle}>Historial de evaluaciones</h2>

                    {escenarios.length === 0 ? (
                        <div className={styles.empty}>
                            <p className={styles.muted}>Este estudiante aún no ha jugado ningún escenario</p>
                        </div>
                    ) : (
                        <div className={styles.historialList}>
                            {escenarios.map((esc) => {
                                const open = expandedEscenarios.has(esc.slug_escenario);
                                return (
                                    <div key={esc.slug_escenario} className={styles.escenarioBlock}>
                                        <div
                                            className={styles.escenarioHeader}
                                            onClick={() => setExpandedEscenarios(prev => {
                                                const next = new Set(prev);
                                                open ? next.delete(esc.slug_escenario) : next.add(esc.slug_escenario);
                                                return next;
                                            })}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedEscenarios(prev => { const next = new Set(prev); open ? next.delete(esc.slug_escenario) : next.add(esc.slug_escenario); return next; }); } }}
                                            role="button"
                                            tabIndex={0}
                                            aria-expanded={open}
                                        >
                                            <div>
                                                <h3 className={styles.escenarioTitle}>{esc.nombre}</h3>
                                                <div className={styles.escenarioMetaRow}>
                                                    <p className={styles.escenarioMeta}>
                                                        {esc.intentos.length} intento{esc.intentos.length !== 1 ? 's' : ''}
                                                    </p>
                                                    <span className={styles.metaDot}>·</span>
                                                    <div className={styles.intentoBars}>
                                                        {esc.intentos.slice(-5).map((p) => (
                                                            <span
                                                                key={p.id_progreso}
                                                                className={p.terminado ? styles.barOk : styles.barFail}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.chevronWrap}>
                                                <svg
                                                    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                                                    width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {open && esc.intentos.length > 0 && (
                                            <div className={styles.intentosList}>
                                                {[...esc.intentos].reverse().map((intento, i) => (
                                                    <div
                                                        key={intento.id_progreso}
                                                        className={styles.intentoRow}
                                                    >
                                                        <span className={`${styles.intentoDot} ${intento.terminado ? styles.dotOk : styles.dotFail}`} />
                                                        <span className={styles.intentoNum}>{formatFecha(intento.fecha_creacion) || `Intento ${esc.intentos.length - i}`}</span>
                                                        <span className={styles.intentoTiempo}>{formatTiempo(intento.tiempo)}</span>
                                                        <span className={intento.terminado ? styles.intentoStatusOk : styles.intentoStatusFail}>
                                                            {intento.terminado ? 'Completado' : 'Fallido'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
