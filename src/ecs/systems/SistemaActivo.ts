import type { Activo } from "../../types/EscenarioTypes";
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

    // Verifica primero el propietario de la firma y de la clave, si coinciden entonces
    // se calcula el hash del contenido de la firma (que es el mismo contenido del docuemento),
    // por lo cual el hash saliente será igual al del documento.
    // Si los propietarios no coinciden, entonces se extrae el hash del nombre de la clave,
    // lo cual dará un hash diferente al del documento.
    public calcularHashFirma(firma: Activo, clave: Activo): string {
        return firma.propietario == clave.propietario ? 
          createHash("sha256").update(firma.contenido!).digest("hex").substring(0,15):
          createHash("sha256").update(clave.nombre!).digest("hex").substring(0,15);
    }
}
