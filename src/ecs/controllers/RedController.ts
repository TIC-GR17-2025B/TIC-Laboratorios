import type {
  PerfilClienteVPN,
  PerfilVPNGateway,
} from "../../types/EscenarioTypes";
import { EventosRed, EventosVPN } from "../../types/EventosEnums";
import type {
  DireccionTrafico,
  ConfiguracionFirewall,
} from "../../types/FirewallTypes";
import { TipoProtocolo } from "../../types/TrafficEnums";
import {
  ClienteVPNComponent,
  RouterComponent,
  VPNGatewayComponent,
} from "../components";
import type { ECSManager } from "../core";
import type { Entidad } from "../core/Componente";
import { SistemaJerarquiaEscenario, SistemaRed } from "../systems";

export class RedController {
  public ecsManager: ECSManager;

  private sistemaRed?: SistemaRed;
  private sistemaJerarquia?: SistemaJerarquiaEscenario;

  private static instance: RedController | null = null;

  constructor(ecsManager: ECSManager) {
    this.ecsManager = ecsManager;
    this.sistemaJerarquia = this.ecsManager.getSistema(
      SistemaJerarquiaEscenario
    );
  }

  // Singleton
  public static getInstance(ecsManager?: ECSManager): RedController {
    if (!RedController.instance) {
      if (!ecsManager) {
        throw new Error(
          "Debe proporcionar una instancia de ECSManager para inicializar el controlador la primera vez."
        );
      }
      RedController.instance = new RedController(ecsManager);
    } else if (ecsManager) {
      RedController.instance.ecsManager = ecsManager;
    }
    return RedController.instance;
  }

  public iniciarController(): void {
    if (!this.sistemaRed) {
      this.sistemaRed = new SistemaRed();
      this.ecsManager.agregarSistema(this.sistemaRed);
    }

    this.ecsManager.on(EventosRed.RED_ENVIAR_ACTIVO, (data: unknown) => {
      const d = data as {
        eventoConEntidades: {
          entidadEmisor: number;
          entidadReceptor: number;
          nombreActivo: unknown;
        };
      };
      this.sistemaRed?.enviarTrafico(
        d.eventoConEntidades.entidadEmisor,
        d.eventoConEntidades.entidadReceptor,
        TipoProtocolo.FTP,
        d.eventoConEntidades.nombreActivo
      );
    });

    this.ecsManager.on(EventosRed.RED_ACTIVO_ENVIADO, (data: unknown) => {
      const d = data as { nombreActivo: string; d1: string; d2: string };
      console.log(
        `Se envió un activo: ${d.nombreActivo}. Desde ${d.d1} hacia ${d.d2}.`
      );
    });

    this.ecsManager.on(EventosRed.RED_TRAFICO, (data: unknown) => {
      const d = data as {
        evento: {
          infoAdicional: {
            entidadOrigen: Entidad;
            entidadDestino: Entidad;
            protocolo: TipoProtocolo;
          };
        };
      };

      // Enviar tráfico directamente con el protocolo del evento
      const resultado = this.sistemaRed?.enviarTrafico(
        d.evento.infoAdicional.entidadOrigen,
        d.evento.infoAdicional.entidadDestino,
        d.evento.infoAdicional.protocolo,
        null
      );
      console.log("Tráfico enviado desde el controlador de red", resultado);
    });

    this.ecsManager.on(EventosVPN.VPN_SOLICITUD_CONEXION, (data: unknown) => {
      const d = data as {
        permisosConEntidades: {
          entidadOrigen: Entidad;
          entidadDestino: Entidad;
          permisos: unknown;
        };
      };

      this.sistemaRed?.enviarTrafico(
        d.permisosConEntidades.entidadOrigen,
        d.permisosConEntidades.entidadDestino,
        TipoProtocolo.VPN_GATEWAY,
        d.permisosConEntidades.permisos
      );
    });

    this.ecsManager.on(EventosVPN.VPN_CONEXION_RECHAZADA, (data: unknown) => {
      const d = data as string;
      console.log(d);
    });

    this.ecsManager.on(EventosVPN.VPN_CONEXION_ESTABLECIDA, (data: unknown) => {
      const d = data as string;
      console.log(d);
    });
  }

  public asignarRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.asignarRed(entidadDisp, entidadRed);
  }

  public removerRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.removerRed(entidadDisp, entidadRed);
  }

  public toggleActivacionFirewall(
    entidadRouter: Entidad,
    habilitado: boolean
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }

    this.sistemaRed.toggleFirewall(entidadRouter, habilitado);
  }

  public agregarReglaFirewall(
    entidadRouter: Entidad,
    protocolo: TipoProtocolo,
    accion: "PERMITIR" | "DENEGAR",
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.agregarReglaFirewall(
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
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.agregarExcepcionFirewall(
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
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.setPoliticaFirewall(entidadRouter, politica);
  }

  public setPoliticaFirewallSaliente(
    entidadRouter: Entidad,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.setPoliticaFirewallSaliente(entidadRouter, politica);
  }

  public setPoliticaFirewallEntrante(
    entidadRouter: Entidad,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.setPoliticaFirewallEntrante(entidadRouter, politica);
  }

  public bloquearTodosProtocolos(
    entidadRouter: Entidad,
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    protocolos.forEach((protocolo) => {
      this.sistemaRed!.agregarReglaFirewall(
        entidadRouter,
        protocolo,
        "DENEGAR",
        direccion
      );
    });
  }

  public permitirTodosProtocolos(
    entidadRouter: Entidad,
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    protocolos.forEach((protocolo) => {
      this.sistemaRed!.agregarReglaFirewall(
        entidadRouter,
        protocolo,
        "PERMITIR",
        direccion
      );
    });
  }

  public toggleConexionInternet(
    entidadRouter: Entidad,
    conectado: boolean
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.setConectadoAInternet(entidadRouter, conectado);
  }

  public obtenerConfiguracionFirewall(
    entidadRouter: Entidad
  ): ConfiguracionFirewall | null {
    const container = this.ecsManager.getComponentes(entidadRouter);
    const routerComponent = container?.get(RouterComponent);
    return routerComponent?.firewall || null;
  }

  public obtenerRouter(entidadRouter: Entidad): RouterComponent | null {
    const container = this.ecsManager.getComponentes(entidadRouter);
    return container?.get(RouterComponent) || null;
  }

  public obtenerRedesDeRouter(entidadRouter: Entidad): Entidad[] {
    if (!this.sistemaRed) {
      return [];
    }
    return this.sistemaRed.obtenerRedesDeRouter(entidadRouter);
  }

  /**
   * Obtiene todos los dispositivos conectados a una red específica
   * @param entidadRed - La entidad de la red
   * @returns Array de entidades de dispositivos conectados a la red
   */
  public obtenerDispositivosPorRed(entidadRed: Entidad): Entidad[] {
    if (!this.sistemaRed) {
      return [];
    }
    return this.sistemaRed.obtenerDispositivosPorRed(entidadRed);
  }

  getDispositivosPorZona(entidadZona: Entidad): Entidad[] | undefined {
    return this.sistemaJerarquia?.obtenerDispositivosDeZona(entidadZona);
  }

  // Obtiene las zonas locales del router/gateway (la zona donde está el dispositivo)
  getZonasLocales(entidadDispositivo: Entidad): Entidad[] {
    const entidadZonaActual =
      this.sistemaJerarquia?.obtenerZonaDeDispositivo(entidadDispositivo);

    // Devuelve solo la zona actual del dispositivo como zona local
    return entidadZonaActual ? [entidadZonaActual] : [];
  }

  // Se pasa el id del dispositivo actual para filtrar su zona y que solo devuelva las zonas remotas
  getDominiosRemotos(entidadDispositivo: Entidad): Entidad[] {
    let dominiosRemotos: Entidad[] = [];
    const entidadZonaActual =
      this.sistemaJerarquia?.obtenerZonaDeDispositivo(entidadDispositivo);
    const entidadEscenario = this.sistemaJerarquia?.obtenerEscenarioDeZona(
      entidadZonaActual!
    );

    for (const entidadZona of this.sistemaJerarquia?.obtenerZonasDeEscenario(
      entidadEscenario!
    )!) {
      if (entidadZona != entidadZonaActual) dominiosRemotos.push(entidadZona);
    }

    return dominiosRemotos;
  }

  getPerfilesVPNGateway(
    entidadVpnGateway: Entidad
  ): PerfilVPNGateway[] | undefined {
    return this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent)?.perfilesVPNGateway;
  }

  agregarPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    perfil: PerfilVPNGateway
  ): void {
    this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent)
      ?.perfilesVPNGateway.push(perfil);
  }

  // Se pasa la entidad del gateway de la cual se quiere eliminar un perfil, y se le pasa el índice de la tabla
  // que se corresponde con el array de perfiles (desde arriba de la tabla es el índice 0)
  removerPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    indexEnTabla: number
  ): void {
    let actualesPerfilesGateway = this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent)?.perfilesVPNGateway;
    actualesPerfilesGateway = actualesPerfilesGateway?.splice(indexEnTabla, 1);
  }

  getPerfilesClienteVPN(
    entidadClienteVpn: Entidad
  ): PerfilClienteVPN[] | undefined {
    return this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent)?.perfilesClienteVPN;
  }

  agregarPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    perfil: PerfilClienteVPN
  ): void {
    this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent)
      ?.perfilesClienteVPN.push(perfil);
  }

  removerPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    indexEnTabla: number
  ): void {
    let actualesPerfilesCliente = this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent)?.perfilesClienteVPN;
    actualesPerfilesCliente = actualesPerfilesCliente?.splice(indexEnTabla, 1);
  }
}
