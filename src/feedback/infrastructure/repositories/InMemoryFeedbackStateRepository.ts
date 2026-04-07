import type { IFeedbackStateRepository } from '../../domain/repositories/IFeedbackStateRepository.js';
import type { FeedbackState } from '../../domain/models/FeedbackState.js';


// Estado efímero: se pierde al reiniciar el servidor (redeploy en Render, etc.).
// Consecuencia: tras un redeploy, el feedback se habilita de nuevo para todos los estudiantes.
// Si esto es un problema, migrar a persistencia en DB (tabla feedback_state).
export class InMemoryFeedbackStateRepository implements IFeedbackStateRepository {
  private states: Map<string, FeedbackState> = new Map();

  private getKey(idEstudiante: number, slugEscenario: string): string {
    return `${idEstudiante}_${slugEscenario}`;
  }

  async guardar(idEstudiante: number, slugEscenario: string, numIntentos: number): Promise<void> {
    const key = this.getKey(idEstudiante, slugEscenario);

    const state: FeedbackState = {
      id_estudiante: idEstudiante,
      slug_escenario: slugEscenario,
      num_intentos_al_generar: numIntentos,
      fecha_generacion: new Date(),
    };

    this.states.set(key, state);
  }

  async obtener(idEstudiante: number, slugEscenario: string): Promise<FeedbackState | null> {
    const key = this.getKey(idEstudiante, slugEscenario);
    return this.states.get(key) || null;
  }

  async debeHabilitar(
    idEstudiante: number,
    slugEscenario: string,
    intentosActuales: number
  ): Promise<boolean> {
    const estado = await this.obtener(idEstudiante, slugEscenario);

    if (!estado) {
      return true;
    }


    return intentosActuales > estado.num_intentos_al_generar;
  }
}
