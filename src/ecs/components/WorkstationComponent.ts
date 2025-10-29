import { Componente } from "../core";
import { ConfiguracionWorkstation, type EsquemaConfigWorkstation } from "../../data/configuraciones/configWorkstation";

// Tiene el conjunto de total de configuraciones de un workstation.
export class WorkstationComponent extends Componente {
    constructor(
        public configuraciones: Array<EsquemaConfigWorkstation> = []
    ){
        super();
        this.configuraciones = ConfiguracionWorkstation.map(c => ({ ...c }));
    }
}
