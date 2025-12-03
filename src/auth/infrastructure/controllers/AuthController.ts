import express from "express"
import { PrismaAuthRepository } from "../repositories/PrismaAuthRepository.js"
import { RegisterEstudianteUseCase } from "../../application/useCases/RegisterEstudianteUseCase.js"
import { RegisterProfesorUseCase } from "../../application/useCases/RegisterProfesorUseCase.js"
import { LoginUseCase } from "../../application/useCases/LoginUseCase.js"
import { ObtenerEstudianteProfesorUseCase } from "../../application/useCases/ObtenerEstudianteProfesorUseCase.js"

const router = express.Router()
const repo = new PrismaAuthRepository()
const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error("Falta la variable de entorno JWT_SECRET")
}

const registerEstudiante = new RegisterEstudianteUseCase(repo)
const registerProfesor = new RegisterProfesorUseCase(repo)
const loginUseCase = new LoginUseCase(repo, jwtSecret)
const obtenerEstudianteProfesor = new ObtenerEstudianteProfesorUseCase(repo)

// POST /auth/register/estudiante
router.post('/register/estudiante', async (req, res) => {
  try {
    const created = await registerEstudiante.execute(req.body)
    res.status(201).json({ success: true, data: created })
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
})

// POST /auth/register/profesor
router.post('/register/profesor', async (req, res) => {
  try {
    const created = await registerProfesor.execute(req.body)
    res.status(201).json({ success: true, data: created })
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { correo_electronico, contrasenia } = req.body

    if (!correo_electronico || !contrasenia) {
      return res.status(400).json({
        success: false,
        error: 'Correo electrónico y contraseña son requeridos'
      })
    }

    const result = await loginUseCase.execute(correo_electronico, contrasenia)

    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }

    res.json({ success: true, data: result })

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

// GET /auth/profesor/:id/estudiantes
router.get('/profesor/:id/estudiantes', async (req, res) => {
  try {
    console.log('AuthController - GET /profesor/:id/estudiantes')
    console.log('AuthController - Params:', req.params)
    const id_profesor = parseInt(req.params.id)
    console.log('AuthController - id_profesor parseado:', id_profesor)

    if (isNaN(id_profesor)) {
      console.error('AuthController - ID de profesor inválido')
      return res.status(400).json({
        success: false,
        error: 'ID de profesor inválido'
      })
    }

    console.log('AuthController - Llamando a obtenerEstudianteProfesor.execute con id:', id_profesor)
    const estudiantes = await obtenerEstudianteProfesor.execute(id_profesor)
    console.log('AuthController - Estudiantes obtenidos:', estudiantes)
    console.log('AuthController - Total estudiantes:', estudiantes.length)
    
    res.json({ 
      success: true, 
      data: estudiantes,
      total: estudiantes.length
    })

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})


export default router
