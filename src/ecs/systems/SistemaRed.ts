import {
  ActivoComponent,
  RouterComponent,
  DispositivoComponent,
} from "../components";
import { Sistema, type Entidad } from "../core";
import { TipoProtocolo } from "../../types/TrafficEnums";
import type { DireccionTrafico } from "../../types/FirewallTypes";
import { EventosRed } from "../../types/EventosEnums";
import {
  ConectividadService,
  EventoRedService,
  FirewallService,
  FirewallConfigService,
  TransferenciaService,
  VPNService,
} from "./red";
import type {
  PerfilClienteVPN,
  PerfilVPNGateway,
} from "../../types/EscenarioTypes";

// Sistema encargado de gestionar redes, conectividad y firewalls
export class SistemaRed extends Sistema {
  public componentesRequeridos = new Set([ActivoComponent, RouterComponent]);

  // Servicios especializados
  private conectividadService: ConectividadService;
  private eventoService: EventoRedService;
  private firewallService: FirewallService;
  private firewallConfigService: FirewallConfigService;
  private transferenciaService: TransferenciaService;
  private vpnService: VPNService;

  constructor() {
    super();
    this.eventoService = null as any;
    this.conectividadService = null as any;
    this.firewallService = null as any;
    this.firewallConfigService = null as any;
    this.transferenciaService = null as any;
    this.vpnService = null as any;
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
        this.getEventoService(),
        this.ecsManager
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

  private getVPNService(): VPNService {
    if (!this.vpnService) {
      this.vpnService = new VPNService(this.ecsManager);
    }
    return this.vpnService;
  }

  // Conecta un dispositivo a una red específica
  public asignarRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    const dispositivo = this.ecsManager
      .getComponentes(entidadDisp)
      ?.get(DispositivoComponent);

    // Verificamos que el dispositivo no esté en la red
    if (dispositivo?.redes.some((d) => d === entidadRed)) {
      return;
    }

    dispositivo?.redes.push(entidadRed);

    this.ecsManager.emit(EventosRed.RED_ASIGNADA, {
      entidadDispositivo: entidadDisp,
      entidadRed: entidadRed,
    });
  }

  // Remueve un dispositivo de una red específica
  public removerRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    const dispositivo = this.ecsManager
      .getComponentes(entidadDisp)
      ?.get(DispositivoComponent);

    if (!dispositivo) return;

    const index = dispositivo.redes.indexOf(entidadRed);
    if (index > -1) {
      dispositivo.redes.splice(index, 1);

      this.ecsManager.emit(EventosRed.RED_REMOVIDA, {
        entidadDispositivo: entidadDisp,
        entidadRed: entidadRed,
      });
    }
  }

  // Envía tráfico entre dos dispositivos validando conectividad y firewall
  public enviarTrafico(
    entidadOrigen: Entidad,
    entidadDestino: Entidad,
    protocolo: TipoProtocolo,
    payload: unknown
  ): boolean {
    const dispOrigen = this.ecsManager
      .getComponentes(entidadOrigen)
      ?.get(DispositivoComponent);
    const dispDestino = this.ecsManager
      .getComponentes(entidadDestino)
      ?.get(DispositivoComponent);

    if (!dispOrigen || !dispDestino) {
      console.error(`❌ SistemaRed.enviarTrafico: Dispositivos no encontrados`);
      return false;
    }

    console.log(
      `🔄 SistemaRed.enviarTrafico: ${dispOrigen.nombre} → ${dispDestino.nombre} [${protocolo}]`
    );

    if (
      !this.getConectividadService().estanConectados(
        entidadOrigen,
        entidadDestino
      )
    ) {
      console.log(
        `❌ SistemaRed.enviarTrafico: Dispositivos NO están conectados`
      );
      return false;
    }

    console.log(`✅ SistemaRed.enviarTrafico: Dispositivos ESTÁN conectados`);

    if (
      !this.getFirewallService().validarFirewall(
        entidadOrigen,
        entidadDestino,
        protocolo
      )
    ) {
      console.log(
        `❌ SistemaRed.enviarTrafico: Tráfico BLOQUEADO por firewall`
      );
      return false;
    }

    console.log(`✅ SistemaRed.enviarTrafico: Firewall PERMITIÓ el tráfico`);

    switch (protocolo) {
      case TipoProtocolo.FTP: {
        const activo = payload as string;
        this.getTransferenciaService().enviarActivo(
          entidadOrigen,
          entidadDestino,
          activo
        );
        break;
      }
      case TipoProtocolo.VPN_GATEWAY: {
        const permisosVPN = payload as {
          gateway: PerfilVPNGateway;
          cliente: PerfilClienteVPN;
        };
        this.getVPNService().establecerConexion(
          entidadOrigen,
          entidadDestino,
          permisosVPN
        );
        break;
      }
      // Próximamente para otros protocolos
    }

    // Tráfico exitoso
    if (protocolo != TipoProtocolo.VPN_GATEWAY) {
      this.getEventoService().registrarTrafico(
        dispOrigen.nombre,
        dispDestino.nombre,
        protocolo
      );
    }

    return true;
  }

  public toggleFirewall(entidadRouter: Entidad, habilitado: boolean): void {
    this.getFirewallConfigService().toggleFirewall(entidadRouter, habilitado);
  }

  public agregarReglaFirewall(
    entidadRouter: Entidad,
    protocolo: TipoProtocolo,
    accion: "PERMITIR" | "DENEGAR",
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().agregarReglaFirewall(
      entidadRouter,
      protocolo,
      accion,
      direccion
    );
  }

  public agregarExcepcionFirewall(
    entidadRouter: Entidad,
    protocolo: TipoProtocolo,
    entidadDispositivo: Entidad,
    accion: "PERMITIR" | "DENEGAR",
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().agregarExcepcionFirewall(
      entidadRouter,
      protocolo,
      entidadDispositivo,
      accion,
      direccion
    );
  }

  public setPoliticaFirewall(
    entidadRouter: Entidad,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    this.getFirewallConfigService().setPoliticaFirewall(
      entidadRouter,
      politica
    );
  }

  public setPoliticaFirewallSaliente(
    entidadRouter: Entidad,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    this.getFirewallConfigService().setPoliticaFirewallSaliente(
      entidadRouter,
      politica
    );
  }

  public setPoliticaFirewallEntrante(
    entidadRouter: Entidad,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    this.getFirewallConfigService().setPoliticaFirewallEntrante(
      entidadRouter,
      politica
    );
  }

  public setConectadoAInternet(
    entidadRouter: Entidad,
    conectado: boolean
  ): void {
    const router = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(RouterComponent);
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);

    if (!router || !dispositivo) {
      console.error(`Router con entidad "${entidadRouter}" no encontrado`);
      return;
    }

    const estadoAnterior = router.conectadoAInternet;
    router.conectadoAInternet = conectado;
    if (estadoAnterior !== conectado) {
      const evento = conectado
        ? EventosRed.INTERNET_CONECTADO
        : EventosRed.INTERNET_DESCONECTADO;
      this.ecsManager.emit(evento, {
        router: dispositivo.nombre,
        conectado,
        mensaje: `Router "${dispositivo.nombre}" ${
          conectado ? "conectado a" : "desconectado de"
        } Internet`,
        tipo: conectado ? "INTERNET_CONECTADO" : "INTERNET_DESCONECTADO",
      });
    }
  }

  public obtenerRedesDeRouter(entidadRouter: Entidad): Entidad[] {
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);
    return dispositivo?.redes || [];
  }

  /**
   * Obtiene todos los dispositivos que están conectados a una red específica
   * @param entidadRed - La entidad de la red
   * @returns Array de entidades de dispositivos conectados a la red
   */
  public obtenerDispositivosPorRed(entidadRed: Entidad): Entidad[] {
    const dispositivos: Entidad[] = [];

    // Itera una sola vez por todas las entidades del ECS
    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      // Solo verifica entidades que tienen DispositivoComponent
      if (container.tiene(DispositivoComponent)) {
        const dispositivo = container.get(DispositivoComponent);

        // Verifica si el dispositivo tiene la red especificada
        if (dispositivo?.redes.includes(entidadRed)) {
          dispositivos.push(entidad);
        }
      }
    }

    return dispositivos;
  }
}
