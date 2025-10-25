import type { Mueble } from "../../types/DeviceEnums";
import { Componente } from "../core/Componente";

export class MuebleComponent extends Componente {
  constructor(public tipo: Mueble, public capacidadDispositivos: number = 1) {
    super();
  }
}
