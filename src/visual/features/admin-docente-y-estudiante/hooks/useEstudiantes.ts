import { useState, useEffect } from "react";

const API_URL = "/api";

interface Estudiante {
  id_estudiante: number;
  primernombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo_electronico: string;
  codigo_unico: number;
  id_profesor: number;
}

interface Progreso {
  id_progreso: number;
  id_estudiante: number;
  id_escenario: number;
  nombre_escenario: string;
  terminado: boolean;
  tiempo: number | null;
  fecha_creacion?: string;
}

export type { Progreso };

export const useEstudiantes = (idProfesor: number | null) => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("useEstudiantes - idProfesor recibido:", idProfesor);
    if (!idProfesor) {
      console.log("useEstudiantes - No hay idProfesor, saliendo");
      return;
    }

    const fetchEstudiantes = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_URL}/auth/profesor/${idProfesor}/estudiantes`;
        console.log("useEstudiantes - Fetching URL:", url);
        const response = await fetch(url);

        console.log("useEstudiantes - Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("useEstudiantes - Error response:", errorText);
          throw new Error("Error al obtener estudiantes");
        }

        const result = await response.json();
        console.log("useEstudiantes - Resultado:", result);
        console.log("useEstudiantes - Estudiantes:", result.data);
        setEstudiantes(result.data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error de conexión";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEstudiantes();
  }, [idProfesor]);

  return { estudiantes, loading, error };
};

export const useProgresoEstudiante = (idEstudiante: number | null) => {
  const [progresos, setProgresos] = useState<Progreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idEstudiante) return;

    const fetchProgresos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/progreso/estudiante/${idEstudiante}`
        );

        if (!response.ok) {
          throw new Error("Error al obtener progresos");
        }

        const result = await response.json();
        setProgresos(result.data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error de conexión";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProgresos();
  }, [idEstudiante]);

  return { progresos, loading, error };
};
