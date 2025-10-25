import { Componente, type Entidad } from "../core/Componente";

/**
 * Representa una zona que contiene oficinas
 */
export class ZonaComponent extends Componente {
  constructor(
        public id: number,
        public nombre: string,
        public oficinas: Entidad[] = []
  ) {
    super();
  }

  // agregarOficina(entidadOficina: Entidad): void {
  //   if (!this.oficinas.includes(entidadOficina)) {
  //     this.oficinas.push(entidadOficina);
  //   }
  // }
}
