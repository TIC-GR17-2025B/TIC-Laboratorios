import { useGLTF } from "@react-three/drei";

/**
 * Precargar el modelo para mejorar el rendimiento
 */
export const preloadModel = (path: string) => {
  useGLTF.preload(path);
};
