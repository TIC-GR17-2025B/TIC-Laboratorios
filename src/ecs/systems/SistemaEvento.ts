import { EstadoAtaqueDispositivo } from "../../types/DeviceEnums";
import { AtaqueComponent, DispositivoComponent } from "../components";
import { Sistema, type Entidad } from "../core";
import type { ClaseComponente } from "../core/Componente";

export class SistemaEvento extends Sistema {
  public componentesRequeridos: Set<ClaseComponente> = new Set([
    AtaqueComponent,
  ]);

  public on(eventName: string, callback: (data: unknown) => void): () => void {
    return this.ecsManager.on(eventName, callback);
  }

  public ejecutarAtaque(
    entidadDispositivo: Entidad,
    ataque: AtaqueComponent
  ): void {
    const container3 = this.ecsManager.getComponentes(entidadDispositivo);
    if (!container3) return;
    const dispositivoAAtacar = container3.get(DispositivoComponent);
    if (!dispositivoAAtacar) return;

    if (
      !this.ecsManager.consultarAccion(
        ataque.condicionMitigacion.accion,
        ataque.condicionMitigacion.objeto,
        ataque.condicionMitigacion.tiempo!,
        ataque.condicionMitigacion.val
      )
    ) {
      dispositivoAAtacar.estadoAtaque = EstadoAtaqueDispositivo.COMPROMETIDO;
      this.ecsManager.emit("ataque:ataqueRealizado", { ataque });
    } else {
      this.ecsManager.emit("ataque:ataqueMitigado", { ataque });
    }
  }
}
