import type { Progreso, ProgresoInput } from "../../domain/models/Progreso";
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository";

export class PrismaProgresoRepository implements IProgresoRepository {
    async guardarProgresoEstudiante(data: ProgresoInput): Promise<Progreso> {

    }

    // async getProgresoEstudiante(idEstudiante: number, idEscenario: number): Promise<Progreso> {
    //
    // }
}
