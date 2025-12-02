import type { Progreso, ProgresoInput } from "../models/Progreso"

export interface IProgresoRepository {
  guardarProgresoEstudiante(data: ProgresoInput): Promise<Progreso>
  getProgresoEstudiante(idEstudiante: number, idEscenario: number): Promise<{terminado: boolean; intentos: number;} | null>
  getTodosProgresosEstudiante(idEstudiante: number): Promise<Progreso[]>
}
