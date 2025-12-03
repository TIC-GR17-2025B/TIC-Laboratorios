import type { IAuthRepository } from "../../domain/repositories/IAuthRepository"
import type { EstudiantePublic } from "../../domain/models/Estudiante"
import type { ProfesorPublic } from "../../domain/models/Profesor"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export interface LoginResult {
  role: 'estudiante' | 'profesor'
  user: EstudiantePublic | ProfesorPublic
  token: string
}

export class LoginUseCase {
  constructor(
    private repo: IAuthRepository,
    private jwtSecret: string
  ) {}

  async execute(correo_electronico: string, contrasenia: string): Promise<LoginResult | null> {
    
    // Buscar profesor
    const profesor = await this.repo.findProfesorByEmail(correo_electronico)
    if (profesor) {
      const match = await bcrypt.compare(contrasenia, profesor.contrasenia)
      if (match) {

        // convertir a tipo public
        const { ...publicProfesor } = profesor

        const token = jwt.sign(
          { id: profesor.id_profesor, role: "profesor" },
          this.jwtSecret,
          { expiresIn: "1h" }
        )

        return {
          role: "profesor",
          user: publicProfesor,
          token
        }
      }
    }

    // Buscar estudiante
    const estudiante = await this.repo.findEstudianteByEmail(correo_electronico)
    if (estudiante) {
      const match = await bcrypt.compare(contrasenia, estudiante.contrasenia)
      if (match) {

        const { ...publicEstudiante } = estudiante

        const token = jwt.sign(
          { id: estudiante.id_estudiante, role: "estudiante" },
          this.jwtSecret,
          { expiresIn: "1h" }
        )

        return {
          role: "estudiante",
          user: publicEstudiante,
          token
        }
      }
    }

    return null
  }
}
