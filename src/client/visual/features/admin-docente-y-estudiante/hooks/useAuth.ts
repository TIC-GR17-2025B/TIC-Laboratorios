import { useState } from "react";
import { API_BASE_URL } from "../../../common/utils/apiConfig";

const API_URL = API_BASE_URL;

interface RegisterEstudianteData {
  primernombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  codigo_unico: number;
  correo_electronico: string;
  contrasenia: string;
  id_profesor?: number;
}

interface RegisterProfesorData {
  nombre_completo: string;
  correo_electronico: string;
  contrasenia: string;
  departamento?: string;
}

interface LoginData {
  correo_electronico: string;
  contrasenia: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    role: "estudiante" | "profesor";
    user: {
      id: string;
      nombre_completo: string;
      correo_electronico: string;
      rol: string;
    };
  };
  error?: string;
}

/**
 * Usuario persistido en localStorage tras el login.
 * Combina los campos de `AuthResponse.data.user` con identificadores de rol
 * (`id_estudiante` o `id_profesor`) que inyecta el backend en el login.
 */
export interface StoredUser {
  id: string;
  nombre_completo: string;
  correo_electronico: string;
  rol: string;
  id_estudiante?: number;
  id_profesor?: number;
}

export type UserRole = "estudiante" | "profesor";

export interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  registerEstudiante: (data: RegisterEstudianteData) => Promise<AuthResponse | null>;
  registerProfesor: (data: RegisterProfesorData) => Promise<AuthResponse | null>;
  login: (data: LoginData) => Promise<AuthResponse | null>;
  logout: () => void;
  isAuthenticated: () => boolean;
  getUser: () => StoredUser | null;
  getUserRole: () => UserRole | null;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerEstudiante = async (
    data: RegisterEstudianteData
  ): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/register/estudiante`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        setError(
          `Error del servidor: No se recibió una respuesta JSON válida.`
        );
        return null;
      }

      const result: AuthResponse = await response.json();

      if (!response.ok) {
        setError(result.error || "Error al registrar estudiante");
        return null;
      }

      return result;
    } catch (err) {
      console.error("Error completo:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión";
      setError(
        `${errorMessage}. ¿Está el servidor backend corriendo en /auth?`
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerProfesor = async (
    data: RegisterProfesorData
  ): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/register/profesor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (!response.ok) {
        setError(result.error || "Error al registrar profesor");
        return null;
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (!response.ok) {
        setError(result.error || "Error al iniciar sesión");
        return null;
      }

      // Guardar token, rol y usuario en localStorage
      if (result.data?.token) {
        localStorage.setItem("authToken", result.data.token);
        localStorage.setItem("userRole", result.data.role);
        localStorage.setItem("user", JSON.stringify({
          ...result.data.user,
          correo_electronico: data.correo_electronico,
        }));
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
  };

  const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("authToken");
  };

  const getUser = (): StoredUser | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? (JSON.parse(userStr) as StoredUser) : null;
  };

  const getUserRole = (): UserRole | null => {
    return localStorage.getItem("userRole") as UserRole | null;
  };

  return {
    loading,
    error,
    registerEstudiante,
    registerProfesor,
    login,
    logout,
    isAuthenticated,
    getUser,
    getUserRole,
  };
};
