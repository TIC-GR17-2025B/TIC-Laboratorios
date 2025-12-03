import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository"
import type { ProgresoConNombreEscenario } from "../../domain/models/Progreso"

export class ObtenerTodosProgresosUseCase {
  constructor(private repo: IProgresoRepository) {}

  async execute(idEstudiante: number): Promise<ProgresoConNombreEscenario[]> {
    return await this.repo.getTodosProgresosEstudiante(idEstudiante)
  }
}