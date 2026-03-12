import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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

    const nombre = user?.primernombre || user?.nombre_completo || 'Docente';

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <span className={styles.greeting}>Hola, {nombre}</span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Cerrar sesión
                </button>
            </header>

            <main className={styles.main}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Mis Grupos</h2>
                    <span className={styles.count}>
                        {!loading && grupos.length > 0 && grupos.length}
                    </span>
                </div>

                {error && <p className={styles.errorText}>{error}</p>}

                {!loading && !error && grupos.length === 0 && (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>No tienes grupos todavía</p>
                        <p className={styles.emptyHint}>
                            Crea un grupo y comparte el código de acceso con tus estudiantes.
                        </p>
                        <button onClick={handleCreateGrupo} className={styles.primaryButton}>
                            Crear grupo
                        </button>
                    </div>
                )}

                {!loading && !error && grupos.length > 0 && (
                    <>
                        <div className={styles.gruposList}>
                            {grupos.map((grupo) => (
                                <div
                                    key={grupo.id_curso}
                                    className={styles.grupoCard}
                                    onClick={() => handleGrupoClick(grupo.id_curso)}
                                >
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.grupoName}>{grupo.nombre}</h3>
                                        <div className={styles.cardActions}>
                                            <button
                                                onClick={(e) => handleEditGrupo(e, grupo)}
                                                className={styles.iconButton}
                                                title="Editar grupo"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteGrupo(e, grupo.id_curso)}
                                                className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                                title="Eliminar grupo"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <span className={styles.codeBadge}>
                                        {grupo.codigo_acceso || 'Sin código'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleCreateGrupo} className={styles.primaryButton}>
                            Crear grupo
                        </button>
                    </>
                )}
            </main>

            <ModalGrupo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveGrupo}
                grupoActual={grupoEditar}
            />
        </div>
    );
}
