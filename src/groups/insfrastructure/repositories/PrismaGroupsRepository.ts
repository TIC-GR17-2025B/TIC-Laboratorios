import type { IGroupsRepository } from "../../domain/repositories/IGroupsRepository.js";
import type { Curso, CursoCreateInput, CursoUpdate, DeleteResult } from "../../domain/models/Curso.js";
import type { MatriculaInput, Matricula } from "../../domain/models/Matricula.js";
import { prisma } from "../../../auth/infrastructure/db/prisma.js";

export class PrismaGroupsRepository implements IGroupsRepository {
  async createCurso(data: CursoCreateInput): Promise<Curso> {
    const created = await prisma.curso.create({
      data: {
        id_profesor: data.id_profesor,
        nombre: data.nombre,
        codigo_acceso: null,
        codigo_expira: null,
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

  async findCursoByCodigo(codigo: string): Promise<Curso | null> {
    return await prisma.curso.findUnique({
      where: { codigo_acceso: codigo },
    });
  }

  async existsMatricula(id_curso: number, id_estudiante: number) {
    const found = await prisma.matricula.findFirst({
      where: { id_curso, id_estudiante },
    });
    return !!found;
  }

  async createMatricula(data: MatriculaInput): Promise<Matricula> {
    return await prisma.matricula.create({ data }) as Matricula;
  }

  async updateCursoCodigo(id_curso: number, codigo_acceso: string, codigo_expira: Date): Promise<Curso> {
    return await prisma.curso.update({
      where: { id_curso },
      data: { codigo_acceso, codigo_expira },
    }) as Curso;
  }

  async deleteMatricula(id_curso: number, id_estudiante: number): Promise<DeleteResult> {
    const deleted = await prisma.matricula.deleteMany({
      where: { id_curso, id_estudiante },
    });

    if (deleted.count === 0) {
      throw new Error("El estudiante no está matriculado en este curso");
    }

    return {
      success: true,
      message: "Matrícula eliminada correctamente",
    };
  }

  async findCursoById(id_curso: number): Promise<Curso | null> {
    return await prisma.curso.findUnique({
      where: { id_curso },
    });
  }
}