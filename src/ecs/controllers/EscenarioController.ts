import {
  AtaqueComponent,
  DispositivoComponent,
  PresupuestoComponent,
  TiempoComponent,
  WorkstationComponent,
} from "../components";
import { ECSManager, type Entidad } from "../core";
import { SistemaAtaque, SistemaPresupuesto, SistemaTiempo } from "../systems";
import { ScenarioBuilder } from "../utils/ScenarioBuilder";
import type { Escenario } from "../../types/EscenarioTypes";

export class EscenarioController {
  public escenario: Escenario;
  public ecsManager: ECSManager;
  public builder!: ScenarioBuilder;

  private entidadTiempo?: Entidad;
  private sistemaTiempo?: SistemaTiempo;
  private sistemaPresupuesto?: SistemaPresupuesto;
  private entidadPresupuesto?: Entidad;
  private sistemaAtaque?: SistemaAtaque;
  private escenarioIniciado: boolean = false; // FLAG PARA EVITAR MÚLTIPLES INICIALIZACIONES

  private static instance: EscenarioController | null = null;

  private constructor(escenario: Escenario) {
    this.escenario = escenario;
    this.ecsManager = new ECSManager();
  }

  // SINGLETON
  public static getInstance(escenario?: Escenario): EscenarioController {
    if (!EscenarioController.instance) {
      if (!escenario) {
        throw new Error(
          "Debe proporcionar un escenario para inicializar el controlador la primera vez."
        );
      }
      EscenarioController.instance = new EscenarioController(escenario);
    } else if (escenario) {
      EscenarioController.instance.escenario = escenario;
    }
    return EscenarioController.instance;
  }

  public iniciarEscenario(): void {
    // EVITAR MÚLTIPLES INICIALIZACIONES
    if (this.escenarioIniciado) {
      return;
    }

    this.builder = new ScenarioBuilder(this.ecsManager);
    this.builder.construirDesdeArchivo(this.escenario);

    if (!this.sistemaAtaque) {
      this.sistemaAtaque = new SistemaAtaque();
      this.ecsManager.agregarSistema(this.sistemaAtaque);
    }

    // NO emitir el evento aquí - lo haremos después de que los sistemas se suscriban
    this.ecsManager.on("tiempo:notificacionAtaque", (data: unknown) => {
      const d = data as { descripcionAtaque: string };
      console.log(d.descripcionAtaque);
    });

    this.ecsManager.on("tiempo:ejecucionAtaque", (data: unknown) => {
      const d = data as { ataque: AtaqueComponent };
      this.ejecutarAtaque(d.ataque);
    });

    this.ecsManager.on("ataque:ataqueRealizado", (data: unknown) => {
      const d = data as { ataque: AtaqueComponent };
      console.log(
        `Se comprometió el dispositivo: ${d.ataque.dispositivoAAtacar}. Causa: ${d.ataque.tipoAtaque}`
      );
    });

    this.ecsManager.on("ataque:ataqueMitigado", (data: unknown) => {
      const d = data as { ataque: AtaqueComponent };
      console.log(
        `Se mitigó el ataque a: ${d.ataque.dispositivoAAtacar}. Ataque mitigado: ${d.ataque.tipoAtaque}`
      );
    });

    this.ecsManager.on("presupuesto:agotado", () => {
      this.sistemaTiempo?.pausar(this.entidadTiempo!);
      console.log("Se agotó el presupuesto, fin de la partida.");
    });

    this.ecsManager.on("red:activoEnviado", (data: { d1: string, d2: string, nombreActivo: string }) => {
      console.log(`Se envió el activo "${data.nombreActivo}" desde ${data.d1} hacia ${data.d2}.`);
    });

    this.escenarioIniciado = true;
  }

  public cargarAtaquesEnSistema(): void {
    if (!this.sistemaTiempo) {
      console.error("SistemaTiempo no existe aún");
      return;
    }
    const ataques = this.getAtaques();
    this.sistemaTiempo.ataquesEscenario = ataques;
  }

  public ejecutarTiempo(): void {
    if (!this.entidadTiempo) {
      this.entidadTiempo = this.ecsManager.agregarEntidad();
      this.ecsManager.agregarComponente(
        this.entidadTiempo,
        new TiempoComponent()
      );

      this.sistemaTiempo = new SistemaTiempo();
      this.ecsManager.agregarSistema(this.sistemaTiempo);
    }
  }
  public iniciarTiempo(): void {
    if (!this.sistemaTiempo || !this.entidadTiempo) {
      console.error("Sistema de tiempo no inicializado");
      return;
    }
    this.sistemaTiempo.iniciar(this.entidadTiempo);
  }

  public pausarTiempo(): void {
    if (!this.sistemaTiempo || !this.entidadTiempo) {
      console.error("Sistema de tiempo no inicializado");
      return;
    }
    this.sistemaTiempo.pausar(this.entidadTiempo);
  }

  public reanudarTiempo(): void {
    if (!this.sistemaTiempo || !this.entidadTiempo) {
      console.error("Sistema de tiempo no inicializado");
      return;
    }

    this.sistemaTiempo.reanudar(this.entidadTiempo);
  }

  public estaTiempoPausado(): boolean {
    if (!this.ecsManager || !this.entidadTiempo) {
      return false;
    }

    const cont = this.ecsManager.getComponentes(this.entidadTiempo);
    if (!cont) return false;

    const tiempo = cont.get(TiempoComponent);
    return tiempo?.pausado ?? false;
  }

  public get tiempoTranscurrido(): number {
    if (!this.ecsManager || !this.entidadTiempo) {
      return 0;
    }

    const cont = this.ecsManager.getComponentes(this.entidadTiempo);
    if (!cont) return 0;

    const tiempo = cont.get(TiempoComponent);
    return tiempo?.transcurrido ?? 0;
  }

  /**
   * Suscribe un callback a eventos del ECSManager
   * @param eventName Nombre del evento (ej: 'tiempo:actualizado')
   * @param callback Función a ejecutar cuando se emita el evento
   * @returns Función para desuscribirse del evento
   */
  public on(eventName: string, callback: (data: unknown) => void): () => void {
    return this.ecsManager.on(eventName, callback);
  }

  public efectuarPresupuesto(montoInicial: number): void {
    if (!this.entidadPresupuesto) {
      this.entidadPresupuesto = this.ecsManager.agregarEntidad();
      this.ecsManager.agregarComponente(
        this.entidadPresupuesto,
        new PresupuestoComponent(montoInicial)
      );
      this.sistemaPresupuesto = new SistemaPresupuesto();
      this.ecsManager.agregarSistema(this.sistemaPresupuesto);
    }
  }

  public toggleConfiguracionWorkstation(
    entidadWorkstation: Entidad,
    nombreConfig: string
  ): void {
    if (!this.sistemaPresupuesto || !this.entidadPresupuesto) {
      console.error("Sistema de presupuesto no inicializado");
      return;
    }
    this.sistemaPresupuesto.toggleConfiguracionWorkstation(
      this.entidadPresupuesto,
      entidadWorkstation,
      nombreConfig
    );
  }

  public ejecutarAtaque(ataque: AtaqueComponent) {
    const entidadAtaque = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(entidadAtaque, ataque);

    const dispositivos: [Entidad, string][] = []; // Info de dispositivo: idEntidad y nombre

    this.builder.getEntidades().forEach((container, entidad) => {
      if (container.tiene(DispositivoComponent))
        dispositivos.push([
          entidad,
          container.get(DispositivoComponent)?.nombre ?? "",
        ]);
    });

    const nombreDispositivoAAtacar = ataque.dispositivoAAtacar;

    const entidadDispConSuNombre = dispositivos.filter(
      ([, nombre]) => nombreDispositivoAAtacar == nombre
    );

    if (entidadDispConSuNombre.length > 0) {
      this.sistemaAtaque?.ejecutarAtaque(entidadDispConSuNombre[0][0], ataque);
    }
  }

  public getPresupuestoActual(): number {
    if (!this.ecsManager || !this.entidadPresupuesto) {
      return 0;
    }
    const cont = this.ecsManager.getComponentes(this.entidadPresupuesto);
    if (!cont) return 0;

    const presupuesto = cont.get(PresupuestoComponent);
    return presupuesto?.monto ?? 0;
  }

  public getAtaques(): AtaqueComponent[] {
    const ataques: AtaqueComponent[] = [];

    for (const [, container] of this.builder.getEntidades()) {
      if (container.tiene(AtaqueComponent)) {
        const a = container.get(AtaqueComponent);
        if (a) ataques.push(a);
      }
    }

    return ataques;
  }

  public getWorkstationsYServers(): Entidad[] {
    const workstationsYServers: Entidad[] = [];

    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      if (
        container.tiene(
          WorkstationComponent
        ) /* || container.tiene(ServidorComponent)*/
      ) {
        workstationsYServers.push(entidad);
      }
    }

    return workstationsYServers;
  }

  public getAllDispositivos(): Entidad[] {
    const dispositivosTodos: Entidad[] = [];

    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      if (container.tiene(DispositivoComponent)) {
        dispositivosTodos.push(entidad);
      }
    }

    return dispositivosTodos;
  }

  // MÉTODO PARA RESETEAR EL SINGLETON (útil para desarrollo/testing)
  public static reset(): void {
    if (EscenarioController.instance?.sistemaTiempo) {
      EscenarioController.instance.sistemaTiempo.destruir();
    }
    EscenarioController.instance = null;
  }
}
