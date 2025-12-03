import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEstudiantes } from '../hooks/useEstudiantes';
import styles from '../styles/VistaDocente.module.css';

export default function VistaDocente() {
    const { getUser, logout, getUserRole } = useAuth();
    const navigate = useNavigate();
    const user = getUser();
    const role = getUserRole();

    const idProfesor = role === 'profesor' && user ? (user as any).id_profesor : null;
    const { estudiantes, loading, error } = useEstudiantes(idProfesor);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleEstudianteClick = (idEstudiante: number) => {
        navigate(`/docente/estudiante/${idEstudiante}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Bienvenido, {user?.primernombre || 'Docente'}.</h2>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Cerrar Sesión
                </button>
            </div>
            <div className={styles.content}>
                <h3>Mis Estudiantes</h3>
                {loading && <p className={styles.loadingText}>Cargando estudiantes...</p>}
                {error && <p className={styles.errorText}>{error}</p>}

                {!loading && !error && estudiantes.length === 0 && (
                    <p className={styles.emptyText}>No tienes estudiantes asignados</p>
                )}

                {!loading && !error && estudiantes.length > 0 && (
                    <div className={styles.estudiantesList}>
                        {estudiantes.map((estudiante) => (
                            <div
                                key={estudiante.id_estudiante}
                                className={styles.estudianteCard}
                                onClick={() => handleEstudianteClick(estudiante.id_estudiante)}
                            >
                                <div className={styles.estudianteAvatar}>
                                    {estudiante.primernombre[0]}{estudiante.primer_apellido[0]}
                                </div>
                                <div className={styles.estudianteInfo}>
                                    <h4>
                                        {estudiante.primernombre} {estudiante.segundo_nombre} {estudiante.primer_apellido} {estudiante.segundo_apellido}
                                    </h4>
                                    <p className={styles.estudianteCodigo}>
                                        Código: {estudiante.codigo_unico}
                                    </p>
                                    <p className={styles.estudianteCorreo}>
                                        {estudiante.correo_electronico}
                                    </p>
                                </div>
                                <svg
                                    className={styles.arrowIcon}
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                </svg>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}