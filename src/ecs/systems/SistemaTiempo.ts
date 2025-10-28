import { Sistema } from "../core";
import { type Entidad } from "../core";
import { TiempoComponent } from "../components";

export class SistemaTiempo extends Sistema {
  public componentesRequeridos = new Set([TiempoComponent]);
  public intervalo: ReturnType<typeof setInterval> | null = null;
  public ataquesEscenario: any[] = [];

  public actualizar(entidades: Set<Entidad>): void {
    console.log("SistemaTiempo llamado. Entidades: ", entidades.size);
    // Aquí capaz van futuras funciones dependientes del tiempo
  }

  public on(eventName: string, callback: (data: any) => void): () => void {
    return this.ecsManager.on(eventName, callback);
  }

  public pausar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;
    const tiempo = container.get(TiempoComponent);
    tiempo.pausado = true;
    // Emitir evento de pausa
    this.ecsManager.emit("tiempo:pausado", {
      transcurrido: tiempo.transcurrido,
      pausado: true,
    });
  }

  public reanudar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;
    const tiempo = container.get(TiempoComponent);
    tiempo.pausado = false;
    // Emitir evento de reanudación
    this.ecsManager.emit("tiempo:reanudado", {
      transcurrido: tiempo.transcurrido,
      pausado: false,
    });
  }

  public iniciar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;
    const tiempo = container.get(TiempoComponent);
    if (this.intervalo) return; // evitar múltiples intervalos
    this.intervalo = setInterval(() => {
      if (!tiempo.pausado) {
        tiempo.transcurrido += 1;
        // Emitir evento cuando el tiempo cambia
        this.ecsManager.emit("tiempo:actualizado", {
          transcurrido: tiempo.transcurrido,
          pausado: tiempo.pausado,
        });

        /* Verificar que sea un tiempo de notificacion de ataque 
           y verificar que sea un tiempo de ejecución de ataque
        */
        for(const ataque of this.ataquesEscenario){
          if(tiempo.transcurrido == ataque.tiempoNotificacion){
            this.ecsManager.emit("tiempo:notificacionAtaque", { descripcionAtaque: ataque.descripcion });
          }
          if(tiempo.transcurrido == ataque.tiempoEnOcurrir){
            this.ecsManager.emit("tiempo:ejecucionAtaque", { ataque });
          }
        }
      }
      console.log(`Tiempo transcurrido: ${tiempo.transcurrido}s`);
    }, 1000);
  }

}
