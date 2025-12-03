import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js"
import type { EstudianteInput, EstudiantePublic } from "../../domain/models/Estudiante.js"
import bcrypt from "bcrypt"

export class RegisterEstudianteUseCase {
  constructor(private repo: IAuthRepository) {}

  async execute(payload: EstudianteInput): Promise<EstudiantePublic> {
    const exists = await this.repo.findEstudianteByEmail(payload.correo_electronico)
    if (exists) throw new Error('Email ya registrado')

    const hashed = await bcrypt.hash(payload.contrasenia, 10)
    const created = await this.repo.createEstudiante({ ...payload, contrasenia: hashed })
    
    const { ...publicData } = created
    return publicData
  }
}
