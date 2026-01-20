import { useGenerateCourseAnalysis } from '../hooks/useGenerateCourseAnalysis';
import type { CourseAnalysisResponse } from '../types/courseAnalysis.types';
import styles from '../styles/CourseAnalysisButton.module.css';

interface CourseAnalysisButtonProps {
  idCurso: number;
  onAnalysisGenerated?: (analysis: CourseAnalysisResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function CourseAnalysisButton({ 
  idCurso, 
  onAnalysisGenerated, 
  onError,
  className 
}: CourseAnalysisButtonProps) {
  const { generateAnalysis, loading } = useGenerateCourseAnalysis();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const response = await generateAnalysis(idCurso);

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
          <span className={styles.spinner}></span>
          <span>Generando análisis...</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span>Analizar Curso</span>
        </>
      )}
    </button>
  );
}
