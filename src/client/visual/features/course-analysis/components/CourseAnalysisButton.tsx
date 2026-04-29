import { useGenerateCourseAnalysis } from '../hooks/useGenerateCourseAnalysis';
import type { CourseAnalysisResponse } from '../types/courseAnalysis.types';
import styles from '../styles/CourseAnalysisButton.module.css';

interface CourseAnalysisButtonProps {
  idCurso: number;
  idProfesor: number;
  onAnalysisGenerated?: (analysis: CourseAnalysisResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function CourseAnalysisButton({
  idCurso,
  idProfesor,
  onAnalysisGenerated,
  onError,
  className
}: CourseAnalysisButtonProps) {
  const { generateAnalysis, loading } = useGenerateCourseAnalysis();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const response = await generateAnalysis(idCurso, idProfesor);

    if (response.success && response.analysis) {
      onAnalysisGenerated?.(response.analysis);
    } else if (response.error) {
      onError?.(response.error);
    }
  };

  return (
    <button
      className={`${styles.analysisButton} ${className || ''}`}
      onClick={handleClick}
      disabled={loading}
      title={loading ? 'Generando análisis...' : 'Generar análisis del curso con IA'}
    >
      {loading ? (
        <>
          <span className={styles.spinner} />
          <span>Generando...</span>
        </>
      ) : (
        <span className={styles.label}>Analizar Curso</span>
      )}
    </button>
  );
}
