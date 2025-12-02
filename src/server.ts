// src/server.ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './auth/infrastructure/controllers/AuthController'
import progresoRouter from './auth/infrastructure/controllers/ProgresoController'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Montar rutas de autenticación
app.use('/auth', authRouter)
app.use('/progreso', progresoRouter)

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada' 
  })
})

// Manejo de errores global
app.use((err: unknown, req: express.Request, res: express.Response /*, next: express.NextFunction*/) => {
  console.error('Error no manejado:', err)
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor' 
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Endpoints disponibles:`)
  console.log(`POST http://localhost:${PORT}/auth/register/estudiante`)
  console.log(`POST http://localhost:${PORT}/auth/register/profesor`)
  console.log(`POST http://localhost:${PORT}/auth/login`)
  console.log(`   Progreso:`)
  console.log(`     POST http://localhost:${PORT}/progreso`)
  console.log(`     GET  http://localhost:${PORT}/progreso/estudiante/:idEstudiante`)
  console.log(`     GET  http://localhost:${PORT}/progreso/estudiante/:idEstudiante/escenario/:idEscenario`)
})

export default app
