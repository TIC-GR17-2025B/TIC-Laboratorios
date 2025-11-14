import type { ECSManager } from "../../core/ECSManager";
import { EventosPublicos } from "../../../types/EventosEnums";
import type {
  TipoProtocolo,
  // RegistroTrafico,
  RegistroFirewallBloqueado,
  RegistroFirewallPermitido,
} from "../../../types/TrafficEnums";
import type { Entidad } from "../../core";
import { DispositivoComponent, RouterComponent } from "../../components";

export class EventoRedService {
  constructor(private ecsManager: ECSManager) {}

  emitirEventoPermitido(
    origen: string,
    destino: string,
    protocolo: TipoProtocolo,
    entidadRouter?: Entidad
  ): void {
    const nombreRouter = this.obtenerNombreRouter(entidadRouter);

    const registro: RegistroFirewallPermitido = {
      origen,
      destino,
      protocolo,
      mensaje: `Conexión permitida: ${origen} → ${destino} [${protocolo}]${
        nombreRouter ? ` (${nombreRouter})` : ""
      }`,
      tipo: "PERMITIDO",
      entidadRouter,
      router: nombreRouter,
    };

    if (entidadRouter) {
      const routerComponent = this.ecsManager
        .getComponentes(entidadRouter)
        ?.get(RouterComponent);
      routerComponent?.logsTrafico.push(registro);
    }
  }

  emitirEventoBloqueado(
    origen: string,
    destino: string,
    protocolo: TipoProtocolo,
    razon?: string,
    entidadRouter?: Entidad
  ): void {
    const nombreRouter = this.obtenerNombreRouter(entidadRouter);

    const registro: RegistroFirewallBloqueado = {
      origen,
      destino,
      protocolo,
      mensaje: `Conexión bloqueada: ${origen} → ${destino} [${protocolo}]${
        razon ? ` - Razón: ${razon}` : ""
      }${nombreRouter ? ` (${nombreRouter})` : ""}`,
      tipo: "BLOQUEADO",
      razon,
      entidadRouter,
      router: nombreRouter,
    };

    if (entidadRouter) {
      const routerComponent = this.ecsManager
        .getComponentes(entidadRouter)
        ?.get(RouterComponent);
      routerComponent?.logsTrafico.push(registro);
    }
  }

  private obtenerNombreRouter(entidadRouter?: Entidad): string | undefined {
    if (!entidadRouter) return undefined;

    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);
    return dispositivo?.nombre;
  }

  // registrarTrafico(
  //   origen: string,
  //   destino: string,
  //   protocolo: TipoProtocolo
  // ): void {
  //   const registro: RegistroTrafico = {
  //     origen,
  //     destino,
  //     protocolo,
  //   };
  //
  //   this.ecsManager.emit(EventosRed.TRAFICO_ENVIADO, registro);
  // }

  emitirActivoEnviado(
    nombreActivo: string,
    origen: string,
    destino: string
  ): void {
    this.ecsManager.emit(EventosPublicos.RED_ACTIVO_ENVIADO, {
      nombreActivo,
      d1: origen,
      d2: destino,
    });
  }
}
