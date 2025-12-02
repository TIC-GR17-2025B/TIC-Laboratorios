import type { Estudiante, EstudianteInput } from "../models/Estudiante"
import type { Profesor, ProfesorInput } from "../models/Profesor"

export interface IAuthRepository {
  createEstudiante(data: EstudianteInput): Promise<Estudiante>
  createProfesor(data: ProfesorInput): Promise<Profesor>
  findEstudianteByEmail(correo_electronico: string): Promise<Estudiante | null>
  findProfesorByEmail(correo_electronico: string): Promise<Profesor | null>
}
