// src/server.ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './auth/infrastructure/controllers/AuthController.js'
import progresoRouter from './auth/infrastructure/controllers/ProgresoController.js'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000 // Azure asigna puerto dinámico

// Middlewares - CORS configurado para producción
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean) as string[]

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? allowedOrigins
    : '*',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'API de CiberSeguridad Game',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      progreso: '/progreso',
      health: '/health'
    }
  })
})

// Montar rutas de autenticación
app.use('/auth', authRouter)
app.use('/progreso', progresoRouter)

// Manejo de rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada' 
  })
})

// Manejo de errores global
app.use((err: unknown, _req: express.Request, res: express.Response) => {
  console.error('Error no manejado:', err)
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor' 
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
})

export default app