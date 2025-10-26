import type { Escenario } from "../../types/EscenarioTypes";
import { Componente, type Entidad } from "../core/Componente";

export class EscenarioComponent extends Componente implements Escenario {
  constructor(
    public readonly id: number,
    public titulo: string,
    public descripcion: string,
    public zonas: Entidad[] = [],
    public tipo: string = "escenario"
  ) {
    super();
  }
}
