import type { IGroupsRepository } from "../../domain/repositories/IGroupsRepository";
import type { Curso, CursoInput } from "../../domain/models/Curso";
import { prisma } from "../../../auth/infrastructure/db/prisma.js";

export class PrismaGroupsRepository implements IGroupsRepository {
  async createCurso(data: CursoInput): Promise<Curso> {
    const created = await prisma.curso.create({
      data: {
        id_profesor: data.id_profesor,
        nombre: data.nombre,
      },
    })
    return created as Curso
  }
}