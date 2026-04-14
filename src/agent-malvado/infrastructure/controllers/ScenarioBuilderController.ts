import { type Request, type Response, Router } from 'express';
import { GenerateScenarioUseCase } from '../../application/useCases/GenerateScenarioUseCase.js';
import { N8nWebhookRepository } from '../repositories/N8nWebhookRepository.js';

export class ScenarioBuilderController {
  private readonly router: Router;
  private readonly generateUseCase: GenerateScenarioUseCase;

  constructor() {
    this.router = Router();
    const webhookUrl = process.env.N8N_SCENARIO_WEBHOOK_URL || 'https://pymwebhooks.pymbots.com/webhook/bc9c6053-3be9-4e71-b769-0de0166ca4e9';
    const repository = new N8nWebhookRepository(webhookUrl);
    this.generateUseCase = new GenerateScenarioUseCase(repository);

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/generate', this.generateScenario.bind(this));
  }

  public getRouter(): Router {
    return this.router;
  }

  private async generateScenario(req: Request, res: Response): Promise<void> {
    try {
      const { prompt } = req.body;
      const requestDto = { prompt: prompt || this.getDefaultPrompt() };
      const result = await this.generateUseCase.execute(requestDto);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  private getDefaultPrompt(): string {
    return `MODO ARQUITECTO ECS (PSM-V12 - ESTÁNDAR LOGICORP)
1. BASE: Elige un escenario con 'buscar_topologias'. No inventes redes ni PCs.
2. ESTRUCTURA DE FASES (REGLA DE ORO):
   - FASE 1 (Reconocimiento): Escaneos y Búsquedas. Estos NO son ataques. Van en el array 'eventos'.
   - FASES SIGUIENTES: Troyanos o Ransomware (Ataques) y Firewall/VPN (Eventos).
3. CAMPOS OBLIGATORIOS:
   - Cada fase debe tener "faseActual": (true solo en P1) y "completada": false.
   - Retos pacíficos (Scan/VPN/Firewall) → "tipoEvento": "Verificación de acciones de un jugador en la simulación".
   - Amenazas reales (Troyano) → Usar el array 'ataques' con tiempo de 20-60s.
4. SINCRONIZACIÓN DE NOMBRES (CRÍTICO - OBLIGATORIO):
   El campo 'nombreEvento' (en eventos) o 'nombreAtaque' (en ataques) debe ser EXACTAMENTE IGUAL, carácter por carácter, a la 'descripcion' del objetivo correspondiente en la fase.
   Ejemplo CORRECTO:
     objetivo.descripcion = "Escaneo de red para identificar dispositivos."
     → evento.nombreEvento = "Escaneo de red para identificar dispositivos." ← EXACTAMENTE IGUAL
   Ejemplo CORRECTO:
     objetivo.descripcion = "Activar bloqueo de medios extraíbles"
     → evento.nombreEvento = "Activar bloqueo de medios extraíbles" ← EXACTAMENTE IGUAL
   Ejemplo INCORRECTO (NO HACER):
     objetivo.descripcion = "Escaneo de red para identificar dispositivos."
     → evento.nombreEvento = "Escaneo de red" ← DIFERENTE, NO FUNCIONA
5. EVENTOS DE CIERRE DE FASE (OBLIGATORIO):
   Al final de CADA fase debes incluir un evento de cierre en el array 'eventos':
   - Fases intermedias: "tipoEvento": "Completación de fase" con tiempoNotificacion: 999
   - Última fase: "tipoEvento": "Completación de escenario" con tiempoNotificacion: 999
6. NO INVENTES: Usa estrictamente y obligatoriamente nombres de apps y configuraciones de 'buscar_desafios'.`;
  }
}

export default new ScenarioBuilderController().getRouter();
