import type { ProgresoInput, ProgresoPublic } from "../../domain/models/Progreso"
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository"

export class GuardarProgresoUseCase {
  constructor(
    private repo: IProgresoRepository
  ) {}

  async execute(payload: ProgresoInput): Promise<ProgresoPublic> {
    const progresoCreado = await this.repo.guardarProgresoEstudiante({ ...payload });
    
    const { ...publicData } = progresoCreado;
    return publicData
  }
}
