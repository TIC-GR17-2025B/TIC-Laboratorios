import express from "express";
import { NivelController } from "./NivelController";

const router = express.Router();
const nivelController = new NivelController();

// GET /escenarios - Obtener lista de escenarios disponibles
router.get("/", async (req, res) => {
  try {
    const escenarios = nivelController.getEscenarios();
    res.json({ success: true, data: escenarios });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;
