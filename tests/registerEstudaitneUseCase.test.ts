import { describe, it, expect, vi } from "vitest"
import { RegisterEstudianteUseCase } from "../src/auth/application/useCases/RegisterEstudianteUseCase"

const mockRepo = {
  findEstudianteByEmail: vi.fn(),
  createEstudiante: vi.fn()
}

describe("RegisterEstudianteUseCase", () => {
  it("debe registrar estudiante nuevo", async () => {
    mockRepo.findEstudianteByEmail.mockResolvedValue(null)

    mockRepo.createEstudiante.mockResolvedValue({
      id_estudiante: 1,
      primernombre: "Juan",
      correo_electronico: "test@asd.com",
      contrasenia: "hashed"
    })

    const usecase = new RegisterEstudianteUseCase(mockRepo as unknown)

    const result = await usecase.execute({
      primernombre: "Juan",
      correo_electronico: "test@asd.com",
      contrasenia: "1234",
      codigo_unico: 111,
      id_profesor: 1,
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: ""
    })

    expect(result.primernombre).toBe("Juan")
  })

  it("debe fallar si email ya existe", async () => {
    mockRepo.findEstudianteByEmail.mockResolvedValue({})

    const usecase = new RegisterEstudianteUseCase(mockRepo as unknown)

    await expect(usecase.execute({
      primernombre: "Juan",
      correo_electronico: "test@asd.com",
      contrasenia: "1234",
      codigo_unico: 111,
      id_profesor: 1,
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: ""
    })).rejects.toThrow('Email ya registrado')
  })
})
