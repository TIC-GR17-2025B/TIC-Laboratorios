import { EventosRed } from "../../types/EventosEnums";
import type { DireccionTrafico } from "../../types/FirewallTypes";
import { TipoProtocolo } from "../../types/TrafficEnums";
import type { ECSManager } from "../core";
import type { Entidad } from "../core/Componente";
import { SistemaRed } from "../systems";

export class RedController {
  public ecsManager: ECSManager;

  private sistemaRed?: SistemaRed;

  private static instance: RedController | null = null;

  constructor(ecsManager: ECSManager) {
    this.ecsManager = ecsManager;
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
      const d = data as { eventoConEntidades: {
        entidadEmisor: number,
        entidadReceptor: number,
        nombreActivo: unknown
      }};
      this.sistemaRed?.enviarTrafico(
        d.eventoConEntidades.entidadEmisor,
        d.eventoConEntidades.entidadReceptor,
        TipoProtocolo.FTP,
        d.eventoConEntidades.nombreActivo
      );
    });

    this.ecsManager.on(EventosRed.RED_ACTIVO_ENVIADO, (data: unknown) => {
      const d = data as {nombreActivo: string, d1: string, d2: string};
      console.log(`Se envió un activo: ${d.nombreActivo}. Desde ${d.d1} hacia ${d.d2}.`);
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

  public toggleConexionInternet(entidadRouter: Entidad, conectado: boolean): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.setConectadoAInternet(entidadRouter, conectado);
  }

}
