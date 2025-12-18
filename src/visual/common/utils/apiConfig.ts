// Configuración de la URL base del API según el entorno
const BACKEND_FALLBACK = "https://tic-laboratorios-npgq.onrender.com";

export const getApiBaseUrl = (): string => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Si hay una URL de backend configurada, usarla (producción)
  if (backendUrl && backendUrl.trim() !== "") {
    return backendUrl;
  }

  // Si no hay URL configurada, usar proxy local (desarrollo) o fallback
  if (import.meta.env.DEV) {
    return "/api";
  }

  return BACKEND_FALLBACK;
};

export const API_BASE_URL = getApiBaseUrl();
