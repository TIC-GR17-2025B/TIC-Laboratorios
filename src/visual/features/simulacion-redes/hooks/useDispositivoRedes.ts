import { useCallback, useMemo, useState, useEffect } from "react";
import type { ECSManager } from "../../../../ecs/core";
import type { Entidad } from "../../../../ecs/core/Componente";
import {
  DispositivoComponent,
  RedComponent,
  ZonaComponent,
} from "../../../../ecs/components";
import { SistemaJerarquiaEscenario } from "../../../../ecs/systems/SistemaJerarquiaEscenario";
import { RedController } from "../../../../ecs/controllers/RedController";
import { EventosPublicos } from "../../../../types/EventosEnums";

interface RedInfo {
  entidadId: Entidad;
  nombre: string;
  color: string;
  estaActiva: boolean;
}

export function useDispositivoRedes(
  entidadId: Entidad | null,
  ecsManager: ECSManager
) {
  const [refreshKey, setRefreshKey] = useState(0);

  /* Eventos del ECS */
  useEffect(() => {
    const unsubscribeAsignada = ecsManager.on(
      EventosPublicos.RED_ASIGNADA,
      () => {
        setRefreshKey((prev) => prev + 1);
      }
    );

    const unsubscribeRemovida = ecsManager.on(
      EventosPublicos.RED_REMOVIDA,
      () => {
        setRefreshKey((prev) => prev + 1);
      }
    );

    return () => {
      unsubscribeAsignada();
      unsubscribeRemovida();
    };
  }, [ecsManager]);

  const dispositivo = useMemo(() => {
    if (!entidadId) return null;
    const container = ecsManager.getComponentes(entidadId);
    return container?.get(DispositivoComponent);
  }, [entidadId, ecsManager, refreshKey]);

  /* Cálculo de las redes disponibles en la zona del dispositivo */
  const redesDisponibles = useMemo((): RedInfo[] => {
    if (!entidadId || !dispositivo) return [];

    const sistemaJerarquia = ecsManager.getSistema(SistemaJerarquiaEscenario);
    if (!sistemaJerarquia) return [];

    const zonaEntidadId = sistemaJerarquia.obtenerZonaDeDispositivo(entidadId);
    if (!zonaEntidadId) return [];

    const zonaContainer = ecsManager.getComponentes(zonaEntidadId);
    const zonaComponent = zonaContainer?.get(ZonaComponent);
    if (!zonaComponent) return [];

    const redesActivasSet = new Set(dispositivo.redes);

    return zonaComponent.redes
      .map((redEntidadId: Entidad) => {
        const redContainer = ecsManager.getComponentes(redEntidadId);
        const redComp = redContainer?.get(RedComponent);
        if (!redComp) return null;

        return {
          entidadId: redEntidadId,
          nombre: redComp.nombre,
          color: redComp.color,
          estaActiva: redesActivasSet.has(redEntidadId),
        };
      })
      .filter((red): red is RedInfo => red !== null);
  }, [entidadId, dispositivo, ecsManager, refreshKey]);

  /* Función para hacer toggle de una red a un dispositivo, solo llamo al RedController*/
  const toggleRed = useCallback(
    (redEntidadId: Entidad) => {
      if (!entidadId || !dispositivo) return;

      const redController = RedController.getInstance(ecsManager);
      const estaActiva = dispositivo.redes.includes(redEntidadId);

      if (estaActiva) {
        redController.removerRed(entidadId, redEntidadId);
      } else {
        redController.asignarRed(entidadId, redEntidadId);
      }
    },
    [entidadId, dispositivo, ecsManager]
  );

  return {
    dispositivo,
    redesDisponibles,
    toggleRed,
  };
}
