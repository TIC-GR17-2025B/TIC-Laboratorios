import { useState } from "react";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import type { FeedbackData } from '../types/feedback.types';

interface FeedbackAPIResponse {
  success: boolean;
  data: FeedbackData;
}

export const useGenerateFeedback = () => {
  const [loading, setLoading] = useState(false);

  const generateFeedback = async (
    idEstudiante: number,
    slugEscenario: string
  ): Promise<{ feedback: FeedbackData } | null> => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/feedback/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_estudiante: idEstudiante,
          slug_escenario: slugEscenario,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar retroalimentación");
      }

      const result: FeedbackAPIResponse = await response.json();

      if (!result.success) {
        throw new Error("Error al generar retroalimentación");
      }

      return {
        feedback: result.data,
      };
    } catch (err) {
      console.error("Error al generar feedback:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateFeedback, loading };
};
