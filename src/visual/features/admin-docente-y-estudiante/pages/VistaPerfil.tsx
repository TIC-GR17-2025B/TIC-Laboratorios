import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useProgresoEstudiante } from '../hooks/useEstudiantes';
import { FeedbackButton } from '../../feedback/components/FeedbackButton';
import { FeedbackModal } from '../../feedback/components/FeedbackModal';
import { NivelController } from '../../../../ecs/controllers/NivelController';
import styles from '../styles/VistaPerfil.module.css';

interface FeedbackData {
    analisis: string;
    fortaleza: string;
    area_mejora: string;
    consejo: string;
}

export default function VistaPerfil() {
    const navigate = useNavigate();
    const { getUser } = useAuth();
    const user = getUser();

    const { progresos, loading } = useProgresoEstudiante(user?.id_estudiante || null);
    const [expandedEscenario, setExpandedEscenario] = useState<number | null>(null);

    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        feedback: FeedbackData | null;
        escenarioNombre: string;
    }>({
        isOpen: false,
        feedback: null,
        escenarioNombre: ''
    });

    // Obtener escenarios del NivelController para usar los nombres correctos
    const nivelController = new NivelController();
    const escenariosDisponibles = nivelController.getEscenarios() || [];

    // Función para obtener el id del escenario por nombre (fallback si id_escenario no viene del backend)
    const getIdEscenarioByNombre = (nombreEscenario: string): number | null => {
        const escenario = escenariosDisponibles.find(e =>
            e.titulo.toLowerCase() === nombreEscenario.toLowerCase() ||
            e.titulo.toLowerCase().includes(nombreEscenario.toLowerCase()) ||
            nombreEscenario.toLowerCase().includes(e.titulo.toLowerCase())
        );
        return escenario?.id || null;
    };

    // Función para obtener el nombre correcto del escenario por su ID
    const getNombreEscenario = (idEscenario: number): string => {
        const escenario = escenariosDisponibles.find(e => e.id === idEscenario);
        return escenario?.titulo || `Escenario ${idEscenario}`;
    };

    // Agrupar progresos por escenario
    const progresosPorEscenario = progresos.reduce((acc, progreso) => {
        // Si no hay id_escenario, intentar obtenerlo del nombre
        const idEscenario = progreso.id_escenario || getIdEscenarioByNombre(progreso.nombre_escenario);

        if (!idEscenario) return acc; // Saltar si no se puede determinar el escenario

        const key = idEscenario.toString();
        if (!acc[key]) {
            acc[key] = {
                nombre: getNombreEscenario(idEscenario),
                id_escenario: idEscenario,
                intentos: [],
                completado: false
            };
        }
        acc[key].intentos.push(progreso);
        if (progreso.terminado) {
            acc[key].completado = true;
        }
        return acc;
    }, {} as Record<string, { nombre: string; id_escenario: number; intentos: typeof progresos; completado: boolean }>);

    const escenarios = Object.values(progresosPorEscenario);

    const formatTiempo = (tiempo: number | null) => {
        if (tiempo === null) return '--:--';
        const minutos = Math.floor(tiempo / 60);
        const segundos = Math.floor(tiempo % 60);
        return `${minutos}m ${segundos}s`;
    };

    const toggleEscenario = (escenarioId: number) => {
        setExpandedEscenario(expandedEscenario === escenarioId ? null : escenarioId);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate('/seleccion-niveles')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                    </svg>
                </button>
                <h1>Mi Perfil</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarLarge}>
                        {user?.primernombre?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className={styles.profileInfo}>
                        <h2 className={styles.profileName}>
                            {user?.primernombre} {user?.segundo_nombre} {user?.primer_apellido} {user?.segundo_apellido}
                        </h2>
                        <p className={styles.profileEmail}>{user?.correo_electronico}</p>
                        <p className={styles.profileCode}>Código: {user?.codigo_unico}</p>
                    </div>
                </div>

                <div className={styles.statsSection}>
                    <h2 className={styles.sectionTitle}>Estadísticas Generales</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{escenarios.length}</span>
                            <span className={styles.statLabel}>Escenarios Jugados</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{escenarios.filter(e => e.completado).length}</span>
                            <span className={styles.statLabel}>Completados</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{progresos.length}</span>
                            <span className={styles.statLabel}>Intentos Totales</span>
                        </div>
                    </div>
                </div>

                <div className={styles.progressSection}>
                    <h2 className={styles.sectionTitle}>Progreso por Escenario</h2>

                    {loading ? (
                        <div className={styles.loadingState}>Cargando progreso...</div>
                    ) : escenarios.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            <p>Aún no has jugado ningún escenario</p>
                            <button onClick={() => navigate('/seleccion-niveles')}>
                                Ir a Selección de Niveles
                            </button>
                        </div>
                    ) : (
                        <div className={styles.escenariosList}>
                            {escenarios.map((escenario) => {
                                const isExpanded = expandedEscenario === escenario.id_escenario;
                                const intentos = escenario.intentos.length;

                                return (
                                    <div key={escenario.id_escenario} className={styles.escenarioCard}>

                                        <div className={styles.escenarioHeader}>
                                            <div
                                                className={styles.escenarioClickArea}
                                                onClick={() => toggleEscenario(escenario.id_escenario)}
                                            >
                                                <div className={styles.escenarioInfo}>
                                                    <h3>{escenario.nombre}</h3>
                                                </div>
                                                <div className={styles.escenarioStatus}>
                                                    {user?.id_estudiante && escenario.id_escenario && (
                                                        <div className={styles.feedbackButtonWrapper}>
                                                            <FeedbackButton
                                                                idEstudiante={user.id_estudiante}
                                                                idEscenario={escenario.id_escenario}
                                                                onFeedbackGenerated={(feedback) => {
                                                                    setFeedbackModal({
                                                                        isOpen: true,
                                                                        feedback,
                                                                        escenarioNombre: escenario.nombre
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    {escenario.completado ? (
                                                        <span className={styles.badgeCompletado}>
                                                            Completado
                                                        </span>
                                                    ) : (
                                                        <span className={styles.badgeIntentado}>
                                                            {intentos} intento{intentos > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                    <svg
                                                        className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                                    </svg>
                                                </div>
                                            </div>

                                        </div>

                                        {isExpanded && (
                                            <div className={styles.escenarioDetails}>
                                                <div className={styles.intentosList}>
                                                    {escenario.intentos.map((intento, index) => (
                                                        <div key={intento.id_progreso} className={styles.intentoItem}>
                                                            <div className={styles.intentoNumero}>
                                                                Intento {index + 1}
                                                            </div>
                                                            <div className={styles.intentoInfo}>
                                                                <div className={styles.intentoTiempo}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"><path fill="currentColor"
                                                                            d="M12 21a8 8 0 1 1 8-8a8.01 8.01 0 0 1-8 8Zm0-14a6 6 0 1 0 6 6a6.007 6.007 0 0 0-6-6Zm1 7h-2V9h2v5Zm6.293-6.293l-2-2l1.414-1.414l2 2l-1.413 1.413l-.001.001ZM15 4H9V2h6v2Z" /></svg>
                                                                    <span>{formatTiempo(intento.tiempo)}</span>
                                                                </div>
                                                            </div>
                                                            <div className={styles.intentoFecha}>
                                                                <span className={intento.terminado ? styles.intentoExito : styles.intentoFallo}>
                                                                    {intento.terminado ? 'Completado' : 'No completado'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ isOpen: false, feedback: null, escenarioNombre: '' })}
                feedback={feedbackModal.feedback}
                escenarioNombre={feedbackModal.escenarioNombre}
            />
        </div>
    );
}
