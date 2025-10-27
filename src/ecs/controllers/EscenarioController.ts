import { TiempoComponent } from "../components";
import { ECSManager, type Entidad } from "../core";
import { SistemaTiempo } from "../systems";
import { ScenarioBuilder } from "../utils/ScenarioBuilder";

export class EscenarioController {
    public escenario: any;
    public escManager: ECSManager;
    public builder!: ScenarioBuilder;

    constructor(escenario: any){
        this.escenario = escenario;
        this.escManager = new ECSManager();
    }

    public iniciarEscenario(): void {
        this.builder = new ScenarioBuilder(this.escManager);
        this.builder.construirDesdeArchivo(this.escenario); 
    }

    public ejecutarTiempo(): any {
        if (!(globalThis as any).__simECS) {
            const ecs = this.escManager;
            const timeEntity = ecs.agregarEntidad();
            ecs.agregarComponente(timeEntity, new TiempoComponent());
            const sistemaTiempo = new SistemaTiempo();
            ecs.agregarSistema(sistemaTiempo);

            // Almacenar en globalThis para accesibilidad entre componentes/hook invocaciones
            (globalThis as any).__simECS = {
              ecsManager: ecs,
              timeEntity,
              sistemaTiempo,
              // builder: null as ScenarioBuilder | null,
            };
        }

        this.escManager = (globalThis as any).__simECS.ecsManager as ECSManager;
        const entidadTiempo = (globalThis as any).__simECS.timeEntity as Entidad;
        const sistemaTiempo = (globalThis as any).__simECS.sistemaTiempo as SistemaTiempo;
        
        // Funciones relacionas al tiempo para ser expuestas
        const iniciarTiempo = () => sistemaTiempo.iniciar(entidadTiempo);
        const pausarTiempo = () => sistemaTiempo.pausar(entidadTiempo);
        const reanudarTiempo = () => sistemaTiempo.reanudar(entidadTiempo);
        const estaTiempoPausado = () => {
            if(!this.escManager) return false;
            const cont = this.escManager.getComponentes(entidadTiempo);
            if (!cont) return false;
            const tiempo = cont.get(TiempoComponent);
            return !!tiempo.pausado;
        }

        return {iniciarTiempo, pausarTiempo, reanudarTiempo, estaTiempoPausado};
    }
}
