import type { Curso, CursoInput } from "../domain/models/Curso";
import type { IGroupsRepository } from "../domain/repositories/IGroupsRepository";

export class GroupsUseCase {
    constructor(private repo: IGroupsRepository) {}

    async createCurso(payload: CursoInput): Promise<Curso>{
        const created = await this.repo.createCurso(payload)
        return created
    }
}