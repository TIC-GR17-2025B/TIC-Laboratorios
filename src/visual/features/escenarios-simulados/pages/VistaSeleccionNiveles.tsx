import { useState, useEffect } from "react";
import { useAuth } from "../../admin-docente-y-estudiante/hooks/useAuth";
import { useProgresoEstudiante, type Progreso } from "../../admin-docente-y-estudiante/hooks/useEstudiantes";
import ModalUnirseGrupo from "../../admin-docente-y-estudiante/components/ModalUnirseGrupo";
import UserMenu from "../../admin-docente-y-estudiante/components/UserMenu";
import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import { NivelController } from "../../../../ecs/controllers/NivelController";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = API_BASE_URL;

type Tab = "escenarios" | "progreso" | "grupo";

const TAB_ICONS: Record<Tab, React.ReactNode> = {
    escenarios: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>,
    progreso: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    grupo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
};

const TABS: { key: Tab; label: string }[] = [
    { key: "escenarios", label: "Escenarios" },
    { key: "progreso", label: "Mi Progreso" },
    { key: "grupo", label: "Mi Grupo" },
];

export default function VistaSeleccionNiveles() {
    const { getUser, getUserRole } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("escenarios");

    const user = getUser();
    const role = getUserRole();
    const idEstudiante = role === 'estudiante' && user ? (user as { id_estudiante: number }).id_estudiante : null;

    const handleJoinGroup = async (codigo: string): Promise<{ success: boolean; error?: string }> => {
        if (!idEstudiante) {
            return { success: false, error: 'No se pudo identificar al estudiante' };
        }

        try {
            const response = await fetch(`${API_URL}/groups/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo_acceso: codigo, id_estudiante: idEstudiante }),
            });

            if (!response.ok) {
                const result = await response.json();
                const errorMessage = result.error || 'Error al unirse al grupo';

                if (errorMessage.includes('ya está matriculado') || errorMessage.includes('ya pertenece')) {
                    return { success: false, error: 'Ya perteneces a este grupo' };
                } else if (errorMessage.includes('código') || errorMessage.includes('no encontrado')) {
                    return { success: false, error: 'Código inválido o grupo no encontrado' };
                } else if (errorMessage.includes('expirado')) {
                    return { success: false, error: 'El código de invitación ha expirado' };
                }

                return { success: false, error: errorMessage };
            }

            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión. Inténtalo nuevamente' };
        }
    };

    return <div className={styles.container}>
        <nav className={styles.navbar}>
            <div className={styles.navTabs}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={activeTab === tab.key ? styles.navTabActive : styles.navTab}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {TAB_ICONS[tab.key]}
                        {tab.label}
                    </button>
                ))}
            </div>
            <UserMenu />
        </nav>

        <div className={styles.main}>
            <AnimatePresence mode="wait">
                {activeTab === "escenarios" && (
                    <motion.div
                        key="escenarios"
                        className={styles.tabContent}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <LevelSelectionMenuList />
                    </motion.div>
                )}
                {activeTab === "progreso" && (
                    <motion.div
                        key="progreso"
                        className={styles.tabContent}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TabProgreso idEstudiante={idEstudiante} />
                    </motion.div>
                )}
                {activeTab === "grupo" && (
                    <motion.div
                        key="grupo"
                        className={styles.tabContent}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TabGrupo idEstudiante={idEstudiante} onJoinClick={() => setIsModalOpen(true)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <ModalUnirseGrupo
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onJoin={handleJoinGroup}
        />
    </div>
}

/* ─── Tab: Mi Progreso ─── */

function TabProgreso({ idEstudiante }: { idEstudiante: number | null }) {
    const { progresos, loading } = useProgresoEstudiante(idEstudiante);
    const [escenarioNames, setEscenarioNames] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        const controller = new NivelController();
        const escenarios = controller.getEscenarios();
        if (escenarios) {
            const map = new Map<number, string>();
            escenarios.forEach(e => map.set(e.id, e.titulo));
            setEscenarioNames(map);
        }
    }, []);

    if (loading) return <div className={styles.emptyState}><p className={styles.emptyText}>Cargando progreso...</p></div>;

    // Agrupar por escenario
    const byEscenario = new Map<number, Progreso[]>();
    progresos.forEach(p => {
        const arr = byEscenario.get(p.id_escenario) || [];
        arr.push(p);
        byEscenario.set(p.id_escenario, arr);
    });

    const totalEscenarios = escenarioNames.size;
    const completados = [...byEscenario.values()].filter(arr => arr.some(p => p.terminado)).length;
    const totalIntentos = progresos.length;

    const formatTime = (seconds: number | null) => {
        if (!seconds) return "--:--";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    return <>
        {/* Stats */}
        <div className={styles.statsRow}>
            <div className={styles.statCard}>
                <span className={styles.statValue}>{completados}/{totalEscenarios}</span>
                <span className={styles.statLabel}>Escenarios completados</span>
            </div>
            <div className={styles.statCard}>
                <span className={styles.statValue}>{totalIntentos}</span>
                <span className={styles.statLabel}>Intentos totales</span>
            </div>
            <div className={styles.statCard}>
                <span className={styles.statValue}>
                    {progresos.length > 0
                        ? formatTime(Math.min(...progresos.filter(p => p.terminado && p.tiempo).map(p => p.tiempo!)) || null)
                        : "--:--"
                    }
                </span>
                <span className={styles.statLabel}>Mejor tiempo</span>
            </div>
        </div>

        {/* Lista de escenarios */}
        <div className={styles.progressList}>
            {[...escenarioNames.entries()].map(([id, nombre]) => {
                const intentos = byEscenario.get(id) || [];
                const completado = intentos.some(p => p.terminado);
                const mejorTiempo = intentos.filter(p => p.terminado && p.tiempo).map(p => p.tiempo!);
                const mejor = mejorTiempo.length > 0 ? Math.min(...mejorTiempo) : null;

                return <div key={id} className={styles.progressItem}>
                    <div className={styles.progressStatus}>
                        <div className={`${styles.statusDot} ${completado ? styles.statusDotDone : ""}`} />
                    </div>
                    <div className={styles.progressInfo}>
                        <span className={styles.progressName}>{nombre}</span>
                        <span className={styles.progressMeta}>
                            {intentos.length} {intentos.length === 1 ? "intento" : "intentos"}
                            {mejor !== null && <> &middot; Mejor: {formatTime(mejor)}</>}
                        </span>
                    </div>
                    <span className={completado ? styles.progressBadgeDone : styles.progressBadgePending}>
                        {completado ? "Completado" : "Pendiente"}
                    </span>
                </div>;
            })}
        </div>

        {progresos.length === 0 && !loading && (
            <div className={styles.emptyState}>
                <p className={styles.emptyText}>Aún no has jugado ningún escenario</p>
                <p className={styles.emptySubtext}>Selecciona un escenario en la pestaña "Escenarios" para comenzar</p>
            </div>
        )}
    </>;
}

/* ─── Tab: Mi Grupo ─── */

interface GrupoInfo {
    id_curso: number;
    nombre: string;
    nombre_profesor: string;
}

function TabGrupo({ idEstudiante, onJoinClick }: { idEstudiante: number | null; onJoinClick: () => void }) {
    const [grupos, setGrupos] = useState<GrupoInfo[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!idEstudiante) return;
        setLoading(true);
        fetch(`${API_URL}/groups/estudiante/${idEstudiante}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(result => setGrupos(result.data || []))
            .catch(() => setGrupos([]))
            .finally(() => setLoading(false));
    }, [idEstudiante]);

    if (loading) return <div className={styles.emptyState}><p className={styles.emptyText}>Cargando...</p></div>;

    if (grupos.length === 0) {
        return <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className={styles.emptyText}>No perteneces a ningún grupo</p>
            <p className={styles.emptySubtext}>Únete a un grupo con un código de invitación de tu docente</p>
            <button className={styles.emptyAction} onClick={onJoinClick}>
                Unirse a un grupo
            </button>
        </div>;
    }

    return <div className={styles.groupList}>
        {grupos.map(g => (
            <div key={g.id_curso} className={styles.groupCard}>
                <div className={styles.groupIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
                <div className={styles.groupInfo}>
                    <span className={styles.groupName}>{g.nombre}</span>
                    {g.nombre_profesor && <span className={styles.groupProf}>Docente: {g.nombre_profesor}</span>}
                </div>
            </div>
        ))}
    </div>;
}
