

import type { PrismaClient } from "../../../generated/prisma/index.js";
import type { IFeedbackRepository } from "../../domain/repositories/IFeedbackRepository.js";
import type { IFeedbackStateRepository } from "../../domain/repositories/IFeedbackStateRepository.js";
import type { FeedbackPayload, FeedbackResponse } from "../../domain/models/Feedback.js";

export class GenerateFeedbackUseCase {
  constructor(
    private readonly feedbackRepository: IFeedbackRepository,
    private readonly feedbackStateRepository: IFeedbackStateRepository,
    private readonly prisma: PrismaClient
  ) {}

  async execute(payload: FeedbackPayload): Promise<FeedbackResponse> {
  
    if (!payload.id_estudiante || !payload.id_escenario) {
      throw new Error('id_estudiante e id_escenario son requeridos');
    }

    const intentosActuales = await this.prisma.progreso.count({
      where: {
        id_estudiante: payload.id_estudiante,
        id_escenario: payload.id_escenario,
      },
    });
    const feedback = await this.feedbackRepository.generateFeedback(payload);

    await this.feedbackStateRepository.guardar(
      payload.id_estudiante,
      payload.id_escenario,
      intentosActuales
    );

    return feedback;
  }
}
