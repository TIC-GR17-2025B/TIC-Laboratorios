import type { Estudiante, EstudianteInput, EstudiantePublic } from "../models/Estudiante"
import type { Profesor, ProfesorInput } from "../models/Profesor"

export interface IAuthRepository {
  createEstudiante(data: EstudianteInput): Promise<Estudiante>
  createProfesor(data: ProfesorInput): Promise<Profesor>
  findEstudianteByEmail(correo_electronico: string): Promise<Estudiante | null>
  findProfesorByEmail(correo_electronico: string): Promise<Profesor | null>
  findEstudiantesByProfesor(id_profesor: number): Promise<EstudiantePublic[]>
  findEstudianteById(id_estudiante: number): Promise<Estudiante | null>
}
