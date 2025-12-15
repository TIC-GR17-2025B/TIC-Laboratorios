import type { Curso, CursoCreateInput, CursoUpdate, DeleteResult } from "../models/Curso.js";
import type { MatriculaInput, Matricula} from "../models/Matricula.js";

export interface IGroupsRepository {
    createCurso(data: CursoCreateInput): Promise<Curso>;
    updateCurso(id: number, data: CursoUpdate): Promise<Curso>;
    deleteCurso(id: number): Promise<DeleteResult>;

    findCursoByCodigo(codigo: string): Promise<Curso | null>;
    existsMatricula(id_curso: number, id_estudiante: number): Promise<boolean>;
    createMatricula(data: MatriculaInput): Promise<Matricula>;
    updateCursoCodigo(id_curso: number, codigo_acceso:string, codigo_expira:Date): Promise<Curso>;
}