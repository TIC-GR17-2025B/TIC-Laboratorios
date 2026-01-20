import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useGroups, type Estudiante, type Grupo } from '../hooks/useGroups';
import CodigoInvitacion from '../components/CodigoInvitacion';
import { CourseAnalysisButton } from '../../course-analysis/components/CourseAnalysisButton';
import { CourseAnalysisModal } from '../../course-analysis/components/CourseAnalysisModal';
import type { CourseAnalysisResponse } from '../../course-analysis/types/courseAnalysis.types';
import styles from '../styles/DetalleGrupo.module.css';

export default function DetalleGrupo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUser, getUserRole } = useAuth();
  const user = getUser();
  const role = getUserRole();

  const idProfesor = role === 'profesor' && user ? (user as { id_profesor: number }).id_profesor : null;
  const { grupos, generateCode, removeStudent, getEstudiantesByGrupo } = useGroups(idProfesor);

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisModal, setAnalysisModal] = useState<{
    isOpen: boolean;
    analysis: CourseAnalysisResponse | null;
  }>({
    isOpen: false,
    analysis: null
  });

  useEffect(() => {
    const loadGrupo = async () => {
      if (!id) return;

      const idCurso = Number(id);
      const grupoEncontrado = grupos.find((g) => g.id_curso === idCurso);

      if (grupoEncontrado) {
        setGrupo(grupoEncontrado);
        
        const estudiantesData = await getEstudiantesByGrupo(idCurso);
        setEstudiantes(estudiantesData);
      }

      setLoading(false);
    };

    if (grupos.length > 0) {
      loadGrupo();
    }
  }, [id, grupos]);

  const handleGenerateCode = async () => {
    if (!grupo) return null;
    const newCode = await generateCode(grupo.id_curso);
    if (newCode && grupo) {
      setGrupo({ ...grupo, codigo_acceso: newCode });
    }
    return newCode;
  };

  const handleRemoveStudent = async (idEstudiante: number) => {
    if (!grupo || !window.confirm('¿Estás seguro de que deseas eliminar a este estudiante del grupo?')) {
      return;
    }

    const success = await removeStudent(grupo.id_curso, idEstudiante);
    if (success) {
      setEstudiantes(estudiantes.filter((e) => e.id_estudiante !== idEstudiante));
    }
  };

  const handleEstudianteClick = (idEstudiante: number) => {
    navigate(`/docente/estudiante/${idEstudiante}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Cargando...</p>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>Grupo no encontrado</p>
        <button onClick={() => navigate('/docente')} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/docente')} className={styles.backButton}>
          ← Volver
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.grupoHeader}>
          <div className={styles.grupoTitleSection}>
            <h1 className={styles.grupoTitle}>{grupo.nombre}</h1>
            <p className={styles.grupoSubtitle}>
              {estudiantes.length} {estudiantes.length === 1 ? 'estudiante' : 'estudiantes'} matriculado{estudiantes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <CourseAnalysisButton
            idCurso={grupo.id_curso}
            onAnalysisGenerated={(analysis) => {
              setAnalysisModal({
                isOpen: true,
                analysis
              });
            }}
          />
        </div>

        <div className={styles.codigoSection}>
          <CodigoInvitacion
            codigo={grupo.codigo_acceso}
            onGenerate={handleGenerateCode}
          />
        </div>

        <div className={styles.estudiantesSection}>
          <h3>Estudiantes</h3>

          {estudiantes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No hay estudiantes matriculados en este grupo</p>
              <p className={styles.emptySubtext}>
                Comparte el código de invitación para que los estudiantes se unan
              </p>
            </div>
          ) : (
            <div className={styles.estudiantesList}>
              {estudiantes.map((estudiante) => (
                <div
                  key={estudiante.id_estudiante}
                  className={styles.estudianteCard}
                >
                  <div
                    className={styles.estudianteClickable}
                    onClick={() => handleEstudianteClick(estudiante.id_estudiante)}
                  >
                    <div className={styles.estudianteAvatar}>
                      {estudiante.primernombre[0]}{estudiante.primer_apellido[0]}
                    </div>
                    <div className={styles.estudianteInfo}>
                      <h4>
                        {estudiante.primernombre} {estudiante.segundo_nombre || ''}{' '}
                        {estudiante.primer_apellido} {estudiante.segundo_apellido || ''}
                      </h4>
                      <p className={styles.estudianteCodigo}>
                        Código: {estudiante.codigo_unico}
                      </p>
                      <p className={styles.estudianteCorreo}>
                        {estudiante.correo_electronico}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(estudiante.id_estudiante)}
                    className={styles.removeButton}
                    title="Eliminar estudiante"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {analysisModal.analysis && (
        <CourseAnalysisModal
          isOpen={analysisModal.isOpen}
          onClose={() => setAnalysisModal({ ...analysisModal, isOpen: false })}
          analysis={analysisModal.analysis}
          cursoNombre={grupo.nombre}
        />
      )}
    </div>
  );
}
