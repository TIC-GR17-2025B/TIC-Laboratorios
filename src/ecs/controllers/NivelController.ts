import * as escenarios from '../../data/escenarios/'
import type { EscenarioPreview } from '../../types/EscenarioTypes';

export class NivelController {

  private listaEscenarios: EscenarioPreview[] = Object.values(escenarios) as EscenarioPreview[];

  public getEscenarios(): EscenarioPreview[] | undefined {
    const previewsDeEscenarios: EscenarioPreview[] = [];

    this.listaEscenarios.forEach((e) => {
      previewsDeEscenarios.push({
        id: e.id,
        titulo: e.titulo,
        descripcion: e.descripcion,
        imagenPreview: e.imagenPreview,
      });
    });

    return previewsDeEscenarios;
  }

  public cargarEscenario(idEscenario: number): unknown {
    for (const escenario of this.listaEscenarios) {
      if (escenario.id == idEscenario) return escenario;
    }
  }

}
