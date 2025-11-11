import { useMemo, useState, useEffect } from "react";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import {
  DispositivoComponent,
  WorkstationComponent,
  Transform,
  RedComponent,
} from "../../../../ecs/components";
import type { Dispositivo } from "../../../../types/EscenarioTypes";
import {
  EstadoAtaqueDispositivo,
  TipoDispositivo,
} from "../../../../types/DeviceEnums";
import { EventosRed } from "../../../../types/EventosEnums";

export function useDispositivos() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = EscenarioController.getInstance();

    const unsubscribeAsignada = controller.ecsManager.on(
      EventosRed.RED_ASIGNADA,
      () => {
        setRefreshKey((prev) => prev + 1);
      }
    );

    const unsubscribeRemovida = controller.ecsManager.on(
      EventosRed.RED_REMOVIDA,
      () => {
        setRefreshKey((prev) => prev + 1);
      }
    );

    return () => {
      unsubscribeAsignada();
      unsubscribeRemovida();
    };
  }, []);

  const dispositivos = useMemo(() => {
    try {
      const controller = EscenarioController.getInstance();
      const entidades = controller.getWorkstationsYServers();

      return entidades.map((entidad): Dispositivo => {
        const container = controller.ecsManager.getComponentes(entidad);
        if (!container) {
          return {
            id: entidad,
            entidadId: entidad,
            tipo: TipoDispositivo.OTRO,
            nombre: "Dispositivo desconocido",
            sistemaOperativo: "",
            hardware: "",
            software: "",
            estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
            activos: [],
          } as Dispositivo;
        }

        const dispComp = container.get(DispositivoComponent);
        const wsComp = container.get(WorkstationComponent);
        const transform = container.get(Transform);

        const posicion = transform
          ? {
              x: transform.x,
              y: transform.y,
              z: transform.z,
              rotacionY: transform.rotacionY,
            }
          : undefined;

        // Obtener información de las redes conectadas
        const redesConectadas = (dispComp?.redes ?? [])
          .map((redEntidadId) => {
            const redContainer =
              controller.ecsManager.getComponentes(redEntidadId);
            const redComp = redContainer?.get(RedComponent);
            if (!redComp) return null;
            return {
              nombre: redComp.nombre,
              color: redComp.color,
              entidadId: redEntidadId,
            };
          })
          .filter(
            (
              red
            ): red is { nombre: string; color: string; entidadId: number } =>
              red !== null
          );

        const dispositivo: Dispositivo = {
          id: entidad,
          entidadId: entidad,
          tipo: dispComp?.tipo ?? TipoDispositivo.OTRO,
          nombre: dispComp?.nombre ?? "Dispositivo sin nombre",
          sistemaOperativo: dispComp?.sistemaOperativo ?? "",
          hardware: dispComp?.hardware ?? "",
          software: "",
          posicion,
          estadoAtaque:
            dispComp?.estadoAtaque ?? EstadoAtaqueDispositivo.NORMAL,
          redes: redesConectadas,
          activos: [],
        };

        // Agregar configuraciones si es workstation
        if (wsComp) {
          dispositivo.configuraciones = wsComp.configuraciones;
        }

        return dispositivo;
      });
    } catch (error) {
      console.error("Error obteniendo dispositivos:", error);
      return [];
    }
  }, [refreshKey]);

  return {
    dispositivos,
  };
}
