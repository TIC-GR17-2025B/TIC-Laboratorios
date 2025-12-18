// Configuración de la URL base del API según el entorno
const BACKEND_FALLBACK = "https://tic-laboratorios-npgq.onrender.com";

export const getApiBaseUrl = (): string => {
  const isProd = import.meta.env.PROD;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Debug: mostrar valores en consola (remover después de verificar)
  console.log("[apiConfig] PROD:", isProd, "VITE_BACKEND_URL:", backendUrl);

  // En producción, usar la URL del backend
  if (isProd) {
    return backendUrl && backendUrl.trim() !== ""
      ? backendUrl
      : BACKEND_FALLBACK;
  }

  // En desarrollo, usar el proxy de Vite (rutas /api/...)
  return "/api";
};

export const API_BASE_URL = getApiBaseUrl();
