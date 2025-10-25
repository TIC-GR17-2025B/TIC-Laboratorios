import { Componente } from "../core/Componente";
import { Mueble } from "../../visual/types/DeviceEnums";

export class MuebleComponent extends Componente {
  constructor(
        public tipo: Mueble,
        public capacidadDispositivos: number = 1
  ) {
    super();
  }
}
