import { useState, useEffect } from "react";
import { NivelController } from "../../../../ecs/controllers/NivelController";

interface Escenario {
  id: number;
  titulo: string;
  descripcion: string;
  imagenPreview?: string;
}

export const useEscenarios = () => {
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEscenarios = () => {
      setLoading(true);
      setError(null);

      try {
        const nivelController = new NivelController();
        const result = nivelController.getEscenarios();
        setEscenarios(result || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar escenarios";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEscenarios();
  }, []);

  return { escenarios, loading, error };
};
