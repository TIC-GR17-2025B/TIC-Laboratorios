import type { ECSManager } from "../../core/ECSManager";
import { EventosRed, EventosFirewall } from "../../../types/EventosEnums";
import type { TipoProtocolo, RegistroTrafico, RegistroFirewallBloqueado, RegistroFirewallPermitido } from "../../../types/TrafficEnums";
import type { Entidad } from "../../core";
import { DispositivoComponent } from "../../components";

/**
 * Servicio responsable de emitir eventos relacionados con la red
 */
export class EventoRedService {
    constructor(private ecsManager: ECSManager) {}

    // Emite evento cuando el tráfico es permitido por el firewall
    emitirEventoPermitido(origen: string, destino: string, protocolo: TipoProtocolo, entidadRouter?: Entidad): void {
        const nombreRouter = this.obtenerNombreRouter(entidadRouter);
        
        const registro: RegistroFirewallPermitido = {
            origen,
            destino,
            protocolo,
            mensaje: `Conexión permitida: ${origen} → ${destino} [${protocolo}]${nombreRouter ? ` (${nombreRouter})` : ''}`,
            tipo: 'PERMITIDO',
            entidadRouter,
            router: nombreRouter
        };
        
        this.ecsManager.emit(EventosFirewall.TRAFICO_PERMITIDO, registro);
    }

    // Emite evento cuando el tráfico es bloqueado por el firewall
    emitirEventoBloqueado(origen: string, destino: string, protocolo: TipoProtocolo, razon?: string, entidadRouter?: Entidad): void {
        const nombreRouter = this.obtenerNombreRouter(entidadRouter);
        
        const registro: RegistroFirewallBloqueado = {
            origen,
            destino,
            protocolo,
            mensaje: `Conexión bloqueada: ${origen} → ${destino} [${protocolo}]${razon ? ` - Razón: ${razon}` : ''}${nombreRouter ? ` (${nombreRouter})` : ''}`,
            tipo: 'BLOQUEADO',
            razon,
            entidadRouter,
            router: nombreRouter
        };
        
        this.ecsManager.emit(EventosFirewall.TRAFICO_BLOQUEADO, registro);
    }

    private obtenerNombreRouter(entidadRouter?: Entidad): string | undefined {
        if (!entidadRouter) return undefined;
        
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        return dispositivo?.nombre;
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
