import { ObjetosManejables } from "../../types/AccionesEnums";
import { EstadoAtaqueDispositivo, TipoEvento } from "../../types/DeviceEnums";
import type {
  PerfilClienteVPN,
  PerfilVPNGateway,
} from "../../types/EscenarioTypes";
import {
  EventosAtaque,
  EventosRed,
  EventosVPN,
} from "../../types/EventosEnums";
import {
  AtaqueComponent,
  DispositivoComponent,
  EventoComponent,
  WorkstationComponent,
} from "../components";
import { Sistema, type Entidad } from "../core";
import type { ClaseComponente } from "../core/Componente";

export class SistemaEvento extends Sistema {
  public componentesRequeridos: Set<ClaseComponente> = new Set([
    AtaqueComponent,
  ]);

  public on(eventName: string, callback: (data: unknown) => void): () => void {
    return this.ecsManager.on(eventName, callback);
  }

  public ejecutarAtaque(
    entidadDispositivo: Entidad,
    ataque: AtaqueComponent
  ): void {
    const container3 = this.ecsManager.getComponentes(entidadDispositivo);
    if (!container3) return;
    const dispositivoAAtacar = container3.get(DispositivoComponent);
    if (!dispositivoAAtacar) return;

    if (
      !this.verificarCondicionMitigacion(
        entidadDispositivo,
        ataque.condicionMitigacion
      )
    ) {
      dispositivoAAtacar.estadoAtaque = EstadoAtaqueDispositivo.COMPROMETIDO;
      this.ecsManager.emit(EventosAtaque.ATAQUE_REALIZADO, { ataque });
    } else {
      this.ecsManager.emit(EventosAtaque.ATAQUE_MITIGADO, { ataque });
    }
  }

  /* Se verifica la condición de mitigación para cada ataque */
  private verificarCondicionMitigacion(
    entidadDispositivo: Entidad,
    condicionMitigacion: unknown
  ): boolean {
    // Se obtiene el dispositivo general sobre el cual se realiza el ataque
    const containerDispositivo =
      this.ecsManager.getComponentes(entidadDispositivo);
    if (!containerDispositivo)
      throw new Error(
        `No existe contenedor para Entidad: ${entidadDispositivo}`
      );

    const condicion = condicionMitigacion as {
      objeto: string;
    };
    /* A partir del objeto de la condición de mitigación (o sea, lo que se supone que debe haberse topado para
     * mitigar el ataque), se verifica (en el preciso momento del ataque) que lo demás de la condición de mitigación
     * del ataque actual se haya cumplido; para lo cual, se extrae, en el momento del ataque, lo necesario para la
     * verificación de la condición de mitigación. De esta forma ya no se depende del registro de acciones ni del tiempo
     * en que estas hayan sido realizadas. */
    switch (condicion?.objeto) {
      case ObjetosManejables.CONFIG_WORKSTATION: {
        const c = condicionMitigacion as {
          val: {
            nombreConfig: string;
            activado: boolean;
          };
        };
        const dispositivo = containerDispositivo.get(WorkstationComponent);
        const config = dispositivo?.configuraciones.find(
          (conf) => conf.nombreConfig == c?.val.nombreConfig
        );
        if (config?.activado == c?.val.activado) return true;
        return false;
      }
      // Próximamente para otros dispositivos y/o configuraciones
    }

    return false;
  }

  /* A partir del formato general de eventos (1), se verifica qué tipo es, para según eso realizar lo que se tenga que hacer.
   * Para lo cual, se emiten los eventos (2) correspondientes para que las clases responsables se encarguen.
   * No confundir entre (1) y (2): (1) son los sucesos (como los ataques) que ocurren en la simulación. (2) son las "señales"
   * que se emiten para que los oyentes de estas señales hagan lo que se les pide según corresponda (es como el patrón Observador).*/
  public ejecutarEvento(evento: EventoComponent): void {
    switch (evento.tipoEvento) {
      case TipoEvento.ENVIO_ACTIVO: {
        console.log("Ejecutando evento de envío de activo...");
        // Convertir nombres de dispositivos a entidades
        const info = evento.infoAdicional as {
          nombreActivo: string;
          dispositivoEmisor: string;
          dispositivoReceptor: string;
        };
        const entidadEmisor = this.buscarDispositivoPorNombre(
          info.dispositivoEmisor
        );
        const entidadReceptor = this.buscarDispositivoPorNombre(
          info.dispositivoReceptor
        );

        if (!entidadEmisor || !entidadReceptor) {
          console.error(
            `No se encontraron los dispositivos: ${info.dispositivoEmisor}, ${info.dispositivoReceptor}`
          );
          return;
        }

        const eventoConEntidades = {
          entidadEmisor,
          entidadReceptor,
          nombreActivo: info.nombreActivo,
        };

        this.ecsManager.emit(EventosRed.RED_ENVIAR_ACTIVO, {
          eventoConEntidades,
        });
        break;
      }
      case TipoEvento.TRAFICO_RED: {
        console.log("Ejecutando evento de tráfico de red...");
        // Convertir nombres de dispositivos a entidades (null = Internet)
        const info = evento.infoAdicional as {
          dispositivoOrigen: string;
          dispositivoDestino: string;
          protocolo: unknown;
        };
        const entidadOrigen = this.buscarDispositivoPorNombre(
          info.dispositivoOrigen
        );
        const entidadDestino = this.buscarDispositivoPorNombre(
          info.dispositivoDestino
        );

        const eventoConEntidades = {
          ...evento,
          infoAdicional: {
            entidadOrigen,
            entidadDestino,
            protocolo: info.protocolo,
          },
        };

        this.ecsManager.emit(EventosRed.RED_TRAFICO, {
          evento: eventoConEntidades,
        });
        break;
      }
      case TipoEvento.CONEXION_VPN: {
        //Obtenemos los permisos del gateway y del cliente
        const info = evento.infoAdicional as {
          gateway: PerfilVPNGateway;
          cliente: PerfilClienteVPN;
        };

        const entidadOrigen = this.buscarDispositivoPorNombre(
          info.gateway.hostRemoto
        );
        const entidadDestino = this.buscarDispositivoPorNombre(
          info.gateway.hostLan
        );

        const permisosConEntidades = {
          entidadOrigen,
          entidadDestino,
          permisos: info,
        };

        this.ecsManager.emit(EventosVPN.VPN_SOLICITUD_CONEXION, {
          permisosConEntidades,
        });
        break;
      }
      // Próximamente para futuros eventos
    }
  }

  // Método helper para buscar un dispositivo por nombre
  private buscarDispositivoPorNombre(nombre: string): Entidad | null {
    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      const dispositivo = container.get(DispositivoComponent);
      if (dispositivo && dispositivo.nombre === nombre) {
        return entidad;
      }
    }
    return null;
  }
}
