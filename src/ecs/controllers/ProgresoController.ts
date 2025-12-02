export class ProgresoController {
 
  private API_URL = "/api";

  private static instance: ProgresoController | null = null;

  public static getInstance(): ProgresoController {
    if (!ProgresoController.instance) {
      ProgresoController.instance = new ProgresoController();
    }
    return ProgresoController.instance;
  }

  public async guardarProgresoEstudiante(terminado: boolean, tiempo: number) {

    const {id_estudiante, id_escenario} = await this.getDatosSesion();
    const data = {
      id_estudiante: id_estudiante,
      id_escenario: id_escenario,
      terminado: terminado,
      tiempo: tiempo
    };

    try {
      const response = await fetch(`${this.API_URL}/progreso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        console.error(
          `Error del servidor: No se recibió una respuesta JSON válida.`
        );
        return null;
      }

    } catch (err) {
      console.error("Error completo:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión";
      console.error(
        `${errorMessage}. ¿Está el servidor backend corriendo en /progreso?`
      );
      return null;
    }
  }

  public async getProgresoEstudiante(
    id_estudiante: number,
    id_escenario: number
  ): Promise<{
      terminado: boolean;
      intentos: number;
  } | null> {

    try {
      const response = await fetch(`${this.API_URL}/progreso/estudiante/${id_estudiante}/escenario/${id_escenario}`, {
        method: "GET",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        console.error(
          `Error del servidor: No se recibió una respuesta JSON válida.`
        );
        return null;
      }

      const respuesta: unknown = response;
      return respuesta as {terminado: boolean; intentos: number;};

    } catch (err) {
      console.error("Error completo:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión";
      console.error(
        `${errorMessage}. ¿Está el servidor backend corriendo en /progreso?`
      );
      return null;
    }
  }

  private async getDatosSesion(): Promise<{id_estudiante: number; id_escenario: number}> {
    const id_estudiante = JSON.parse(localStorage.getItem("user")!).id_estudiante;
    // const id_escenario = JSON.parse(localStorage.getItem("user")!).id_escenario;
    return { id_estudiante: id_estudiante, id_escenario: 6 };
  }
}
