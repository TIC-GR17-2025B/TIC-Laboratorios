import {
  ActivoComponent,
  RouterComponent,
  DispositivoComponent,
  VPNGatewayComponent,
  ClienteVPNComponent,
} from "../components";
import { Sistema, type Entidad } from "../core";
import { TipoProtocolo } from "../../types/TrafficEnums";
import { AccionFirewall } from "../../types/FirewallTypes";
import type { DireccionTrafico, Reglas } from "../../types/FirewallTypes";
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
import { EventosPublicos, MensajesGenerales } from "../../types/EventosEnums";

// Sistema encargado de gestionar redes, conectividad y firewalls
export class SistemaRed extends Sistema {
  public componentesRequeridos = new Set([ActivoComponent, RouterComponent]);

  // Servicios especializados
  private conectividadService: ConectividadService | null = null;
  private eventoService: EventoRedService | null = null;
  private firewallService: FirewallService | null = null;
  private firewallConfigService: FirewallConfigService | null = null;
  private transferenciaService: TransferenciaService | null = null;
  private vpnService: VPNService | null = null;

  constructor() {
    super();
  }

  /*
  enviarActivo(
    entidadEmisora: Entidad,
    entidadReceptora: Entidad,
    nombreActivo: string
  ): void {
    //encontrar el activo en el emisor por su id
    const activoAEnviar = this.ecsManager
      .getComponentes(entidadEmisora)
      ?.get(ActivoComponent)
      ?.activos.find((a) => a.nombre === nombreActivo);

    // quitar el activo del emisor
    this.ecsManager
      .getComponentes(entidadEmisora)
      ?.get(ActivoComponent)
      ?.activos.filter((a) => a.nombre !== nombreActivo);

    // agregar el activo al receptor
    this.ecsManager
      .getComponentes(entidadReceptora)
      ?.get(ActivoComponent)
      ?.activos.push(activoAEnviar!);
  }
 */

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

    this.ecsManager.emit(EventosPublicos.RED_ASIGNADA, {
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

      this.ecsManager.emit(EventosPublicos.RED_REMOVIDA, {
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
    payload: unknown,
    esObjetivo?: boolean,
    debeSerBloqueado?: boolean
  ): void {
    const dispOrigen = this.ecsManager
      .getComponentes(entidadOrigen)
      ?.get(DispositivoComponent);
    const dispDestino = this.ecsManager
      .getComponentes(entidadDestino)
      ?.get(DispositivoComponent);

    if (!dispOrigen || !dispDestino) {
      return;
    }
    if (
      !this.getConectividadService().estanConectados(
        entidadOrigen,
        entidadDestino
      )
    ) {
      // console.log(
      //   `❌ SistemaRed.enviarTrafico: Dispositivos NO están conectados`
      // );
      this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA,
                             MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
      return;
    }

    //console.log(`✅ SistemaRed.enviarTrafico: Dispositivos ESTÁN conectados`);

    const resultadoFirewall = this.getFirewallService().validarFirewall(
      entidadOrigen,
      entidadDestino,
      protocolo
    );

    if (!resultadoFirewall.permitido) {
      // console.log(
      //   `❌ SistemaRed.enviarTrafico: Tráfico BLOQUEADO por firewall`
      // );

      // Emitir evento de bloqueo
      this.getEventoService().emitirEventoBloqueado(
        dispOrigen.nombre,
        dispDestino.nombre,
        protocolo,
        resultadoFirewall.entidadRouter,
        esObjetivo ?? false,
        debeSerBloqueado ?? true
      );

      return;
    }

    //console.log(`✅ SistemaRed.enviarTrafico: Firewall PERMITIÓ el tráfico`);

    // Emitir evento de tráfico permitido
    this.getEventoService().emitirEventoPermitido(
      dispOrigen.nombre,
      dispDestino.nombre,
      esObjetivo ?? false,
      debeSerBloqueado ?? false
    );

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
    // if (protocolo != TipoProtocolo.VPN_GATEWAY) {
    //   this.getEventoService().registrarTrafico(
    //     dispOrigen.nombre,
    //     dispDestino.nombre,
    //     protocolo
    //   );
    // }

    return;
  }

  public agregarReglaFirewall(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().agregarReglaFirewall(
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
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().bloquearProtocolosEnRed(
      entidadRouter,
      entidadRed,
      protocolos,
      direccion
    );
  }

  public permitirProtocolosEnRed(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().permitirProtocolosEnRed(
      entidadRouter,
      entidadRed,
      protocolos,
      direccion
    );
  }

  public obtenerReglasDeRed(
    entidadRouter: Entidad,
    entidadRed: Entidad
  ): Reglas[] {
    return this.getFirewallConfigService().obtenerReglasDeRed(
      entidadRouter,
      entidadRed
    );
  }

  public eliminarReglaFirewall(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().eliminarRegla(
      entidadRouter,
      entidadRed,
      protocolo,
      direccion
    );
  }

  public obtenerRedesDeRouter(entidadRouter: Entidad): Entidad[] {
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);
    return dispositivo?.redes || [];
  }

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

  /////////////////////////////// Métodos VPN //////////////////////////////////

  agregarPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    perfil: PerfilVPNGateway
  ): void {
    this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent)
      ?.perfilesVPNGateway.push(perfil);

    const nombreVPN = this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(DispositivoComponent)?.nombre;

    this.ecsManager.emit(
      EventosPublicos.VPN_GATEWAY_PERFIL_AGREGADO,
      `Se agregó correctamente un nuevo perfil de conexión VPN en ${nombreVPN}`
    );
  }

  // Se pasa la entidad del gateway de la cual se quiere eliminar un perfil, y se le pasa el índice de la tabla
  // que se corresponde con el array de perfiles (desde arriba de la tabla es el índice 0)
  removerPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    indexEnTabla: number
  ): void {
    const actualVPNGateway = this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent);
    if (actualVPNGateway) {
      actualVPNGateway.perfilesVPNGateway.splice(indexEnTabla, 1);
    }

    const nombreVPN = this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(DispositivoComponent)?.nombre;

    this.ecsManager.emit(
      EventosPublicos.VPN_GATEWAY_PERFIL_ELIMINADO,
      `Se eliminó correctamente un perfil de conexión VPN en ${nombreVPN}`
    );
  }

  agregarPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    perfil: PerfilClienteVPN
  ): void {
    this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent)
      ?.perfilesClienteVPN.push(perfil);

    const nombreCliente = this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(DispositivoComponent)?.nombre;

    this.ecsManager.emit(
      EventosPublicos.VPN_CLIENTE_PERFIL_AGREGADO,
      `Se agregó correctamente un nuevo perfil de conexión VPN en ${nombreCliente}`
    );
  }

  removerPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    indexEnTabla: number
  ): void {
    const actualClienteVPN = this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent);
    if (actualClienteVPN) actualClienteVPN.perfilesClienteVPN.splice(indexEnTabla, 1);

    const nombreCliente = this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(DispositivoComponent)?.nombre;

    this.ecsManager.emit(
      EventosPublicos.VPN_GATEWAY_PERFIL_ELIMINADO,
      `Se eliminó correctamente un perfil de conexión VPN en ${nombreCliente}`
    );
  }
}
