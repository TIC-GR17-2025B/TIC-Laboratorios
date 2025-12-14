import type { IGroupsRepository } from "../../domain/repositories/IGroupsRepository";
import type { Curso, CursoInput, CursoUpdate, DeleteResult} from "../../domain/models/Curso";
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

  async updateCurso(id: number, data: CursoUpdate): Promise<Curso> {
    return await prisma.curso.update({
      where: { id_curso: id },
      data,
    }) as Curso;
  }

  async deleteCurso(id: number): Promise<DeleteResult> {
    await prisma.curso.delete({
      where: { id_curso: id },
    });

    return {
      success: true,
      message: "Curso eliminado correctamente",
    };
  }
}