import type { Curso, CursoInput, CursoUpdate, DeleteResult } from "../models/Curso";

export interface IGroupsRepository {
    createCurso(data: CursoInput): Promise<Curso>;
    updateCurso(id: number, data: CursoUpdate): Promise<Curso>;
    deleteCurso(id: number): Promise<DeleteResult>;
}