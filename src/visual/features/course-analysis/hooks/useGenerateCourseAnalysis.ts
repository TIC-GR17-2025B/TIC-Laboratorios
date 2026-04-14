import { useState } from 'react';
import type { CourseAnalysisResponse } from '../types/courseAnalysis.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UseGenerateCourseAnalysisResult {
  generateAnalysis: (idCurso: number, idProfesor: number) => Promise<{ success: boolean; analysis?: CourseAnalysisResponse; error?: string }>;
  checkLatestAnalysis: (idCurso: number) => Promise<{ success: boolean; analysis?: CourseAnalysisResponse }>;
  loading: boolean;
  error: string | null;
}

export function useGenerateCourseAnalysis(): UseGenerateCourseAnalysisResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async (idCurso: number, idProfesor: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/course-analysis/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_curso: idCurso, id_profesor: idProfesor }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Error al generar el análisis';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (data.success && data.data) {
        return { success: true, analysis: data.data };
      } else {
        setError('Respuesta inválida del servidor');
        return { success: false, error: 'Respuesta inválida del servidor' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(errorMessage);
      console.error('Error al generar análisis de curso:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const checkLatestAnalysis = async (idCurso: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/course-analysis/latest/${idCurso}`);
      const data = await response.json();
      
      if (response.ok && data.success && data.data) {
        return { success: true, analysis: data.data };
      }
      return { success: false };
    } catch {
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { generateAnalysis, checkLatestAnalysis, loading, error };
}
