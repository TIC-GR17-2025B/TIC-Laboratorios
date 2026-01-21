import type { EstadoAtaqueDispositivo, TipoDispositivo } from "../../types/DeviceEnums";
import type { SoftwareApp } from "../../types/EscenarioTypes";
import { Componente, type Entidad } from "../core/Componente";

export class DispositivoComponent extends Componente {
  constructor(
    public nombre: string = "",
    public sistemaOperativo: string = "",
    public hardware: string = "",
    public tipo: TipoDispositivo,
    public estadoAtaque: EstadoAtaqueDispositivo,
    public redes: Entidad[] = [],
    public personaEncargada?: string,
    public apps?: SoftwareApp[]
  ) {
    super();
  }
}
