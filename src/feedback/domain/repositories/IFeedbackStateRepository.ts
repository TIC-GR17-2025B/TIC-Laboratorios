import type { FeedbackState } from '../models/FeedbackState.js';


export interface IFeedbackStateRepository {
  guardar(idEstudiante: number, slugEscenario: string, numIntentos: number): Promise<void>;
  obtener(idEstudiante: number, slugEscenario: string): Promise<FeedbackState | null>;
  debeHabilitar(idEstudiante: number, slugEscenario: string, intentosActuales: number): Promise<boolean>;
}
