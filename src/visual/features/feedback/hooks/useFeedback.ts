import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../common/utils/apiConfig";

interface FeedbackStatusResponse {
  success: boolean;
  habilitado: boolean;
  intentos_actuales: number;
  intentos_al_generar: number | null;
}

export function useFeedback(
  idEstudiante: number | null,
  idEscenario: number | null
) {
  const [habilitado, setHabilitado] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    if (!idEstudiante || !idEscenario) {
      setHabilitado(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/check-status?id_estudiante=${idEstudiante}&id_escenario=${idEscenario}`
      );

      if (response.ok) {
        const data: FeedbackStatusResponse = await response.json();
        setHabilitado(data.habilitado);
      } else {
        setHabilitado(true);
      }
    } catch (error) {
      console.error("Error al verificar estado de feedback:", error);
      setHabilitado(true);
    } finally {
      setLoading(false);
    }
  }, [idEstudiante, idEscenario]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    habilitado,
    loading,
    refetch: checkStatus,
  };
}
