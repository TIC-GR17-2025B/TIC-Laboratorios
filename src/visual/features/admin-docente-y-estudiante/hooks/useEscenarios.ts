import { useState, useEffect } from "react";

const API_URL = "/api";

interface Escenario {
  id: number;
  titulo: string;
  descripcion: string;
  imagenPreview: string;
}

export const useEscenarios = () => {
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEscenarios = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/escenarios`);

        if (!response.ok) {
          throw new Error("Error al obtener escenarios");
        }

        const result = await response.json();
        setEscenarios(result.data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error de conexión";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEscenarios();
  }, []);

  return { escenarios, loading, error };
};
