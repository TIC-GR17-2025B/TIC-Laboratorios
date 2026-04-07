import type { PrismaClient } from '../../../generated/prisma/index.js';
import type { IFeedbackStateRepository } from '../../domain/repositories/IFeedbackStateRepository.js';


export class CheckFeedbackStatusUseCase {
  constructor(
    private readonly feedbackStateRepository: IFeedbackStateRepository,
    private readonly prisma: PrismaClient
  ) {}

  async execute(idEstudiante: number, slugEscenario: string): Promise<{
    habilitado: boolean;
    intentosActuales: number;
    intentosAlGenerar: number | null;
  }> {
    const intentosActuales = await this.prisma.progreso.count({
      where: {
        id_estudiante: idEstudiante,
        slug_escenario: slugEscenario,
      },
    });

    const habilitado = await this.feedbackStateRepository.debeHabilitar(
      idEstudiante,
      slugEscenario,
      intentosActuales
    );

    const estado = await this.feedbackStateRepository.obtener(idEstudiante, slugEscenario);

    return {
      habilitado,
      intentosActuales,
      intentosAlGenerar: estado?.num_intentos_al_generar || null,
    };
  }
}
