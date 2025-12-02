import type { IAuthRepository } from "../../domain/repositories/IAuthRepository"
import type { Profesor } from "../../domain/models/Profesor"
import bcrypt from "bcrypt"

export class RegisterProfesorUseCase {
  constructor(private repo: IAuthRepository) {}

  async execute(payload: Omit<Profesor, 'id_profesor'>) {
    const exists = await this.repo.findProfesorByEmail(payload.correo_electronico)
    if (exists) throw new Error('Email ya registrado')

    const hashed = await bcrypt.hash(payload.contrasenia, 10)
    const created = await this.repo.createProfesor({ ...payload, contrasenia: hashed })

    const { ...publicData } = created
    return publicData
  }
}
