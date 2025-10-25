import type { TipoDispositivo } from "../../types/DeviceEnums";
import { Componente } from "../core/Componente";

export class DispositivoComponent extends Componente {
  constructor(
    public tipo: TipoDispositivo,
    public nombre: string = "",
    public sistemaOperativo: string = "",
    public hardware: string = ""
  ) {
    super();
  }
}
