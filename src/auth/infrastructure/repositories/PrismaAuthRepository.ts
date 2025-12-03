import type { IAuthRepository } from "../../domain/repositories/IAuthRepository"
import type { Estudiante, EstudiantePublic  } from "../../domain/models/Estudiante"
import type { Profesor } from "../../domain/models/Profesor"
import { prisma } from "../db/prisma"

export class PrismaAuthRepository implements IAuthRepository {
  async createEstudiante(e: Omit<Estudiante, 'id_estudiante'>) {
    const created = await prisma.estudiante.create({
      data: {
        id_profesor: e.id_profesor || 1,
        codigo_unico: e.codigo_unico,
        primernombre: e.primernombre,
        segundo_nombre: e.segundo_nombre,
        primer_apellido: e.primer_apellido,
        segundo_apellido: e.segundo_apellido,
        correo_electronico: e.correo_electronico,
        contrasenia: e.contrasenia,
      },
    })
    return created as Estudiante
  }

  async createProfesor(p: Omit<Profesor, 'id_profesor'>) {
    const created = await prisma.profesor.create({
      data: {
        primernombre: p.primernombre,
        segundo_nombre: p.segundo_nombre,
        primer_apellido: p.primer_apellido,
        segundo_apellido: p.segundo_apellido,
        correo_electronico: p.correo_electronico,
        contrasenia: p.contrasenia,
      },
    })
    return created as Profesor
  }

  async findEstudianteByEmail(correo_electronico: string) {
    const found = await prisma.estudiante.findUnique({ where: { correo_electronico } })
    return found as Estudiante | null
  }

  async findProfesorByEmail(correo_electronico: string) {
    const found = await prisma.profesor.findUnique({ where: { correo_electronico } })
    return found as Profesor | null
  }

  async findEstudiantesByProfesor(id_profesor: number): Promise<EstudiantePublic[]> {
    const estudiantes = await prisma.estudiante.findMany({
      where: { 
        id_profesor 
      },
      orderBy: {
        primer_apellido: 'asc'
      }
    })
    return estudiantes.map(({ contrasenia, ...publicData }) => publicData) as EstudiantePublic[]
  }

  async findEstudianteById(id_estudiante: number): Promise<Estudiante | null> {
    const found = await prisma.estudiante.findUnique({ 
      where: { id_estudiante } 
    })
    return found as Estudiante | null
  }
}