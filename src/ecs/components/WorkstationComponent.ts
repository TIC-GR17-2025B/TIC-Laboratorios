import { Componente } from "../core";
import { initConfigsWorkstation } from "../utils/InitConfiguraciones";
import type { ConfiguracionWorkstationComponent } from "./ConfiguracionWorkstationComponent";

/* Tiene el conjunto de total de configuraciones de un workstation.
 * Esto es lo que se añade a la entidad, mas no los individuales
 * */
export class WorkstationComponent extends Componente {
    constructor(
        public configuraciones: ConfiguracionWorkstationComponent[] = initConfigsWorkstation()
    ){
        super();
    }
}
