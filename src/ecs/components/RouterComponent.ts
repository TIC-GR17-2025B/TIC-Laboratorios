import { Componente } from "../core";
import type { ConfiguracionFirewall } from "../../types/FirewallTypes";

export class RouterComponent extends Componente {
    constructor(
        public conectadoAInternet: boolean,
        public firewall: ConfiguracionFirewall,
        public logsFirewall: any[] = []
    ) {
        super();
    }
}
