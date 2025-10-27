import type { ConfiguracionWorkstation } from "../../data/configuraciones/configWorkstation";
import { Componente } from "../core";

// Es una configuración individual de un workstation
export class ConfiguracionWorkstationComponent extends Componente {
    constructor(
        public configuracion: ConfiguracionWorkstation,
        public costoActivacion: number,
        public activado: boolean,
        public costoDesactivacion: number = costoActivacion*0.5
    ){
        super();
    }
}
