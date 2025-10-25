import { Componente, type Entidad } from "../core/Componente";

/**
 * Representa un espacio que puede contener dispositivos
 * Mantiene referencias a las entidades de dispositivos que contiene
 */
export class EspacioComponent extends Componente {
  constructor(
        public id: number,
        public oficinaId: number,
        public dispositivos: Entidad[] = [] 
  ) {
    super();
  }
}

export function agregarDispositivo(espacioComponent: EspacioComponent,
                                   entidadDispositivo: Entidad): boolean {
    if (!espacioComponent.dispositivos.includes(entidadDispositivo)) {
      espacioComponent.dispositivos.push(entidadDispositivo);
      return true;
    }
    return false;
  }
