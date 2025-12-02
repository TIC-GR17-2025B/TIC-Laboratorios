import { describe, it, expect, vi, beforeEach } from "vitest"
import bcrypt from "bcrypt"
import { LoginUseCase } from "../src/auth/application/useCases/LoginUseCase"

const mockRepo = {
  findEstudianteByEmail: vi.fn(),
  findProfesorByEmail: vi.fn(),
}

const jwtSecret = "secret123"

beforeEach(() => {
  mockRepo.findEstudianteByEmail.mockReset()
  mockRepo.findProfesorByEmail.mockReset()
})

describe("LoginUseCase", () => {

  it("debe loguear estudiante correctamente", async () => {
    const estudianteMock = {
      id_estudiante: 1,
      primernombre: "Juan",
      contrasenia: await bcrypt.hash("1234", 10),
      correo_electronico: "test@asd.com"
    }

    mockRepo.findEstudianteByEmail.mockResolvedValue(estudianteMock)
    mockRepo.findProfesorByEmail.mockResolvedValue(null)

    const usecase = new LoginUseCase(mockRepo as unknown, jwtSecret)

    const result = await usecase.execute("test@asd.com", "1234")

    expect(result?.role).toBe("estudiante")
    expect(result?.token).toBeDefined()
  })

  it("debe fallar si contraseña es incorrecta", async () => {
    mockRepo.findEstudianteByEmail.mockResolvedValue({
      id_estudiante: 1,
      primernombre: "Juan",
      contrasenia: await bcrypt.hash("abcd", 10),
      correo_electronico: "test@asd.com"
    })

    mockRepo.findProfesorByEmail.mockResolvedValue(null)

    const usecase = new LoginUseCase(mockRepo as unknown, jwtSecret)

    const result = await usecase.execute("test@asd.com", "1234")

    expect(result).toBeNull()
  })

})
