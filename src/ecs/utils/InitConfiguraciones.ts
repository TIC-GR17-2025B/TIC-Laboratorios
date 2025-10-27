import { ConfiguracionWorkstation } from "../../data/configuraciones/configWorkstation";
import { ConfiguracionWorkstationComponent } from "../components";

export function initConfigsWorkstation(): ConfiguracionWorkstationComponent[] {
    const configsWorkstation: ConfiguracionWorkstationComponent[] = [];

    Object.values(ConfiguracionWorkstation).forEach(nombreConfig => {
        configsWorkstation.push(new ConfiguracionWorkstationComponent(nombreConfig, 50, false));
    });

    return configsWorkstation;
}
