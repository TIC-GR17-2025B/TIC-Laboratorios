import type { IGroupsRepository } from "../domain/repositories/IGroupsRepository.js";
import type { Matricula, JoinCursoInput } from "../domain/models/Matricula.js";

export class JoinGroupsUseCase {
    constructor(private repo: IGroupsRepository) { }

    async execute(payload: JoinCursoInput): Promise<Matricula> {

        // 1. Validar código
        const curso = await this.repo.findCursoByCodigo(payload.codigo_acceso);
        if (!curso) {
            throw new Error("Código inválido");
        }

        // 2. Validar expiración
        if (curso.codigo_expira && new Date() > curso.codigo_expira) {
            throw new Error("El código ha expirado");
        }

        // 3. Validar matrícula duplicada
        const exists = await this.repo.existsMatricula(
            curso.id_curso,
            payload.id_estudiante
        );

        if (exists) {
            throw new Error("El estudiante ya está matriculado en este curso");
        }

        // 4. Crear matrícula
        return await this.repo.createMatricula({
            id_curso: curso.id_curso,
            id_estudiante: payload.id_estudiante,
            fecha: new Date(),
        });
    }
}