import type { Progreso, ProgresoInput, ProgresoConNombreEscenario } from "../../domain/models/Progreso.js";
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js";
import { prisma } from "../db/prisma.js";
import { getNombreEscenario } from "../../../data/escenarios/registry.js";

export class PrismaProgresoRepository implements IProgresoRepository {

    async guardarProgresoEstudiante(p: ProgresoInput): Promise<Progreso> {
        const created = await prisma.progreso.create({
            data: {
                id_estudiante: p.id_estudiante,
                slug_escenario: p.slug_escenario,
                terminado: p.terminado,
                tiempo: p.tiempo,
            },
        });
        return created as Progreso;
    }

    // Obtener el progreso de un estudiante en un escenario específico
    async getProgresoEstudiante(idEstudiante: number, slugEscenario: string): Promise<{ terminado: boolean; intentos: number; } | null> {
        const intentos = await prisma.progreso.count({
            where: {
                id_estudiante: idEstudiante,
                slug_escenario: slugEscenario,
            },
        });

        const terminado = await prisma.progreso.findFirst({
            select: {
                terminado: true,
            },
            where: {
                id_estudiante: idEstudiante,
                slug_escenario: slugEscenario,
                terminado: true,
            },
        });

        const progreso = {
            terminado: terminado?.terminado ?? false,
            intentos: intentos ?? 0
        };

        return progreso;
    }

    // Obtener todos los progresos de un estudiante en todos los escenarios ordenados por escenario
    async getTodosProgresosEstudiante(
        idEstudiante: number
    ): Promise<ProgresoConNombreEscenario[]> {

        const progresos = await prisma.progreso.findMany({
            where: { id_estudiante: idEstudiante },
            orderBy: {
                id_progreso: 'asc',
            },
        });

        const resultado: ProgresoConNombreEscenario[] = progresos.map(p => ({
            id_progreso: p.id_progreso,
            id_estudiante: p.id_estudiante,
            slug_escenario: p.slug_escenario,
            nombre_escenario: getNombreEscenario(p.slug_escenario),
            terminado: !!p.terminado,
            tiempo: p.tiempo,
            fecha_creacion: p.fecha_creacion ? p.fecha_creacion.toISOString() : null,
        }));

        return resultado;
    }
}
