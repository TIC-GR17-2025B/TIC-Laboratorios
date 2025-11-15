import { TipoDispositivo } from "../../types/DeviceEnums";
import type {
  LogGeneral,
  PerfilClienteVPN,
  PerfilVPNGateway,
} from "../../types/EscenarioTypes";
import {
  EventosInternos,
  EventosPublicos,
  TipoLogGeneral,
} from "../../types/EventosEnums";
import { AccionFirewall } from "../../types/FirewallTypes";
import type { DireccionTrafico, Reglas } from "../../types/FirewallTypes";
import { TipoProtocolo, type RegistroFirewallBloqueado } from "../../types/TrafficEnums";
import {
  ClienteVPNComponent,
  DispositivoComponent,
  EscenarioComponent,
  RouterComponent,
  VPNGatewayComponent,
} from "../components";
import type { ECSManager } from "../core";
import type { Entidad } from "../core/Componente";
import {
  SistemaEvento,
  SistemaJerarquiaEscenario,
  SistemaRed,
} from "../systems";
import { RedDisponibilidadService, TransferenciaService } from "../systems/red";

export class RedController {
  public ecsManager: ECSManager;

  private sistemaRed?: SistemaRed;
  private sistemaEvento?: SistemaEvento;
  private sistemaJerarquia?: SistemaJerarquiaEscenario;
  private transferenciaService?: TransferenciaService;
  private redDisponibilidadService?: RedDisponibilidadService;

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

    if (!this.sistemaEvento) {
      this.sistemaEvento = new SistemaEvento();
      this.ecsManager.agregarSistema(this.sistemaEvento);
    }

    if (!this.transferenciaService) {
      this.transferenciaService = new TransferenciaService(this.ecsManager);
    }

    if (!this.redDisponibilidadService) {
      this.redDisponibilidadService = new RedDisponibilidadService(
        this.ecsManager
      );
    }

    this.ecsManager.on(EventosInternos.RED_ENVIAR_ACTIVO, (data: unknown) => {
      const d = data as {
        eventoConEntidades: {
          entidadEmisor: number;
          entidadReceptor: number;
          nombreActivo: string;
        };
      };
      this.sistemaRed?.enviarTrafico(
        d.eventoConEntidades.entidadEmisor,
        d.eventoConEntidades.entidadReceptor,
        TipoProtocolo.FTP,
        d.eventoConEntidades.nombreActivo
      );
    });

    this.ecsManager.on(EventosPublicos.RED_ACTIVO_ENVIADO, (data: unknown) => {
      const d = data as { nombreActivo: string; d1: string; d2: string };
      const log = {
        tipo: TipoLogGeneral.COMPLETADO,
        mensaje: `Se envió un activo: ${d.nombreActivo}. Desde ${d.d1} hacia ${d.d2}.`,
        pausarTiempo: false,
      };
      this.agregarLogGeneralEscenario(log);
    });

    this.ecsManager.on(
      EventosPublicos.RED_ACTIVO_NO_ENVIADO,
      (data: unknown) => {
        const mensaje = data as string;
        const log = {
          tipo: TipoLogGeneral.ADVERTENCIA,
          mensaje: mensaje,
          pausarTiempo: false,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    this.ecsManager.on(EventosInternos.RED_TRAFICO, (data: unknown) => {
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
      this.sistemaRed?.enviarTrafico(
        d.evento.infoAdicional.entidadOrigen,
        d.evento.infoAdicional.entidadDestino,
        d.evento.infoAdicional.protocolo,
        null
      );
      //console.log("Tráfico enviado desde el controlador de red", resultado);
    });

    this.ecsManager.on(
      EventosInternos.VPN_SOLICITUD_CONEXION,
      (data: unknown) => {
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
      }
    );

    this.ecsManager.on(
      EventosPublicos.VPN_CONEXION_RECHAZADA,
      (data: unknown) => {
        const mensaje = data as string;
        const log = {
          tipo: TipoLogGeneral.ATAQUE,
          mensaje: mensaje,
          pausarTiempo: true,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    this.ecsManager.on(
      EventosPublicos.VPN_CONEXION_ESTABLECIDA,
      (data: unknown) => {
        const mensaje = data as string;
        const log = {
          tipo: TipoLogGeneral.COMPLETADO,
          mensaje: mensaje,
          pausarTiempo: false,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    this.ecsManager.on(
      EventosPublicos.VPN_CLIENTE_PERFIL_AGREGADO,
      (data: unknown) => {
        const mensaje = data as string;
        const log = {
          tipo: TipoLogGeneral.COMPLETADO,
          mensaje: mensaje,
          pausarTiempo: false,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    this.ecsManager.on(
      EventosPublicos.VPN_CLIENTE_PERFIL_ELIMINADO,
      (data: unknown) => {
        const mensaje = data as string;
        const log = {
          tipo: TipoLogGeneral.ADVERTENCIA,
          mensaje: mensaje,
          pausarTiempo: false,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    this.ecsManager.on(
      EventosPublicos.VPN_GATEWAY_PERFIL_AGREGADO,
      (data: unknown) => {
        const mensaje = data as string;
        const log = {
          tipo: TipoLogGeneral.COMPLETADO,
          mensaje: mensaje,
          pausarTiempo: false,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    this.ecsManager.on(
      EventosPublicos.VPN_GATEWAY_PERFIL_ELIMINADO,
      (data: unknown) => {
        const mensaje = data as string;
        const log = {
          tipo: TipoLogGeneral.ADVERTENCIA,
          mensaje: mensaje,
          pausarTiempo: false,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    this.ecsManager.on(EventosPublicos.TRAFICO_PERMITIDO, (data: unknown) => {
      const d = data as { mensaje: string };
      const log = {
        tipo: TipoLogGeneral.COMPLETADO,
        mensaje: d.mensaje,
        pausarTiempo: false,
      };
      this.agregarLogGeneralEscenario(log);
    });

    this.ecsManager.on(EventosPublicos.TRAFICO_BLOQUEADO, (data: unknown) => {
      const d = data as { mensaje: string };
      const log = {
        tipo: TipoLogGeneral.ATAQUE,
        mensaje: d.mensaje,
        pausarTiempo: true,
      };
      this.agregarLogGeneralEscenario(log);
    });
  }

  private agregarLogGeneralEscenario(log: LogGeneral): void {
    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      if (container.tiene(EscenarioComponent)) {
        this.ecsManager
          .getComponentes(entidad)
          ?.get(EscenarioComponent)
          ?.logsGenerales.push(log);
        break;
      }
    }
    this.ecsManager.emit(
      EventosPublicos.LOGS_GENERALES_ACTUALIZADOS,
      log.pausarTiempo
    );
  }

  public asignarRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    if (!this.sistemaRed || !this.redDisponibilidadService) {
      console.error("Sistema de red no inicializado");
      return;
    }

    // Validar si el dispositivo puede conectarse a esta red
    if (
      !this.redDisponibilidadService.puedeConectarseARed(
        entidadDisp,
        entidadRed
      )
    ) {
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

  public obtenerRedesDisponibles(entidadDisp: Entidad): Entidad[] {
    if (!this.redDisponibilidadService) return [];
    return this.redDisponibilidadService.obtenerRedesDisponibles(entidadDisp);
  }

  // ==================== MÉTODOS DE FIREWALL ====================

  public agregarReglaFirewall(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.agregarReglaFirewall(
      entidadRouter,
      entidadRed,
      protocolo,
      accion,
      direccion
    );
  }

  public bloquearProtocolosEnRed(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    const todosLosProtocolos = this.obtenerTodosLosProtocolos();
    this.sistemaRed.bloquearProtocolosEnRed(
      entidadRouter,
      entidadRed,
      todosLosProtocolos,
      direccion
    );
  }

  public permitirProtocolosEnRed(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    const todosLosProtocolos = this.obtenerTodosLosProtocolos();
    this.sistemaRed.permitirProtocolosEnRed(
      entidadRouter,
      entidadRed,
      todosLosProtocolos,
      direccion
    );
  }

  public obtenerReglasDeRed(
    entidadRouter: Entidad,
    entidadRed: Entidad
  ): Reglas[] {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return [];
    }
    return this.sistemaRed.obtenerReglasDeRed(entidadRouter, entidadRed);
  }

  public eliminarReglaFirewall(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.eliminarReglaFirewall(
      entidadRouter,
      entidadRed,
      protocolo,
      direccion
    );
  }

  estaProtocoloBloqueadoEnRed(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    direccion: DireccionTrafico
  ): boolean {
    const configuracionFirewall = this.obtenerReglasDeRed(
      entidadRouter,
      entidadRed
    );

    if (!configuracionFirewall) {
      return false;
    }

    const reglaEncontrada = configuracionFirewall.find(
      (regla) => regla.protocolo === protocolo && regla.direccion === direccion
    );

    return !!reglaEncontrada;
  }

  public obtenerLogsTrafico(entidadRouter: Entidad): RegistroFirewallBloqueado[] {
    const router = this.obtenerRouter(entidadRouter);
    return router?.logsTrafico || [];
  }

  public obtenerTodosLosProtocolos(): TipoProtocolo[] {
    return Object.values(TipoProtocolo);
  }

  // ==================== FIN MÉTODOS DE FIREWALL ====================

  private obtenerRouter(entidadRouter: Entidad): RouterComponent | null {
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
    const worksYServersDeZona: Entidad[] = [];
    for (const entidadDispositivo of this.sistemaJerarquia?.obtenerDispositivosDeZona(
      entidadZona
    ) ?? []) {
      const tipoDispositivo = this.ecsManager
        .getComponentes(entidadDispositivo)
        ?.get(DispositivoComponent)?.tipo;
      if (
        tipoDispositivo === TipoDispositivo.WORKSTATION ||
        tipoDispositivo === TipoDispositivo.SERVER
      )
        worksYServersDeZona.push(entidadDispositivo);
    }
    return worksYServersDeZona;
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
    const dominiosRemotos: Entidad[] = [];
    const entidadZonaActual =
      this.sistemaJerarquia?.obtenerZonaDeDispositivo(entidadDispositivo);
    const entidadEscenario = this.sistemaJerarquia?.obtenerEscenarioDeZona(
      entidadZonaActual!
    );

    for (const entidadZona of this.sistemaJerarquia?.obtenerZonasDeEscenario(
      entidadEscenario!
    ) ?? []) {
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
    this.sistemaRed?.agregarPerfilVPNGateway(entidadVpnGateway, perfil);
  }

  removerPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    indexEnTabla: number
  ): void {
    this.sistemaRed?.removerPerfilVPNGateway(entidadVpnGateway, indexEnTabla);
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
    this.sistemaRed?.agregarPerfilClienteVPN(entidadClienteVpn, perfil);
  }

  removerPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    indexEnTabla: number
  ): void {
    this.sistemaRed?.removerPerfilClienteVPN(entidadClienteVpn, indexEnTabla);
  }
}
