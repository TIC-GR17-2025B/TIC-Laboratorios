import type { ECSManager } from "../../core/ECSManager";
import { DispositivoComponent, RouterComponent } from "../../components";
import { EventosRed } from "../../../types/EventosEnums";
import type { TipoProtocolo } from "../../../types/TrafficEnums";
import type { DireccionTrafico } from "../../../types/FirewallTypes";

// Servicio responsable de configurar firewalls de routers
 
export class FirewallConfigService {
    constructor(private ecsManager: ECSManager) {}

    // Habilita o deshabilita el firewall de un router
     
    toggleFirewall(nombreRouter: string, habilitado: boolean): void {
        const router = this.obtenerRouterPorNombre(nombreRouter);
        if (!router) {
            console.error(`Router "${nombreRouter}" no encontrado`);
            return;
        }

        // Preservar la configuración actual y solo cambiar el estado
        const configActual = router.firewall;
        router.firewall = {
            ...configActual,
            habilitado
        };

        // Emitir evento de cambio de estado
        const evento = habilitado ? EventosRed.FIREWALL_HABILITADO : EventosRed.FIREWALL_DESHABILITADO;
        this.ecsManager.emit(evento, {
            router: nombreRouter,
            mensaje: `Firewall del router "${nombreRouter}" ${habilitado ? 'habilitado' : 'deshabilitado'}`,
            tipo: habilitado ? 'HABILITADO' : 'DESHABILITADO'
        });
    }

    // Agrega una regla global al firewall de un router
    agregarReglaFirewall(
        nombreRouter: string,
        protocolo: TipoProtocolo,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        const router = this.obtenerRouterPorNombre(nombreRouter);
        if (!router) {
            console.error(`Router "${nombreRouter}" no encontrado`);
            return;
        }

        // Obtener reglas existentes para este protocolo
        const reglasExistentes = router.firewall.reglasGlobales.get(protocolo) || [];
        
        // Agregar la nueva regla
        const nuevaRegla = { accion, direccion };
        router.firewall.reglasGlobales.set(protocolo, [...reglasExistentes, nuevaRegla]);

        // Emitir evento
        this.ecsManager.emit(EventosRed.FIREWALL_REGLA_AGREGADA, {
            router: nombreRouter,
            mensaje: `Regla agregada en "${nombreRouter}": ${accion} ${protocolo} (${direccion})`,
            tipo: 'REGLA_AGREGADA',
            protocolo,
            accion,
            direccion
        });
    }

    // Agrega una excepción (regla por dispositivo específico) al firewall
    agregarExcepcionFirewall(
        nombreRouter: string,
        protocolo: TipoProtocolo,
        nombreDispositivo: string,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        const router = this.obtenerRouterPorNombre(nombreRouter);
        if (!router) {
            console.error(`Router "${nombreRouter}" no encontrado`);
            return;
        }

        // Obtener excepciones existentes para este protocolo
        const excepcionesExistentes = router.firewall.excepciones.get(protocolo) || [];
        
        // Agregar la nueva excepción
        const nuevaExcepcion = {
            nombreDispositivo,
            accion,
            direccion
        };
        router.firewall.excepciones.set(protocolo, [...excepcionesExistentes, nuevaExcepcion]);

        // Emitir evento
        this.ecsManager.emit(EventosRed.FIREWALL_REGLA_AGREGADA, {
            router: nombreRouter,
            mensaje: `Excepción agregada en "${nombreRouter}": ${accion} ${protocolo} para "${nombreDispositivo}" (${direccion})`,
            tipo: 'REGLA_AGREGADA',
            protocolo,
            accion,
            direccion
        });
    }

    // Cambia la política por defecto del firewall de un router
    setPoliticaFirewall(
        nombreRouter: string,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        const router = this.obtenerRouterPorNombre(nombreRouter);
        if (!router) {
            console.error(`Router "${nombreRouter}" no encontrado`);
            return;
        }

        const politicaAnterior = router.firewall.politicaPorDefecto;
        router.firewall.politicaPorDefecto = politica;

        // Emitir evento
        this.ecsManager.emit(EventosRed.FIREWALL_POLITICA_CAMBIADA, {
            router: nombreRouter,
            mensaje: `Política de "${nombreRouter}" cambiada de ${politicaAnterior} a ${politica}`,
            tipo: 'POLITICA_CAMBIADA',
            politicaAnterior,
            politicaNueva: politica
        });
    }

    // Busca un router por nombre (nombre del DispositivoComponent)
    private obtenerRouterPorNombre(nombreRouter: string): RouterComponent | null {
        for (const [, container] of this.ecsManager.getEntidades()) {
            const router = container.get(RouterComponent);
            const dispositivo = container.get(DispositivoComponent);
            
            if (router && dispositivo && dispositivo.nombre === nombreRouter) {
                return router;
            }
        }

        return null;
    }
}
