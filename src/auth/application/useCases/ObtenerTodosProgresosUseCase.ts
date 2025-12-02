import type { Progreso } from "../../domain/models/Progreso"
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository"

export class ObtenerTodosProgresosUseCase {
  constructor(private repo: IProgresoRepository) {}

  async execute(idEstudiante: number): Promise<Progreso[]> {
    return await this.repo.getTodosProgresosEstudiante(idEstudiante)
  }
}