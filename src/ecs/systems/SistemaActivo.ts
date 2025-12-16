import { ActivoComponent } from "../components";
import { Sistema, type ClaseComponente } from "../core";
import { createHash } from "crypto";

export class SistemaActivo extends Sistema {
    public componentesRequeridos: Set<ClaseComponente> = new Set([ActivoComponent]);

    // Calcula el hash, con SHA-256, del contenido del documento.
    // Por simplicidad para el jugador, se devuelven sólo los primeros 15 caracteres del hash.
    public calcularHashDocumento(contenido: string): string {
      return createHash("sha256").update(contenido).digest("hex").substring(0,15);
    }
}
