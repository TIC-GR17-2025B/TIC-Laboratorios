import type { ECSManager } from "../../core/ECSManager";
import { EventosRed } from "../../../types/EventosEnums";
import type { TipoProtocolo, RegistroTrafico, RegistroFirewallBloqueado, RegistroFirewallPermitido } from "../../../types/TrafficEnums";

/**
 * Servicio responsable de emitir eventos relacionados con la red
 */
export class EventoRedService {
    constructor(private ecsManager: ECSManager) {}

    // Emite evento cuando el tráfico es permitido por el firewall
     
    emitirEventoPermitido(origen: string, destino: string, protocolo: TipoProtocolo): void {
        const mensaje = `Conexión permitida: ${origen} → ${destino} [${protocolo}]`;
        
        const registro: RegistroFirewallPermitido = {
            origen,
            destino,
            protocolo,
            mensaje,
            tipo: 'PERMITIDO'
        };
        
        this.ecsManager.emit(EventosRed.FIREWALL_TRAFICO_PERMITIDO, registro);
    }

    // Emite evento cuando el tráfico es bloqueado por el firewall
    emitirEventoBloqueado(origen: string, destino: string, protocolo: TipoProtocolo, razon?: string): void {
        const razonTexto = razon ? ` - Bloqueado por: ${razon}` : '';
        const mensaje = `Conexión bloqueado: ${origen} → ${destino} [${protocolo}]${razonTexto}`;
        
        const registro: RegistroFirewallBloqueado = {
            origen,
            destino,
            protocolo,
            mensaje,
            tipo: 'BLOQUEADO',
            razon
        };
        
        this.ecsManager.emit(EventosRed.FIREWALL_TRAFICO_BLOQUEADO, registro);
        
    }

    // Registra tráfico exitoso
    registrarTrafico(origen: string, destino: string, protocolo: TipoProtocolo): void {
        const registro: RegistroTrafico = {
            origen,
            destino,
            protocolo
        };

        this.ecsManager.emit(EventosRed.TRAFICO_ENVIADO, registro);
    }

    // Emite evento de envío de activo
    emitirActivoEnviado(nombreActivo: string, origen: string, destino: string): void {
        this.ecsManager.emit(EventosRed.RED_ACTIVO_ENVIADO, {
            nombreActivo,
            d1: origen,
            d2: destino
        });
    }
}
