import { Sistema } from "../core";
import { type Entidad } from "../core";
import { TiempoComponent, AtaqueComponent } from "../components";

export class SistemaTiempo extends Sistema {
  public componentesRequeridos = new Set([TiempoComponent]);
  public intervalo: ReturnType<typeof setInterval> | null = null;
  public ataquesEscenario: AtaqueComponent[] = [];

  public on(eventName: string, callback: (data: unknown) => void): () => void {
    return this.ecsManager.on(eventName, callback);
  }

  public pausar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;

    const tiempo = container.get(TiempoComponent);
    if (!tiempo) return;
    tiempo.pausado = true;

    // IMPORTANTE: Detener el intervalo cuando se pausa
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }

    console.log("Pausando tiempo en SistemaTiempo", tiempo);
    this.ecsManager.emit("tiempo:pausado", {
      transcurrido: tiempo.transcurrido,
      pausado: true,
    });
  }

  public reanudar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;

    const tiempo = container.get(TiempoComponent);
    if (!tiempo) return;
    tiempo.pausado = false;

    // Reiniciar el intervalo cuando se reanuda
    this.iniciarIntervalo(tiempo);

    this.ecsManager.emit("tiempo:reanudado", {
      transcurrido: tiempo.transcurrido,
      pausado: false,
    });
  }

  public iniciar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;

    const tiempo = container.get(TiempoComponent);
    if (!tiempo) return;

    // Evitar múltiples intervalos
    if (this.intervalo) return;

    this.iniciarIntervalo(tiempo);
  }

  private iniciarIntervalo(tiempo: TiempoComponent) {
    this.intervalo = setInterval(() => {
      tiempo.transcurrido += 1;

      // Emitir evento cuando el tiempo cambia
      this.ecsManager.emit("tiempo:actualizado", {
        transcurrido: tiempo.transcurrido,
        pausado: tiempo.pausado,
      });

      /* Verificar que sea un tiempo de notificacion de ataque 
         y verificar que sea un tiempo de ejecución de ataque
      */
      for (const ataque of this.ataquesEscenario) {
        if (tiempo.transcurrido == ataque.tiempoNotificacion) {
          this.ecsManager.emit("tiempo:notificacionAtaque", {
            descripcionAtaque: ataque.descripcion,
          });
        }
        if (tiempo.transcurrido == ataque.tiempoEnOcurrir) {
          this.ecsManager.emit("tiempo:ejecucionAtaque", { ataque });
        }
      }

      //console.log(`Tiempo transcurrido: ${tiempo.transcurrido}s`);
    }, 1000);
  }

  // Método para limpiar el intervalo cuando se destruye el sistema
  public destruir() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }
}
