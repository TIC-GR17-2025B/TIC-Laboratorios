import type { Progreso } from "../../domain/models/Progreso"
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository"

export class ObtenerProgresoUseCase {
  constructor(private repo: IProgresoRepository) {}

  async execute(idEstudiante: number, idEscenario: number): Promise<Progreso | null> {
    return await this.repo.getProgresoEstudiante(idEstudiante, idEscenario)
  }
}