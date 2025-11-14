import type { ECSManager } from "../../core/ECSManager";
import { EventosPublicos } from "../../../types/EventosEnums";
import type {
  TipoProtocolo,
  // RegistroTrafico,
  RegistroFirewallBloqueado,
} from "../../../types/TrafficEnums";
import type { Entidad } from "../../core";
import { DispositivoComponent, RouterComponent } from "../../components";

export class EventoRedService {
  constructor(private ecsManager: ECSManager) {}

  emitirEventoPermitido(
    origen: string,
    destino: string,
    protocolo: TipoProtocolo
  ): void {
    this.ecsManager.emit(EventosPublicos.TRAFICO_PERMITIDO, {
      mensaje: `Trafico permitido: desde ${origen} hacia ${destino} [${protocolo}]`
    });
  }

  emitirEventoBloqueado(
    origen: string,
    destino: string,
    protocolo: TipoProtocolo,
    entidadRouter?: Entidad
  ): void {
    if (entidadRouter) {
      const dispositivo = this.ecsManager
        .getComponentes(entidadRouter)
        ?.get(DispositivoComponent);
      const nombreRouter = dispositivo?.nombre;

      const registro: RegistroFirewallBloqueado = {
        origen,
        destino,
        protocolo,
        mensaje: `Trafico bloqueado: desde ${origen} hacia ${destino} [${protocolo}]
        }`,
        tipo: "BLOQUEADO",
        entidadRouter,
        router: nombreRouter,
      };

      const routerComponent = this.ecsManager
        .getComponentes(entidadRouter)
        ?.get(RouterComponent);
      routerComponent?.logsTrafico.push(registro);
    }

    this.ecsManager.emit(EventosPublicos.TRAFICO_BLOQUEADO,{
      mensaje: `Trafico bloqueado: desde ${origen} hacia ${destino} [${protocolo}]`
    });
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
