import type { ProgresoResumen } from "../../domain/models/Progreso.js"
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js"

export class ObtenerProgresoUseCase {
  constructor(private repo: IProgresoRepository) {}

  async execute(idEstudiante: number, escenario: string): Promise<ProgresoResumen | null> {
    return await this.repo.getProgresoEstudiante(idEstudiante, escenario)
  }
}