import express from "express"
import type { Request, Response } from "express";
import { PrismaGroupsRepository } from "../repositories/PrismaGroupsRepository.js"
import { GroupsUseCase } from "../../application/GroupsUseCase.js"

const router = express.Router()
const repo = new PrismaGroupsRepository()

const createCurso = new GroupsUseCase(repo);

// POST /groups - Crear un nuevo curso
router.post('/', async (req: Request , res: Response) => {
    try {
        const { id_profesor, nombre } = req.body

        // Validación de campos requeridos
        if (!id_profesor || !nombre) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos: id_profesor, nombre'
            })
        }

        const curso = await createCurso.createCurso(req.body)
        res.status(201).json({ success: true, data: curso })

    } catch (err) {
        if (err instanceof Error) {
        res.status(400).json({ success: false, error: err.message })
        }
    }
})

// PUT /groups/edit/:id - Editar curso
router.put('/edit/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "ID inválido" });
    }

    const updated = await createCurso.updateCurso(id, req.body);
    res.json({ success: true, data: updated });

  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// DELETE /groups/delete/:id - Eliminar curso
router.delete('/delete/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "ID inválido" });
    }

    const result = await createCurso.deleteCurso(id);
    res.json(result);

  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

export default router