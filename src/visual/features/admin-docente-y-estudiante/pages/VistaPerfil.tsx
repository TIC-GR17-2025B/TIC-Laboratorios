import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useProgresoEstudiante } from '../hooks/useEstudiantes';
import { FeedbackButton } from '../../feedback/components/FeedbackButton';
import { FeedbackModal } from '../../feedback/components/FeedbackModal';
import ModalUnirseGrupo from '../components/ModalUnirseGrupo';
import { NivelController } from '../../../../ecs/controllers/NivelController';
import { API_BASE_URL } from '../../../common/utils/apiConfig';
import styles from '../styles/VistaPerfil.module.css';

interface FeedbackData {
    analisis: string;
    fortaleza: string;
    area_mejora: string;
    consejo: string;
}

interface GrupoInfo {
    id_curso: number;
    nombre: string;
    nombre_profesor: string;
}

export default function VistaPerfil() {
    const navigate = useNavigate();
    const { getUser, getUserRole } = useAuth();
    const user = getUser();
    const role = getUserRole();
    const idEstudiante = role === 'estudiante' && user ? (user as { id_estudiante: number }).id_estudiante : null;

    const { progresos, loading } = useProgresoEstudiante(user?.id_estudiante || null);
    const [expandedEscenario, setExpandedEscenario] = useState<number | null>(null);
    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        feedback: FeedbackData | null;
        escenarioNombre: string;
    }>({ isOpen: false, feedback: null, escenarioNombre: '' });

    // ── Grupo (uno solo) ──
    const [grupo, setGrupo] = useState<GrupoInfo | null>(null);
    const [grupoLoading, setGrupoLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!idEstudiante) return;
        setGrupoLoading(true);
        fetch(`${API_BASE_URL}/groups/estudiante/${idEstudiante}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(result => {
                const list = result.data || [];
                setGrupo(list.length > 0 ? list[0] : null);
            })
            .catch(() => setGrupo(null))
            .finally(() => setGrupoLoading(false));
    }, [idEstudiante]);

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
            const refreshRes = await fetch(`${API_BASE_URL}/groups/estudiante/${idEstudiante}`);
            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const list = refreshData.data || [];
                setGrupo(list.length > 0 ? list[0] : null);
            }
            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión. Inténtalo nuevamente' };
        }
    };

    // ── Escenarios ──
    const nivelController = new NivelController();
    const escenariosDisponibles = nivelController.getEscenarios() || [];

    const getIdEscenarioByNombre = (nombre: string): number | null => {
        const e = escenariosDisponibles.find(e =>
            e.titulo.toLowerCase() === nombre.toLowerCase() ||
            e.titulo.toLowerCase().includes(nombre.toLowerCase()) ||
            nombre.toLowerCase().includes(e.titulo.toLowerCase())
        );
        return e?.id || null;
    };

    const getNombreEscenario = (id: number): string => {
        return escenariosDisponibles.find(e => e.id === id)?.titulo || `Escenario ${id}`;
    };

    const progresosPorEscenario = progresos.reduce((acc, p) => {
        const id = p.id_escenario || getIdEscenarioByNombre(p.nombre_escenario);
        if (!id) return acc;
        const key = id.toString();
        if (!acc[key]) acc[key] = { nombre: getNombreEscenario(id), id_escenario: id, intentos: [], completado: false };
        acc[key].intentos.push(p);
        if (p.terminado) acc[key].completado = true;
        return acc;
    }, {} as Record<string, { nombre: string; id_escenario: number; intentos: typeof progresos; completado: boolean }>);

    const escenarios = Object.values(progresosPorEscenario);
    const completados = escenarios.filter(e => e.completado).length;

    const formatTiempo = (t: number | null) => {
        if (t === null) return '--:--';
        return `${Math.floor(t / 60)}m ${Math.floor(t % 60)}s`;
    };

    return (
        <div className={styles.main}>
            {/* ── Profile ── */}
            <div className={styles.profileRow}>
                <div className={styles.avatar}>
                    {user?.primernombre?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <h1 className={styles.pageTitle}>
                        {user?.primernombre} {user?.primer_apellido}
                    </h1>
                    <p className={styles.meta}>{user?.correo_electronico}</p>
                    {user?.codigo_unico && (
                        <p className={styles.code}>{user.codigo_unico}</p>
                    )}
                </div>
            </div>

            {/* ── Stats (inline) ── */}
            <div className={styles.statsRow}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{escenarios.length}</span>
                    <span className={styles.statLabel}>jugados</span>
                </div>
                <span className={styles.statDivider} />
                <div className={styles.stat}>
                    <span className={styles.statValue}>{completados}</span>
                    <span className={styles.statLabel}>completados</span>
                </div>
                <span className={styles.statDivider} />
                <div className={styles.stat}>
                    <span className={styles.statValue}>{progresos.length}</span>
                    <span className={styles.statLabel}>intentos</span>
                </div>
            </div>

            {/* ── Progreso ── */}
            <section>
                <h2 className={styles.sectionTitle}>Progreso</h2>

                {loading ? (
                    <p className={styles.muted}>Cargando...</p>
                ) : escenarios.length === 0 ? (
                    <div className={styles.empty}>
                        <p className={styles.muted}>Aún no has jugado ningún escenario</p>
                        <button className={styles.linkButton} onClick={() => navigate('/seleccion-niveles')}>
                            Ir a escenarios
                        </button>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {escenarios.map((esc) => {
                            const open = expandedEscenario === esc.id_escenario;
                            return (
                                <div key={esc.id_escenario} className={styles.card}>
                                    <div
                                        className={styles.cardHeader}
                                        onClick={() => setExpandedEscenario(open ? null : esc.id_escenario)}
                                    >
                                        <span className={styles.cardTitle}>{esc.nombre}</span>
                                        <div className={styles.cardActions}>
                                            {user?.id_estudiante && esc.id_escenario && (
                                                <FeedbackButton
                                                    idEstudiante={user.id_estudiante}
                                                    idEscenario={esc.id_escenario}
                                                    onFeedbackGenerated={(feedback) => {
                                                        setFeedbackModal({ isOpen: true, feedback, escenarioNombre: esc.nombre });
                                                    }}
                                                />
                                            )}
                                            <span className={esc.completado ? styles.badgeDone : styles.badgePending}>
                                                {esc.completado ? 'Completado' : `${esc.intentos.length} intento${esc.intentos.length > 1 ? 's' : ''}`}
                                            </span>
                                            <svg
                                                className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                                                width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                                            >
                                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {open && (
                                        <div className={styles.cardBody}>
                                            {esc.intentos.map((intento, i) => (
                                                <div key={intento.id_progreso} className={styles.intentoRow}>
                                                    <span className={styles.intentoLabel}>Intento {i + 1}</span>
                                                    <span className={styles.muted}>{formatTiempo(intento.tiempo)}</span>
                                                    <span className={intento.terminado ? styles.intentoOk : styles.intentoFail}>
                                                        {intento.terminado ? 'Completado' : 'No completado'}
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

            {/* ── Grupo ── */}
            <section>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Mi Grupo</h2>
                    {!grupo && !grupoLoading && (
                        <button className={styles.secondaryButton} onClick={() => setIsModalOpen(true)}>
                            Unirse a un grupo
                        </button>
                    )}
                </div>

                {grupoLoading ? (
                    <p className={styles.muted}>Cargando...</p>
                ) : !grupo ? (
                    <div className={styles.empty}>
                        <p className={styles.muted}>No perteneces a ningún grupo</p>
                        <p className={styles.hint}>Únete con un código de invitación de tu docente</p>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>{grupo.nombre}</span>
                            {grupo.nombre_profesor && (
                                <span className={styles.muted}>{grupo.nombre_profesor}</span>
                            )}
                        </div>
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
