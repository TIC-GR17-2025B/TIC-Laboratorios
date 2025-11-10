import type { ECSManager } from "../../core/ECSManager";
import type { Entidad } from "../../core";
import { DispositivoComponent, RouterComponent } from "../../components";
import { EventosFirewall } from "../../../types/EventosEnums";
import type { TipoProtocolo } from "../../../types/TrafficEnums";
import type { DireccionTrafico } from "../../../types/FirewallTypes";


export class FirewallConfigService {
    constructor(private ecsManager: ECSManager) {}


    toggleFirewall(entidadRouter: Entidad, habilitado: boolean): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        // Preservar la configuración actual y solo cambiar el estado
        const configActual = router.firewall;
        router.firewall = {
            ...configActual,
            habilitado
        };

        // Emitir evento de cambio de estado
        const evento = habilitado ? EventosFirewall.HABILITADO : EventosFirewall.DESHABILITADO;
        this.ecsManager.emit(evento, {
            router: dispositivo.nombre,
            mensaje: `Firewall del router "${dispositivo.nombre}" ${habilitado ? 'habilitado' : 'deshabilitado'}`,
            tipo: habilitado ? 'HABILITADO' : 'DESHABILITADO'
        });
    }

   
    agregarReglaFirewall(
        entidadRouter: Entidad,
        protocolo: TipoProtocolo,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }


        const reglasExistentes = router.firewall.reglasGlobales.get(protocolo) || [];
        

        const nuevaRegla = { accion, direccion };
        router.firewall.reglasGlobales.set(protocolo, [...reglasExistentes, nuevaRegla]);

        // Persistir log de regla agregada usando el mismo mensaje del evento
        const mensajeLog = `Regla agregada en "${dispositivo.nombre}": ${accion} ${protocolo} (${direccion})`;
        this.persistirLogEnRouter(entidadRouter, mensajeLog, 'REGLA_AGREGADA');

        this.ecsManager.emit(EventosFirewall.REGLA_AGREGADA, {
            router: dispositivo.nombre,
            mensaje: mensajeLog,
            tipo: 'REGLA_AGREGADA',
            protocolo,
            accion,
            direccion
        });
    }


    agregarExcepcionFirewall(
        entidadRouter: Entidad,
        protocolo: TipoProtocolo,
        entidadDispositivo: Entidad,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivoRouter = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        const dispositivoExcepcion = this.ecsManager.getComponentes(entidadDispositivo)?.get(DispositivoComponent);
        
        if (!router || !dispositivoRouter || !dispositivoExcepcion) {
            console.error(`Router o dispositivo no encontrado`);
            return;
        }


        const excepcionesExistentes = router.firewall.excepciones.get(protocolo) || [];
        

        const nuevaExcepcion = {
            nombreDispositivo: dispositivoExcepcion.nombre,
            accion,
            direccion
        };
        router.firewall.excepciones.set(protocolo, [...excepcionesExistentes, nuevaExcepcion]);

        // Persistir log de excepción agregada usando el mismo mensaje del evento
        const mensajeLog = `Excepción agregada en "${dispositivoRouter.nombre}": ${accion} ${protocolo} para "${dispositivoExcepcion.nombre}" (${direccion})`;
        this.persistirLogEnRouter(entidadRouter, mensajeLog, 'REGLA_AGREGADA');

        this.ecsManager.emit(EventosFirewall.REGLA_AGREGADA, {
            router: dispositivoRouter.nombre,
            mensaje: mensajeLog,
            tipo: 'REGLA_AGREGADA',
            protocolo,
            accion,
            direccion
        });
    }

    
    setPoliticaFirewall(
        entidadRouter: Entidad,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        const politicaAnterior = router.firewall.politicaPorDefecto;
        router.firewall.politicaPorDefecto = politica;

        // Emitir evento
        this.ecsManager.emit(EventosFirewall.POLITICA_CAMBIADA, {
            router: dispositivo.nombre,
            mensaje: `Política general de "${dispositivo.nombre}" cambiada de ${politicaAnterior} a ${politica}`,
            tipo: 'POLITICA_CAMBIADA',
            politicaAnterior,
            politicaNueva: politica
        });
    }

    
    setPoliticaFirewallSaliente(
        entidadRouter: Entidad,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        const politicaAnterior = router.firewall.politicaPorDefectoSaliente || router.firewall.politicaPorDefecto;
        router.firewall.politicaPorDefectoSaliente = politica;

        // Emitir evento
        this.ecsManager.emit(EventosFirewall.POLITICA_CAMBIADA, {
            router: dispositivo.nombre,
            mensaje: `Política SALIENTE de "${dispositivo.nombre}" cambiada de ${politicaAnterior} a ${politica}`,
            tipo: 'POLITICA_CAMBIADA',
            politicaAnterior,
            politicaNueva: politica
        });
    }

    
    setPoliticaFirewallEntrante(
        entidadRouter: Entidad,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        const politicaAnterior = router.firewall.politicaPorDefectoEntrante || router.firewall.politicaPorDefecto;
        router.firewall.politicaPorDefectoEntrante = politica;


        this.ecsManager.emit(EventosFirewall.POLITICA_CAMBIADA, {
            router: dispositivo.nombre,
            mensaje: `Política ENTRANTE de "${dispositivo.nombre}" cambiada de ${politicaAnterior} a ${politica}`,
            tipo: 'POLITICA_CAMBIADA',
            politicaAnterior,
            politicaNueva: politica
        });
    }

    /**
     * Persiste un log en el RouterComponent
     */
    private persistirLogEnRouter(
        entidadRouter: Entidad,
        mensaje: string,
        tipo: 'PERMITIDO' | 'BLOQUEADO' | 'REGLA_AGREGADA'
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        if (!router) return;

        const log = {
            timestamp: Date.now(),
            mensaje,
            tipo
        };

        router.logsFirewall.push(log);

        // Limitar a 100 logs
        if (router.logsFirewall.length > 100) {
            router.logsFirewall.shift();
        }
    }
}
