import { Mueble, TipoDispositivo } from "../../../../types/DeviceEnums";
import { preloadModel } from "../components/Model3DUtils";

/**
 * Configuración centralizada de modelos 3D y sus propiedades
 * Sigue el principio de Single Responsibility Pattern (SRP)
 */

/**
 * Mapea tipos de muebles a rutas de modelos 3D
 */
export const MUEBLE_MODELS: Record<string, string> = {
  [Mueble.MESA]: "/assets/models/escritorio.gltf",
};

/**
 * Mapea tipos de dispositivos a rutas de modelos 3D
 */
export const DISPOSITIVO_MODELS: Record<string, string> = {
  [TipoDispositivo.WORKSTATION]: "/assets/models/computadora.gltf",
  [TipoDispositivo.ROUTER]: "/assets/models/router.gltf",
};

/**
 * Precarga todos los modelos 3D para mejorar el rendimiento
 * Llamar esta función al inicio de la aplicación
 */
export const preloadAllModels = () => {
  // Precargar modelos de muebles
  Object.values(MUEBLE_MODELS).forEach((path) => {
    if (path) preloadModel(path);
  });

  // Precargar modelos de dispositivos
  Object.values(DISPOSITIVO_MODELS).forEach((path) => {
    if (path) preloadModel(path);
  });
};

/**
 * Alturas específicas para cada tipo de dispositivo en Three.js (eje Y)
 * Estos valores se aplicarán automáticamente a la coordenada Y de la posición
 */
export const DISPOSITIVO_HEIGHTS: Record<string, number> = {
  [TipoDispositivo.WORKSTATION]: 0.71,
  [TipoDispositivo.ROUTER]: 0.71,
};

/**
 * Alturas específicas para cada tipo de mueble en Three.js (eje Y)
 */
export const MUEBLE_HEIGHTS: Record<string, number> = {
  [Mueble.MESA]: 0,
  [Mueble.RACK]: 0,
  [Mueble.LIBRE]: 0,
};

/**
 * Obtiene el modelo 3D para un tipo de mueble
 */
export const getMuebleModel = (tipo: string): string => {
  return MUEBLE_MODELS[tipo] || "";
};

export const getModelo = (objeto: unknown): string => {
  const o = objeto as { tipo?: string; mueble?: string };
  if (o.tipo && o.tipo in DISPOSITIVO_MODELS) {
    return getDispositivoModel(o.tipo);
  } else if (o.tipo === "espacio") {
    const mueble = o.mueble ?? "";
    return getMuebleModel(mueble);
  } else {
    return "";
  }
};

/**
 * Obtiene el modelo 3D para un tipo de dispositivo
 */
export const getDispositivoModel = (tipo: string): string => {
  return DISPOSITIVO_MODELS[tipo] || DISPOSITIVO_MODELS[TipoDispositivo.OTRO];
};

/**
 * Obtiene la altura (Y) para un tipo de dispositivo
 */
export const getDispositivoHeight = (tipo: string): number => {
  return DISPOSITIVO_HEIGHTS[tipo] ?? 0;
};

/**
 * Obtiene la altura (Y) para un tipo de mueble
 */
export const getMuebleHeight = (tipo: string): number => {
  return MUEBLE_HEIGHTS[tipo] ?? 0;
};
