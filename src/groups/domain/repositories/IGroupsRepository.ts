import type { Curso, CursoInput } from "../models/Curso";

export interface IGroupsRepository {
    createCurso(data: CursoInput): Promise<Curso>
}