import type { Progreso, ProgresoInput, ProgresoConNombreEscenario, ProgresoResumen } from "../../domain/models/Progreso.js";
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js";
import { prisma } from "../db/prisma.js";

export class PrismaProgresoRepository implements IProgresoRepository {

    async guardarProgresoEstudiante(p: ProgresoInput): Promise<Progreso> {
        const created = await prisma.progreso.create({
            data: {
                id_estudiante: p.id_estudiante,
                terminado: p.terminado,
                id_escenario: Number(p.escenario),
                tiempo: p.tiempo,
                acciones: p.acciones,
            },
        });
        return {
            ...created,
            escenario: String(created.id_escenario),
            acciones: created.acciones ?? '',
            tiempo: created.tiempo ?? 0,
            terminado: created.terminado ?? false,
        };
    }

    async getProgresoEstudiante(idEstudiante: number, escenario: string): Promise<ProgresoResumen | null> {
        const idEscenario = Number(escenario);

        const intentos = await prisma.progreso.count({
            where: {
                id_estudiante: idEstudiante,
                id_escenario: idEscenario,
            },
        });

        const terminado = await prisma.progreso.findFirst({
            select: { terminado: true },
            where: {
                id_estudiante: idEstudiante,
                id_escenario: idEscenario,
                terminado: true,
            },
        });

        return {
            terminado: terminado?.terminado ?? false,
            intentos: intentos ?? 0,
        };
    }

    async getTodosProgresosEstudiante(idEstudiante: number): Promise<ProgresoConNombreEscenario[]> {
        const progresos = await prisma.progreso.findMany({
            where: { id_estudiante: idEstudiante },
            include: { escenario: true },
            orderBy: { id_progreso: 'asc' },
        });

        return progresos.map(p => ({
            id_progreso: p.id_progreso,
            id_estudiante: p.id_estudiante,
            escenario: String(p.id_escenario),
            nombre_escenario: p.escenario.nombre,
            terminado: !!p.terminado,
            tiempo: p.tiempo,
            acciones: p.acciones ?? '',
            fecha_creacion: null,
        }));
    }
}