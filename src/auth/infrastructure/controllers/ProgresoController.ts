import express from "express"
import { GuardarProgresoUseCase } from "../../application/useCases/GuardarProgresoUseCase"
import { PrismaProgresoRepository } from "../repositories/PrismaProgresoRepository"

const router = express.Router()
const repo = new PrismaProgresoRepository()

const guardarProgreso = new GuardarProgresoUseCase(repo);

router.post('/register/progreso', async (req, res) => {
  try {
    const created = await guardarProgreso.execute(req.body)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
});

