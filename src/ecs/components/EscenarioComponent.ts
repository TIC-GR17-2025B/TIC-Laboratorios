import type { Escenario } from "../../types/EscenarioTypes";
import { Componente, type Entidad } from "../core/Componente";
import type { AtaqueComponent } from "./AtaqueComponent";

export class EscenarioComponent extends Componente implements Escenario {
  constructor(
    public readonly id: number,
    public titulo: string,
    public descripcion: string,
    public presupuestoInicial: number,
    public zonas: Entidad[] = [],
    public ataques: AtaqueComponent[] = [],
    public tipo: string = "escenario"
  ) {
    super();
  }
}
