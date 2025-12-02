import type { ProgresoInput, Progreso} from "../../domain/models/Progreso"
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository"

export class GuardarProgresoUseCase {
  constructor(
    private repo: IProgresoRepository
  ) {}

  async execute(payload: ProgresoInput): Promise<Progreso> {
    
    // Validaciones
    if (payload.intentos < 0) {
      throw new Error('Los intentos no pueden ser negativos')
    }

    if (payload.tiempo !== null && payload.tiempo < 0) {
      throw new Error('El tiempo no puede ser negativo')
    }

    // Verificar si ya existe un progreso para este estudiante y escenario
    const existente = await this.repo.getProgresoEstudiante(
      payload.id_estudiante,
      payload.id_escenario
    )

    if (existente) {
      // Si existe, actualizarlo en lugar de crear uno nuevo
      return await this.repo.actualizarProgreso(existente.id_progreso, payload)
    }

    // Si no existe, crear uno nuevo
    return await this.repo.guardarProgresoEstudiante(payload)
  }
}
