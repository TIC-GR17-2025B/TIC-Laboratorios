import type { LogGeneral } from "../../types/EscenarioTypes";
import { Componente, type Entidad } from "../core/Componente";
import type { AtaqueComponent } from "./AtaqueComponent";
import type { FaseComponent } from "./FaseComponent";

export class EscenarioComponent extends Componente {
  constructor(
    public readonly id: number,
    public titulo: string,
    public descripcion: string,
    public presupuestoInicial: number,
    public zonas: Entidad[] = [],
    public ataques: AtaqueComponent[] = [],
    public fases: FaseComponent[] = [],
    public tipo: string = "escenario",
    public logsGenerales: LogGeneral[] = []
  ) {
    super();
  }
}
