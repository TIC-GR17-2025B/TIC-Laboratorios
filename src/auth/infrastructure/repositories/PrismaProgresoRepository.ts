import type { Progreso, ProgresoInput, ProgresoConNombreEscenario } from "../../domain/models/Progreso.js";
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js";
import { prisma } from "../db/prisma.js";

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
    async getProgresoEstudiante(idEstudiante: number, idEscenario: number): Promise<{ terminado: boolean; intentos: number; } | null> {
        const intentos = await prisma.progreso.count({
            where: {
                id_estudiante: idEstudiante,
                id_escenario: idEscenario,
            },
        });

        const terminado = await prisma.progreso.findFirst({
            select: {
                terminado: true,
            },
            where: {
                id_estudiante: idEstudiante,
                id_escenario: idEscenario,
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

        // Obtener todos los progresos del estudiante con nombre de escenario
        const progresos = await prisma.progreso.findMany({
            where: { id_estudiante: idEstudiante },
            include: {
                escenario: {
                    select: { nombre: true } // solo traer nombre
                }
            },
            orderBy: {
                id_progreso: 'asc', // orden por intento
            },
        });

        // Mapear los progresos al formato deseado
        const resultado: ProgresoConNombreEscenario[] = progresos.map(p => ({
            id_progreso: p.id_progreso,
            id_estudiante: p.id_estudiante,
            id_escenario: p.id_escenario,
            nombre_escenario: p.escenario.nombre,
            terminado: !!p.terminado,
            tiempo: p.tiempo,
        }));

        return resultado;
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
