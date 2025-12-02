import type { Progreso, ProgresoInput } from "../../domain/models/Progreso";
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository";
import { prisma } from "../db/prisma"

export class PrismaProgresoRepository implements IProgresoRepository {
    
    async guardarProgresoEstudiante(p: ProgresoInput): Promise<Progreso> {
        const created = await prisma.progreso.create({
            data: {
                id_estudiante: p.id_estudiante,
                id_escenario: p.id_escenario,
                terminado: p.terminado,
                tiempo: p.tiempo,
            },
        });
        return created as Progreso;
    }

    // Obtener el progreso de un estudiante en un escenario específico
    async getProgresoEstudiante(idEstudiante: number, idEscenario: number): Promise<Progreso | null> {
        const progreso = await prisma.progreso.findFirst({
            where: {
                id_estudiante: idEstudiante,
                id_escenario: idEscenario,
            },
        });
        return progreso as Progreso | null;
    }

    // Obtener todos los progresos de un estudiante en todos los escenarios ordenados por escenario
    async getTodosProgresosEstudiante(idEstudiante: number): Promise<Progreso[]> {
        const progresos = await prisma.progreso.findMany({
            where: {
                id_estudiante: idEstudiante,
            },
            orderBy: {
                id_escenario: 'asc',
            },
        });
        return progresos as Progreso[];
    }

    /* Actualizar el progreso de un estudiante en un escenario específico
    async actualizarProgreso(id_progreso: number, data: Partial<ProgresoInput>): Promise<Progreso> {
        const updated = await prisma.progreso.update({
            where: { id_progreso },
            data,
        });
        return updated as Progreso;
    }*/
}
