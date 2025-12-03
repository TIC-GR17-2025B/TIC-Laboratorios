import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useProgresoEstudiante } from '../hooks/useEstudiantes';
import styles from '../styles/VistaDetalleEstudiante.module.css';

// Hook para obtener escenarios
const useEscenarios = () => {
    const [escenarios, setEscenarios] = useState<Escenario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEscenarios = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/escenarios");
                if (!response.ok) throw new Error("Error al obtener escenarios");
                const result = await response.json();
                setEscenarios(result.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error de conexión");
            } finally {
                setLoading(false);
            }
        };
        fetchEscenarios();
    }, []);

    return { escenarios, loading, error };
};

interface Escenario {
    id: number;
    titulo: string;
    descripcion: string;
    imagenPreview: string;
}

export default function VistaDetalleEstudiante() {
    const { idEstudiante } = useParams<{ idEstudiante: string }>();
    const navigate = useNavigate();
    const [expandedEscenario, setExpandedEscenario] = useState<number | null>(null);

    const { progresos, loading: loadingProgresos, error: errorProgresos } =
        useProgresoEstudiante(idEstudiante ? parseInt(idEstudiante) : null);

    const { escenarios, loading: loadingEscenarios, error: errorEscenarios } = useEscenarios();

    const handleBack = () => {
        navigate('/docente');
    };

    const toggleEscenario = (escenarioId: number) => {
        setExpandedEscenario(expandedEscenario === escenarioId ? null : escenarioId);
    };

    const getProgresosPorEscenario = (escenarioId: number) => {
        return progresos.filter(p => p.id_escenario === escenarioId);
    };

    const formatearTiempo = (segundos: number) => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}m ${segs}s`;
    };

    const loading = loadingProgresos || loadingEscenarios;
    const error = errorProgresos || errorEscenarios;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={handleBack} className={styles.backButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                    </svg>
                    Volver
                </button>
                <h1>Progreso del Estudiante</h1>
            </div>

            <div className={styles.content}>
                {loading && <p className={styles.loadingText}>Cargando información...</p>}
                {error && <p className={styles.errorText}>{error}</p>}

                {!loading && !error && (
                    <div>
                        <h2>Escenarios</h2>
                        <div className={styles.escenariosList}>
                            {escenarios.map((escenario: Escenario) => {
                                const progresosEscenario = getProgresosPorEscenario(escenario.id);
                                const completado = progresosEscenario.some(p => p.terminado);
                                const intentos = progresosEscenario.length;
                                const isExpanded = expandedEscenario === escenario.id;

                                return (
                                    <div key={escenario.id} className={styles.escenarioCard}>
                                        <div
                                            className={styles.escenarioHeader}
                                            onClick={() => intentos > 0 && toggleEscenario(escenario.id)}
                                            style={{ cursor: intentos > 0 ? 'pointer' : 'default' }}
                                        >
                                            <div className={styles.escenarioInfo}>
                                                <h3>{escenario.titulo}</h3>
                                                <p className={styles.escenarioDescripcion}>
                                                    {escenario.descripcion}
                                                </p>
                                            </div>
                                            <div className={styles.escenarioStatus}>
                                                {completado ? (
                                                    <span className={styles.badgeCompletado}>
                                                        Completado
                                                    </span>
                                                ) : intentos > 0 ? (
                                                    <span className={styles.badgeIntentado}>
                                                        {intentos} intento{intentos > 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span className={styles.badgeNoIntentado}>
                                                        No intentado
                                                    </span>
                                                )}
                                                {intentos > 0 && (
                                                    <svg
                                                        className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && progresosEscenario.length > 0 && (
                                            <div className={styles.escenarioDetails}>
                                                <div className={styles.intentosList}>
                                                    {progresosEscenario.map((progreso, index) => (
                                                        <div key={progreso.id_progreso} className={styles.intentoItem}>
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
                                                                    <span>{formatearTiempo(progreso.tiempo)}</span>
                                                                </div>

                                                            </div>
                                                            <div className={styles.intentoFecha}>
                                                                <span className={progreso.terminado ? styles.intentoExito : styles.intentoFallo}>
                                                                    {progreso.terminado ? 'Completado' : 'No completado'}
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
                    </div>
                )}
            </div>
        </div>
    );
}
