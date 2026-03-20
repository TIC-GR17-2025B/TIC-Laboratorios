import type { Progreso, ProgresoInput, ProgresoConNombreEscenario} from "../models/Progreso.js"

export interface IProgresoRepository {
  guardarProgresoEstudiante(data: ProgresoInput): Promise<Progreso>
  getProgresoEstudiante(idEstudiante: number, slugEscenario: string): Promise<{terminado: boolean; intentos: number;} | null>
  getTodosProgresosEstudiante(idEstudiante: number): Promise<ProgresoConNombreEscenario[]>
}
