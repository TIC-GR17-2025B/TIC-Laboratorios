import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../common/utils/apiConfig";

const API_URL = API_BASE_URL;

export interface Grupo {
  id_curso: number;
  id_profesor: number;
  nombre: string;
  codigo_acceso: string | null;
  codigo_expira: Date | null;
}

export interface Estudiante {
  id_estudiante: number;
  primernombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo_electronico: string;
  codigo_unico: number;
}

export const useGroups = (idProfesor: number | null) => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrupos = async () => {
    if (!idProfesor) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/groups/profesor/${idProfesor}`);

      if (!response.ok) {
        throw new Error("Error al obtener los grupos");
      }

      const result = await response.json();
      setGrupos(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, [idProfesor]);

  const createGrupo = async (nombre: string): Promise<boolean> => {
    if (!idProfesor) return false;

    try {
      const response = await fetch(`${API_URL}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profesor: idProfesor, nombre }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al crear el grupo");
      }

      await fetchGrupos();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear grupo");
      return false;
    }
  };

  const updateGrupo = async (
    idCurso: number,
    nombre: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/groups/edit/${idCurso}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al actualizar el grupo");
      }

      await fetchGrupos();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar grupo"
      );
      return false;
    }
  };

  const deleteGrupo = async (idCurso: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/groups/delete/${idCurso}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al eliminar el grupo");
      }

      await fetchGrupos();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar grupo");
      return false;
    }
  };

  const generateCode = async (idCurso: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `${API_URL}/groups/${idCurso}/generate-code`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al generar código");
      }

      const result = await response.json();
      await fetchGrupos();
      return result.data.codigo_acceso;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar código");
      return null;
    }
  };

  const removeStudent = async (
    idCurso: number,
    idEstudiante: number
  ): Promise<boolean> => {
    if (!idProfesor) return false;

    try {
      const response = await fetch(
        `${API_URL}/groups/${idCurso}/remove-student/${idEstudiante}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_profesor: idProfesor }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al eliminar estudiante");
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar estudiante"
      );
      return false;
    }
  };

  const getEstudiantesByGrupo = async (
    idCurso: number
  ): Promise<Estudiante[]> => {
    try {
      const response = await fetch(`${API_URL}/groups/${idCurso}/estudiantes`);

      if (!response.ok) {
        throw new Error("Error al obtener estudiantes");
      }

      const result = await response.json();
      return result.data || [];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener estudiantes"
      );
      return [];
    }
  };

  return {
    grupos,
    loading,
    error,
    createGrupo,
    updateGrupo,
    deleteGrupo,
    generateCode,
    removeStudent,
    getEstudiantesByGrupo,
    refetch: fetchGrupos,
  };
};
