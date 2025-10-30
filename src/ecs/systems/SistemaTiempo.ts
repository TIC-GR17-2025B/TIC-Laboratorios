import { Sistema } from "../core";
import { type Entidad } from "../core";
import { TiempoComponent } from "../components";

export class SistemaTiempo extends Sistema {
    public componentesRequeridos = new Set([TiempoComponent]);
    public intervalo: ReturnType<typeof setInterval> | null = null;
    
    public actualizar(entidades: Set<Entidad>): void {
        console.log("SistemaTiempo llamado. Entidades: ", entidades.size);
        // Aquí capaz van futuras funciones dependientes del tiempo
    }

    public pausar(entidad: Entidad) {
        console.log("Sistema tiempo: pausar");
        const container = this.ecsManager.getComponentes(entidad);
        if (!container) return;
        const tiempo = container.get(TiempoComponent);
        tiempo.pausado = true;
        //clearInterval(this.intervalo!);
        //this.intervalo = null;
    }

    public reanudar(entidad: Entidad) {
        console.log("Sistema tiempo: reanudar");
        const container = this.ecsManager.getComponentes(entidad);
        if (!container) return;
        const tiempo = container.get(TiempoComponent);
        tiempo.pausado = false;
    }

    public iniciar(entidad: Entidad) {
        const container = this.ecsManager.getComponentes(entidad);
        if (!container) return;
        const tiempo = container.get(TiempoComponent);
        if (this.intervalo) return; // evitar múltiples intervalos
        this.intervalo = setInterval(() => {
            if (!tiempo.pausado) {
                tiempo.transcurrido += 1;
            }
            console.log(`Tiempo transcurrido: ${tiempo.transcurrido}s`);
        }
        , 1000);
    }
    
}
