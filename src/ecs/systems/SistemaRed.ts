import { ActivoComponent, RouterComponent, RedComponent } from "../components";
import { Sistema } from "../core";
import { TipoProtocolo } from "../../types/TrafficEnums";
import type { DireccionTrafico } from "../../types/FirewallTypes";
import {
    ConectividadService,
    EventoRedService,
    FirewallService,
    FirewallConfigService,
    TransferenciaService
} from "./red";

// Sistema encargado de gestionar redes, conectividad y firewalls
export class SistemaRed extends Sistema {
    public componentesRequeridos = new Set([ActivoComponent, RouterComponent]);

    // Servicios especializados
    private conectividadService: ConectividadService;
    private eventoService: EventoRedService;
    private firewallService: FirewallService;
    private firewallConfigService: FirewallConfigService;
    private transferenciaService: TransferenciaService;

    constructor() {
        super();
        this.eventoService = null as any;
        this.conectividadService = null as any;
        this.firewallService = null as any;
        this.firewallConfigService = null as any;
        this.transferenciaService = null as any;
    }

    // Inicializa servicios de forma lazy (solo la primera vez que se accede)
    private getEventoService(): EventoRedService {
        if (!this.eventoService) {
            this.eventoService = new EventoRedService(this.ecsManager);
        }
        return this.eventoService;
    }

    private getConectividadService(): ConectividadService {
        if (!this.conectividadService) {
            this.conectividadService = new ConectividadService(this.ecsManager);
        }
        return this.conectividadService;
    }

    private getFirewallService(): FirewallService {
        if (!this.firewallService) {
            this.firewallService = new FirewallService(
                this.getConectividadService(),
                this.getEventoService()
            );
        }
        return this.firewallService;
    }

    private getFirewallConfigService(): FirewallConfigService {
        if (!this.firewallConfigService) {
            this.firewallConfigService = new FirewallConfigService(this.ecsManager);
        }
        return this.firewallConfigService;
    }

    private getTransferenciaService(): TransferenciaService {
        if (!this.transferenciaService) {
            this.transferenciaService = new TransferenciaService(
                this.ecsManager,
                this.getEventoService()
            );
        }
        return this.transferenciaService;
    }

    // Conecta un dispositivo a una red específica
    public asignarRed(nombreDisp: string, nombreRed: string): void {
        // Buscar la red como entidad RedComponent
        let redEncontrada;
        for (const [, container] of this.ecsManager.getEntidades()) {
            const redComp = container.get(RedComponent);
            if (redComp && redComp.nombre === nombreRed) {
                redEncontrada = redComp;
                break;
            }
        }

        if (!redEncontrada) {
            console.warn(`Red "${nombreRed}" no encontrada`);
            return;
        }

        // Verificamos que el dispositivo no esté en la red
        if(redEncontrada.dispositivosConectados.some((d) => d === nombreDisp)){
            return;
        }

        redEncontrada.dispositivosConectados.push(nombreDisp);
    }

    // Envía tráfico entre dos dispositivos validando conectividad y firewall
     
    public enviarTrafico(
        dispOrigen: string,
        dispDestino: string,
        protocolo: TipoProtocolo,
        payload: unknown
    ): boolean {
        if (!this.getConectividadService().estanConectados(dispOrigen, dispDestino)) {
            return false;
        }

        if (!this.getFirewallService().validarFirewall(dispOrigen, dispDestino, protocolo)) {
            return false;
        }

        switch(protocolo){
            case TipoProtocolo.FTP: {
                const activo = payload as string;
                this.getTransferenciaService().enviarActivo(dispOrigen, dispDestino, activo);
                break;
            }
            // Próximamente para otros protocolos
        }

        // Tráfico exitoso
        this.getEventoService().registrarTrafico(dispOrigen, dispDestino, protocolo);
        
        return true;
    }

    public toggleFirewall(nombreRouter: string, habilitado: boolean): void {
        this.getFirewallConfigService().toggleFirewall(nombreRouter, habilitado);
    }

    public agregarReglaFirewall(
        nombreRouter: string,
        protocolo: TipoProtocolo,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        this.getFirewallConfigService().agregarReglaFirewall(nombreRouter, protocolo, accion, direccion);
    }

    public agregarExcepcionFirewall(
        nombreRouter: string,
        protocolo: TipoProtocolo,
        nombreDispositivo: string,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        this.getFirewallConfigService().agregarExcepcionFirewall(
            nombreRouter,
            protocolo,
            nombreDispositivo,
            accion,
            direccion
        );
    }

    public setPoliticaFirewall(
        nombreRouter: string,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        this.getFirewallConfigService().setPoliticaFirewall(nombreRouter, politica);
    }

    public setPoliticaFirewallSaliente(
        nombreRouter: string,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        this.getFirewallConfigService().setPoliticaFirewallSaliente(nombreRouter, politica);
    }

    public setPoliticaFirewallEntrante(
        nombreRouter: string,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        this.getFirewallConfigService().setPoliticaFirewallEntrante(nombreRouter, politica);
    }
}
