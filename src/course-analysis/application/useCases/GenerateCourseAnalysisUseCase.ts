import type { ICourseAnalysisRepository } from "../../domain/repositories/ICourseAnalysisRepository.js";
import type { CourseAnalysisPayload, CourseAnalysisResponse } from "../../domain/models/CourseAnalysis.js";

export class GenerateCourseAnalysisUseCase {
  constructor(
    private readonly courseAnalysisRepository: ICourseAnalysisRepository
  ) {}

  async execute(payload: CourseAnalysisPayload): Promise<CourseAnalysisResponse> {
    // Validación del payload
    if (!payload.id_curso || typeof payload.id_curso !== 'number') {
      throw new Error('id_curso debe ser un número válido');
    }

    if (payload.id_curso <= 0) {
      throw new Error('id_curso debe ser mayor que 0');
    }

    // Generar el análisis llamando a N8N
    const analysis = await this.courseAnalysisRepository.generateAnalysis(payload);

    return analysis;
  }
}
