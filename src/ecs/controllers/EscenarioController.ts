import { AtaqueComponent, DispositivoComponent, EscenarioComponent, PresupuestoComponent, TiempoComponent } from "../components";
import { ECSManager, type Entidad } from "../core";
import { SistemaAtaque, SistemaPresupuesto, SistemaTiempo } from "../systems";
import { ScenarioBuilder } from "../utils/ScenarioBuilder";

export class EscenarioController {
  public escenario: any;
  public escManager: ECSManager;
  public builder!: ScenarioBuilder;

  private entidadTiempo?: Entidad;
  private sistemaTiempo?: SistemaTiempo;
  private sistemaPresupuesto?: SistemaPresupuesto;
  private entidadPresupuesto?: Entidad;
  private sistemaAtaque?: SistemaAtaque;

  private static instance: EscenarioController | null = null;

  private constructor(escenario: any) {
    this.escenario = escenario;
    this.escManager = new ECSManager();
  }

  // SINGLETON
  public static getInstance(escenario?: any): EscenarioController {
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
    this.builder = new ScenarioBuilder(this.escManager);
    this.builder.construirDesdeArchivo(this.escenario);
    if(!this.sistemaAtaque){
        this.sistemaAtaque = new SistemaAtaque();
        this.escManager.agregarSistema(this.sistemaAtaque);
    }
    this.escManager.emit("escenarioController:escenarioIniciado", {
      ataques: this.getAtaques()
    });
    this.escManager.on("tiempo:notificacionAtaque", (data: {descripcionAtaque: string}) => { console.log(data.descripcionAtaque) });
    this.escManager.on("tiempo:ejecucionAtaque", (data: {ataque: any}) => this.ejecutarAtaque(data.ataque));
    this.escManager.on("ataque:ataqueRealizado", (data: { ataque: any}) => {
      console.log(`Se comprometió el dispositivo: ${data.ataque.dispositivoAAtacar}. Causa: ${data.ataque.tipoAtaque}`)
    });
    this.escManager.on("ataque:ataqueMitigado", (data: { ataque: any}) => {
      console.log(`Se mitigó el ataque a: ${data.ataque.dispositivoAAtacar}. Ataque mitigado: ${data.ataque.tipoAtaque}`)
    });
  }

  public ejecutarTiempo(): any {
    if (!this.entidadTiempo) {
      this.entidadTiempo = this.escManager.agregarEntidad();
      this.escManager.agregarComponente(
        this.entidadTiempo,
        new TiempoComponent()
      );

      this.sistemaTiempo = new SistemaTiempo();
      this.escManager.agregarSistema(this.sistemaTiempo);
      this.sistemaTiempo.on("escenarioController:escenarioIniciado",
        (data: {ataques: any[]}) => {
          this.sistemaTiempo!.ataquesEscenario = data.ataques;
      });
    }

    const iniciarTiempo = () =>
      this.sistemaTiempo!.iniciar(this.entidadTiempo!);
    const pausarTiempo = () => this.sistemaTiempo!.pausar(this.entidadTiempo!);
    const reanudarTiempo = () =>
      this.sistemaTiempo!.reanudar(this.entidadTiempo!);

    return { iniciarTiempo, pausarTiempo, reanudarTiempo };
  }

  public estaTiempoPausado(): boolean {
    if (!this.escManager || !this.entidadTiempo) {
      return false;
    }

    const cont = this.escManager.getComponentes(this.entidadTiempo);
    if (!cont) return false;

    const tiempo = cont.get(TiempoComponent);
    return tiempo?.pausado ?? false;
  }

  public get tiempoTranscurrido(): number {
    if (!this.escManager || !this.entidadTiempo) {
      return 0;
    }

    const cont = this.escManager.getComponentes(this.entidadTiempo);
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
  public on(eventName: string, callback: (data: any) => void): () => void {
    return this.escManager.on(eventName, callback);
  }

  public efectuarPresupuesto(montoInicial: number): any {
    if (!this.entidadPresupuesto) {
      this.entidadPresupuesto = this.escManager.agregarEntidad();
      this.escManager.agregarComponente(
        this.entidadPresupuesto,
        new PresupuestoComponent(montoInicial)
      );
      this.sistemaPresupuesto = new SistemaPresupuesto();
      this.escManager.agregarSistema(this.sistemaPresupuesto);
    }

    const toggleConfiguracionWorkstation = (
      entidadWorkstation: Entidad,
      nombreConfig: string
    ) => {
      this.sistemaPresupuesto!.toggleConfiguracionWorkstation(
        this.entidadPresupuesto!,
        entidadWorkstation,
        nombreConfig
      );
    };

    return { toggleConfiguracionWorkstation };
  }

  public ejecutarAtaque(ataque: any){
      const entidadAtaque = this.escManager.agregarEntidad();
      this.escManager.agregarComponente(entidadAtaque, ataque);

      let dispositivos: any[][] = []; // Info de dispositivo: idEntidad y nombre

      this.builder.getEntidades().forEach((container, entidad) => {
        if(container.tiene(DispositivoComponent))
          dispositivos.push([entidad, container.get(DispositivoComponent).nombre]); 
      });

      const nombreDispositivoAAtacar = ataque.dispositivoAAtacar;

      const entidadDispConSuNombre = dispositivos.filter(([entidad, nombre]) => nombreDispositivoAAtacar == nombre);

      // CAMBIAR LUEGO: POR EL STRICT MODE SE MULTIPLICAN LAS ENTRADAS
      this.sistemaAtaque?.ejecutarAtaque(entidadDispConSuNombre[0][0], ataque);
  }

  public getPresupuestoActual(): number {
    if (!this.escManager || !this.entidadPresupuesto) {
      return 0;
    }
    const cont = this.escManager.getComponentes(this.entidadPresupuesto);
    if (!cont) return 0;

    const presupuesto = cont.get(PresupuestoComponent);
    return presupuesto?.monto ?? 0;
  }

  public getAtaques(): any[] {
    let ataques = [];

    for (const [, container] of this.builder.getEntidades()) {
      if (container.tiene(AtaqueComponent)) {
        ataques.push(container.get(AtaqueComponent));
        break; // CAMBIAR ESTO, EL STRICT MODE NO PERMITE TESTEAR CORRECTAMENTE
      }
    }

    return ataques;

  }

}
