import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useProgresoEstudiante } from '../hooks/useEstudiantes';
import { useEstudianteGrupo } from '../contexts/EstudianteGrupoContext';
import { FeedbackButton } from '../../feedback/components/FeedbackButton';
import { FeedbackModal } from '../../feedback/components/FeedbackModal';
import type { FeedbackData } from '../../feedback/types/feedback.types';
import ModalUnirseGrupo from '../components/ModalUnirseGrupo';
import { NivelController } from '../../../../ecs/controllers/NivelController';
import { API_BASE_URL } from '../../../common/utils/apiConfig';
import styles from '../styles/VistaPerfil.module.css';

export default function VistaPerfil() {
    const navigate = useNavigate();
    const { getUser, getUserRole } = useAuth();
    const user = getUser();
    const role = getUserRole();
    const idEstudiante = role === 'estudiante' && user?.id_estudiante ? user.id_estudiante : null;

    const { progresos, loading } = useProgresoEstudiante(user?.id_estudiante || null);
    const { grupo, loading: grupoLoading, refetch: refetchGrupo } = useEstudianteGrupo();
    const [expandedEscenarios, setExpandedEscenarios] = useState<Set<string>>(new Set());
    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        feedback: FeedbackData | null;
        escenarioNombre: string;
    }>({ isOpen: false, feedback: null, escenarioNombre: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleJoinGroup = async (codigo: string): Promise<{ success: boolean; error?: string }> => {
        if (!idEstudiante) return { success: false, error: 'No se pudo identificar al estudiante' };
        try {
            const response = await fetch(`${API_BASE_URL}/groups/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo_acceso: codigo, id_estudiante: idEstudiante }),
            });
            if (!response.ok) {
                const result = await response.json();
                const msg = result.error || 'Error al unirse al grupo';
                if (msg.includes('ya está matriculado') || msg.includes('ya pertenece') || msg.includes('Ya perteneces'))
                    return { success: false, error: 'Ya perteneces a un grupo' };
                if (msg.includes('código') || msg.includes('no encontrado'))
                    return { success: false, error: 'Código inválido o grupo no encontrado' };
                if (msg.includes('expirado'))
                    return { success: false, error: 'El código de invitación ha expirado' };
                return { success: false, error: msg };
            }
            await refetchGrupo();
            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión. Inténtalo nuevamente' };
        }
    };

    // ── Escenarios ──
    const nivelController = new NivelController();
    const escenariosDisponibles = nivelController.getEscenarios() || [];

    const progresosPorEscenario = progresos.reduce((acc, p) => {
        const slug = p.slug_escenario;
        if (!slug) return acc;
        if (!acc[slug]) acc[slug] = { nombre: p.nombre_escenario, slug_escenario: slug, intentos: [], completado: false };
        acc[slug].intentos.push(p);
        if (p.terminado) acc[slug].completado = true;
        return acc;
    }, {} as Record<string, { nombre: string; slug_escenario: string; intentos: typeof progresos; completado: boolean }>);

    const escenarios = Object.values(progresosPorEscenario);

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
            {/* ── Profile ── */}
            <div>
                <h1 className={styles.pageTitle}>
                    {user?.primernombre} {user?.primer_apellido}
                </h1>
                <p className={styles.meta}>{user?.correo_electronico}</p>
                {grupo && <p className={styles.meta}>{grupo.nombre}</p>}
                {!grupo && !grupoLoading && (
                    <button className={styles.linkButton} onClick={() => setIsModalOpen(true)}>
                        Unirse a un grupo
                    </button>
                )}
            </div>

            {/* ── Historial de evaluaciones ── */}
            <section className={styles.historialSection}>
                <h2 className={styles.historialTitle}>Historial de evaluaciones</h2>

                {loading ? (
                    <div className={styles.historialList}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={styles.skeletonItem} aria-hidden="true" />
                        ))}
                    </div>
                ) : escenarios.length === 0 ? (
                    <div className={styles.empty}>
                        <p className={styles.muted}>Aun no has jugado ningun escenario</p>
                        <button className={styles.linkButton} onClick={() => navigate('/seleccion-niveles')}>
                            Ir a escenarios
                        </button>
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
                                    >
                                        <div>
                                            <h3 className={styles.escenarioTitle}>{esc.nombre}</h3>
                                            <p className={styles.escenarioMeta}>
                                                {esc.intentos.length} intento{esc.intentos.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className={styles.escenarioActions}>
                                            {user?.id_estudiante && esc.slug_escenario && (
                                                <FeedbackButton
                                                    idEstudiante={user.id_estudiante}
                                                    slugEscenario={esc.slug_escenario}
                                                    onFeedbackGenerated={(feedback) => {
                                                        setFeedbackModal({ isOpen: true, feedback, escenarioNombre: esc.nombre });
                                                    }}
                                                />
                                            )}
                                            <svg
                                                className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                                                width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                                            >
                                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {open && esc.intentos.length > 0 && (
                                            <motion.div
                                                className={styles.intentosList}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                                            >
                                                {[...esc.intentos].reverse().map((intento, i) => (
                                                    <motion.div
                                                        key={intento.id_progreso}
                                                        className={styles.intentoRow}
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.12, delay: i * 0.025 }}
                                                    >
                                                        <span className={`${styles.intentoDot} ${intento.terminado ? styles.dotOk : styles.dotFail}`} />
                                                        <span className={styles.intentoNum}>{formatFecha(intento.fecha_creacion) || `Intento ${esc.intentos.length - i}`}</span>
                                                        <span className={styles.intentoTiempo}>{formatTiempo(intento.tiempo)}</span>
                                                        <span className={intento.terminado ? styles.intentoStatusOk : styles.intentoStatusFail}>
                                                            {intento.terminado ? 'Completado' : 'Fallido'}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <ModalUnirseGrupo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onJoin={handleJoinGroup}
            />
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ isOpen: false, feedback: null, escenarioNombre: '' })}
                feedback={feedbackModal.feedback}
                escenarioNombre={feedbackModal.escenarioNombre}
            />
        </div>
    );
}
