import { FaseComponent } from "../components";
import { Sistema } from "../core";
import type { ClaseComponente } from "../core/Componente";

export class SistemaFase extends Sistema {
  public componentesRequeridos: Set<ClaseComponente> = new Set([FaseComponent]);

  constructor() {
    super();
  }
}
