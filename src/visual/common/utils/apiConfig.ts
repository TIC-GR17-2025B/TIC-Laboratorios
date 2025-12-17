// Configuración de la URL base del API según el entorno
export const getApiBaseUrl = (): string => {
  // En desarrollo, usar el proxy de Vite (rutas relativas)
  if (import.meta.env.DEV) {
    return "";
  }

  // En producción, usar la URL del backend desde las variables de entorno
  return (
    import.meta.env.VITE_BACKEND_URL || "https://tic-laboratorios.onrender.com"
  );
};

export const API_BASE_URL = getApiBaseUrl();
