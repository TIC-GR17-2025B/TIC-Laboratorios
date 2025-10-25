import { Componente, type Entidad } from "../core/Componente";

/**
 * Representa una oficina que contiene espacios
 */
export class OficinaComponent extends Componente {
  constructor(
        public id: number,
        public nombre: string,
        public zonaId: number, 
        public espacios: Entidad[] = []
  ) {
    super();
  } 
}

export function agregarEspacio(oficinaComponent: OficinaComponent, entidadEspacio: Entidad): void {
    if (!oficinaComponent.espacios.includes(entidadEspacio)) {
      oficinaComponent.espacios.push(entidadEspacio);
    }
  }
