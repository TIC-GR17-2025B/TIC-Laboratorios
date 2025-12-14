import { useState } from 'react';

export interface FeedbackResponse {
  analisis: string;
  fortaleza: string;
  area_mejora: string;
  consejo: string;
}

interface FeedbackAPIResponse {
  success: boolean;
  data: FeedbackResponse;
}

export const useGenerateFeedback = () => {
  const [loading, setLoading] = useState(false);

  const generateFeedback = async (
    idEstudiante: number,
    idEscenario: number
  ): Promise<{ feedback: FeedbackResponse } | null> => {
    setLoading(true);

    try {
      const response = await fetch('/api/feedback/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_estudiante: idEstudiante,
          id_escenario: idEscenario,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar retroalimentación');
      }

      const result: FeedbackAPIResponse = await response.json();

      if (!result.success) {
        throw new Error('Error al generar retroalimentación');
      }

      return {
        feedback: result.data
      };
    } catch (err) {
      console.error('Error al generar feedback:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateFeedback, loading };
};
