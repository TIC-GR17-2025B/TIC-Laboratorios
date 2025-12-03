import express from "express"
import { PrismaProgresoRepository } from "../repositories/PrismaProgresoRepository.js"
import { GuardarProgresoUseCase } from "../../application/useCases/GuardarProgresoUseCase.js"
import { ObtenerProgresoUseCase } from "../../application/useCases/ObtenerProgresoUseCase.js"
import { ObtenerTodosProgresosUseCase } from "../../application/useCases/ObtenerTodosProgresosUseCase.js"

const router = express.Router()
const repo = new PrismaProgresoRepository()

const guardarProgreso = new GuardarProgresoUseCase(repo);
const obtenerProgreso = new ObtenerProgresoUseCase(repo);
const obtenerTodosProgresos = new ObtenerTodosProgresosUseCase(repo);

// POST /progreso - Guardar progreso de un estudiante
router.post('/', async (req, res) => {
  try {
    const { id_estudiante, id_escenario, terminado, tiempo } = req.body

    // Validación de campos requeridos
    if (!id_estudiante || !id_escenario || terminado === undefined || tiempo === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: id_estudiante, id_escenario, terminado'
      })
    }

    const progreso = await guardarProgreso.execute(req.body)
    res.status(201).json({ success: true, data: progreso })
  } catch (err) {
    if (err instanceof Error) {
    res.status(400).json({ success: false, error: err.message })
    }
  }
})

// GET /progreso/estudiante/10/escenario/3 - Obtener progreso específico
router.get('/estudiante/:idEstudiante/escenario/:idEscenario', async (req, res) => {
  try {
    const idEstudiante = parseInt(req.params.idEstudiante)
    const idEscenario = parseInt(req.params.idEscenario)

    if (isNaN(idEstudiante) || isNaN(idEscenario)) {
      return res.status(400).json({
        success: false,
        error: 'Los IDs deben ser números válidos'
      })
    }

    const progreso = await obtenerProgreso.execute(idEstudiante, idEscenario)
    
    if (!progreso) {
      return res.status(404).json({
        success: false,
        error: 'Progreso no encontrado'
      })
    }

    res.json({ success: true, data: progreso })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

// GET /progreso/estudiante/10 - Obtener todos los progresos de un estudiante
router.get('/estudiante/:idEstudiante', async (req, res) => {
  try {
    const idEstudiante = parseInt(req.params.idEstudiante)

    if (isNaN(idEstudiante)) {
      return res.status(400).json({
        success: false,
        error: 'El ID del estudiante debe ser un número válido'
      })
    }

    const progresos = await obtenerTodosProgresos.execute(idEstudiante)
    res.json({ success: true, data: progresos })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

export default router

