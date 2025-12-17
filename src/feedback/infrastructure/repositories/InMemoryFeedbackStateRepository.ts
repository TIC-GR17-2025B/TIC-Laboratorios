import type { IFeedbackStateRepository } from '../../domain/repositories/IFeedbackStateRepository.js';
import type { FeedbackState } from '../../domain/models/FeedbackState.js';


export class InMemoryFeedbackStateRepository implements IFeedbackStateRepository {
  private states: Map<string, FeedbackState> = new Map();

  private getKey(idEstudiante: number, idEscenario: number): string {
    return `${idEstudiante}_${idEscenario}`;
  }

  async guardar(idEstudiante: number, idEscenario: number, numIntentos: number): Promise<void> {
    const key = this.getKey(idEstudiante, idEscenario);
    
    const state: FeedbackState = {
      id_estudiante: idEstudiante,
      id_escenario: idEscenario,
      num_intentos_al_generar: numIntentos,
      fecha_generacion: new Date(),
    };

    this.states.set(key, state);
  }

  async obtener(idEstudiante: number, idEscenario: number): Promise<FeedbackState | null> {
    const key = this.getKey(idEstudiante, idEscenario);
    return this.states.get(key) || null;
  }

  async debeHabilitar(
    idEstudiante: number,
    idEscenario: number,
    intentosActuales: number
  ): Promise<boolean> {
    const estado = await this.obtener(idEstudiante, idEscenario);

    if (!estado) {
      return true;
    }

   
    return intentosActuales > estado.num_intentos_al_generar;
  }
}
