import type { Curso, CursoInput, CursoUpdate, DeleteResult} from "../domain/models/Curso";
import type { IGroupsRepository } from "../domain/repositories/IGroupsRepository";

export class GroupsUseCase {
    constructor(private repo: IGroupsRepository) {}

    async createCurso(payload: CursoInput): Promise<Curso>{
        const created = await this.repo.createCurso(payload)
        return created
    }

    async updateCurso(id: number, payload: CursoUpdate): Promise<Curso> {
        return await this.repo.updateCurso(id, payload);
    }

    async deleteCurso(id: number): Promise<DeleteResult> {
        return await this.repo.deleteCurso(id);
    }
}