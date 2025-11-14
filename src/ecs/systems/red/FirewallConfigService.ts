import type { ECSManager } from "../../core/ECSManager";
import type { Entidad } from "../../core";
import { DispositivoComponent, RouterComponent } from "../../components";
import type { TipoProtocolo } from "../../../types/TrafficEnums";
import { DireccionTrafico, AccionFirewall } from "../../../types/FirewallTypes";
import type { Reglas } from "../../../types/FirewallTypes";

export class FirewallConfigService {
    constructor(private ecsManager: ECSManager) {}

    agregarReglaFirewall(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolo: TipoProtocolo,
        accion: AccionFirewall,
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        // Obtener reglas existentes para esta red
        const reglasExistentes = router.bloqueosFirewall.get(entidadRed) || [];
        
        // Filtrar reglas que coincidan con el mismo protocolo y dirección
        const reglasFiltradas = reglasExistentes.filter(regla => 
            !(regla.protocolo === protocolo && 
              (regla.direccion === direccion || regla.direccion === DireccionTrafico.AMBAS || direccion === DireccionTrafico.AMBAS))
        );
        
        // Agregar la nueva regla
        const nuevaRegla: Reglas = { accion, direccion, protocolo };
        router.bloqueosFirewall.set(entidadRed, [...reglasFiltradas, nuevaRegla]);
    }

    bloquearProtocolosEnRed(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolos: TipoProtocolo[],
        direccion: DireccionTrafico
    ): void {
        protocolos.forEach(protocolo => {
            this.agregarReglaFirewall(
                entidadRouter,
                entidadRed,
                protocolo,
                AccionFirewall.DENEGAR,
                direccion
            );
        });
    }

    permitirProtocolosEnRed(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolos: TipoProtocolo[],
        direccion: DireccionTrafico
    ): void {
        protocolos.forEach(protocolo => {
            this.eliminarRegla(
                entidadRouter,
                entidadRed,
                protocolo,
                direccion
            );
        });
    }

    obtenerReglasDeRed(entidadRouter: Entidad, entidadRed: Entidad): Reglas[] {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        
        if (!router) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return [];
        }

        return router.bloqueosFirewall.get(entidadRed) || [];
    }

    eliminarRegla(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolo: TipoProtocolo,
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        const reglasExistentes = router.bloqueosFirewall.get(entidadRed) || [];
        const reglasActualizadas = reglasExistentes.filter(regla => 
            !(regla.protocolo === protocolo && regla.direccion === direccion)
        );

        if (reglasActualizadas.length > 0) {
            router.bloqueosFirewall.set(entidadRed, reglasActualizadas);
        } else {
            router.bloqueosFirewall.delete(entidadRed);
        }

    }

    obtenerRedesConReglas(entidadRouter: Entidad): Entidad[] {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        
        if (!router) {
            return [];
        }

        return Array.from(router.bloqueosFirewall.keys());
    }
}
