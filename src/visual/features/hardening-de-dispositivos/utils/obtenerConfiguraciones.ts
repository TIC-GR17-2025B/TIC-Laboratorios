import { ConfiguracionWorkstation } from "../../../../data/configuraciones/configWorkstation";
/**
 * Convierte la enumeración de configuraciones a formato de lista
 */
export default function obtenerConfiguraciones() {
  return Object.values(ConfiguracionWorkstation).map((config) => ({
    configuracion: config,
    precio: 0,
  }));
}
