import type { ProgresoResumen } from "../../domain/models/Progreso.js"
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js"

export class ObtenerProgresoUseCase {
  constructor(private repo: IProgresoRepository) {}

  async execute(idEstudiante: number, idEscenario: number): Promise<ProgresoResumen | null> {
    return await this.repo.getProgresoEstudiante(idEstudiante, idEscenario)
  }
}