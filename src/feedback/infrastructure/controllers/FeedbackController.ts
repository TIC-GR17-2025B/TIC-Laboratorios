
import express from "express";
import type { Request, Response } from "express";
import { prisma } from "../../../auth/infrastructure/db/prisma.js";
import { N8nFeedbackRepository } from "../repositories/N8nFeedbackRepository.js";
import { GenerateFeedbackUseCase } from "../../application/useCases/GenerateFeedbackUseCase.js";
import { CheckFeedbackStatusUseCase } from "../../application/useCases/CheckFeedbackStatusUseCase.js";
import type { IFeedbackStateRepository } from "../../domain/repositories/IFeedbackStateRepository.js";

const router = express.Router();


const webhookUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL;

if (!webhookUrl) {
  throw new Error("Falta la variable de entorno N8N_FEEDBACK_WEBHOOK_URL");
}


const feedbackRepository = new N8nFeedbackRepository(webhookUrl);


let feedbackStateRepository: IFeedbackStateRepository;
let generateFeedbackUseCase: GenerateFeedbackUseCase;
let checkFeedbackStatusUseCase: CheckFeedbackStatusUseCase;


export function initializeFeedbackController(stateRepo: IFeedbackStateRepository) {
  feedbackStateRepository = stateRepo;
  generateFeedbackUseCase = new GenerateFeedbackUseCase(
    feedbackRepository,
    feedbackStateRepository,
    prisma
  );
  checkFeedbackStatusUseCase = new CheckFeedbackStatusUseCase(
    feedbackStateRepository,
    prisma
  );
}


router.get('/check-status', async (req: Request, res: Response) => {
  try {
    const id_estudiante = parseInt(req.query.id_estudiante as string);
    const id_escenario = parseInt(req.query.id_escenario as string);

    if (!id_estudiante || !id_escenario || isNaN(id_estudiante) || isNaN(id_escenario)) {
      return res.status(400).json({
        success: false,
        error: 'id_estudiante e id_escenario son requeridos y deben ser números',
      });
    }

    const result = await checkFeedbackStatusUseCase.execute(id_estudiante, id_escenario);

    res.status(200).json({
      success: true,
      habilitado: result.habilitado,
      intentos_actuales: result.intentosActuales,
      intentos_al_generar: result.intentosAlGenerar,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error al verificar estado del feedback',
      });
    }
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { id_estudiante, id_escenario } = req.body;

    if (!id_estudiante || !id_escenario) {
      return res.status(400).json({
        success: false,
        error: 'id_estudiante e id_escenario son requeridos'
      });
    }

    const feedback = await generateFeedbackUseCase.execute({
      id_estudiante,
      id_escenario,
    });

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error desconocido al generar retroalimentación'
      });
    }
  }
});

export default router;
