import type { FeedbackState } from '../models/FeedbackState.js';


export interface IFeedbackStateRepository {
  guardar(idEstudiante: number, idEscenario: number, numIntentos: number): Promise<void>;
  obtener(idEstudiante: number, idEscenario: number): Promise<FeedbackState | null>;
  debeHabilitar(idEstudiante: number, idEscenario: number, intentosActuales: number): Promise<boolean>;
}
