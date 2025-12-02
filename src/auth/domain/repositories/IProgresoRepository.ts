import type { Progreso, ProgresoInput } from "../models/Progreso"

export interface IProgresoRepository {
  guardarProgresoEstudiante(data: ProgresoInput): Promise<Progreso>
  getProgresoEstudiante(idEstudiante: number, idEscenario: number): Promise<Progreso | null>
  getTodosProgresosEstudiante(idEstudiante: number): Promise<Progreso[]>
}
