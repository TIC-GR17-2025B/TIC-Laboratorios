import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useGroups } from '../hooks/useGroups';
import ModalGrupo from '../components/ModalGrupo';
import styles from '../styles/VistaDocente.module.css';

export default function VistaDocente() {
    const { getUser, logout, getUserRole } = useAuth();
    const navigate = useNavigate();
    const user = getUser();
    const role = getUserRole();

    const idProfesor = role === 'profesor' && user ? (user as { id_profesor: number }).id_profesor : null;
    const { grupos, loading, error, createGrupo, updateGrupo, deleteGrupo } = useGroups(idProfesor);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [grupoEditar, setGrupoEditar] = useState<{ id_curso: number; nombre: string } | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGrupoClick = (idCurso: number) => {
        navigate(`/docente/grupo/${idCurso}`);
    };

    const handleCreateGrupo = () => {
        setGrupoEditar(null);
        setIsModalOpen(true);
    };

    const handleEditGrupo = (e: React.MouseEvent, grupo: { id_curso: number; nombre: string }) => {
        e.stopPropagation();
        setGrupoEditar(grupo);
        setIsModalOpen(true);
    };

    const handleDeleteGrupo = async (e: React.MouseEvent, idCurso: number) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que deseas eliminar este grupo?')) {
            await deleteGrupo(idCurso);
        }
    };

    const handleSaveGrupo = async (nombre: string) => {
        if (grupoEditar) {
            return await updateGrupo(grupoEditar.id_curso, nombre);
        } else {
            return await createGrupo(nombre);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Bienvenido, {user?.primernombre || user?.nombre_completo || 'Docente'}.</h2>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Cerrar Sesión
                </button>
            </div>
            <div className={styles.content}>
                <div className={styles.headerSection}>
                    <h3>Mis Grupos</h3>
                    <button onClick={handleCreateGrupo} className={styles.createButton}>
                        + Crear Grupo
                    </button>
                </div>
                
                {loading && <p className={styles.loadingText}>Cargando grupos...</p>}
                {error && <p className={styles.errorText}>{error}</p>}

                {!loading && !error && grupos.length === 0 && (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>No tienes grupos creados</p>
                        <p className={styles.emptySubtext}>Crea tu primer grupo para empezar a gestionar estudiantes</p>
                    </div>
                )}

                {!loading && !error && grupos.length > 0 && (
                    <div className={styles.gruposList}>
                        {grupos.map((grupo) => (
                            <div
                                key={grupo.id_curso}
                                className={styles.grupoCard}
                                onClick={() => handleGrupoClick(grupo.id_curso)}
                            >
                                <div className={styles.grupoIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
                                    </svg>
                                </div>
                                <div className={styles.grupoInfo}>
                                    <h4>{grupo.nombre}</h4>
                                    <p className={styles.grupoCodigo}>
                                        {grupo.codigo_acceso 
                                            ? `Código: ${grupo.codigo_acceso}` 
                                            : 'Sin código de acceso'}
                                    </p>
                                </div>
                                <div className={styles.grupoActions}>
                                    <button
                                        onClick={(e) => handleEditGrupo(e, grupo)}
                                        className={styles.editButton}
                                        title="Editar grupo"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteGrupo(e, grupo.id_curso)}
                                        className={styles.deleteButton}
                                        title="Eliminar grupo"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                        </svg>
                                    </button>
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

            <ModalGrupo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveGrupo}
                grupoActual={grupoEditar}
            />
        </div>
    );
}