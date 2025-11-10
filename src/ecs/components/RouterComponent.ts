import { Componente } from "../core";
import type { ConfiguracionFirewall, LogFirewall } from "../../types/FirewallTypes";

export class RouterComponent extends Componente {
    constructor(
        public conectadoAInternet: boolean,
        public firewall: ConfiguracionFirewall,
        public logsFirewall: LogFirewall[] = []
    ) {
        super();
    }
}
