import { useState, useEffect, useCallback, useMemo } from "react";
import type { SoftwareApp } from "../../../../types/EscenarioTypes";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import { DispositivoComponent } from "../../../../ecs/components";
import type { Entidad } from "../../../../ecs/core/Componente";
import { EventosPublicos } from "../../../../types/EventosEnums";

export function useAppsDispositivo(entidadDispositivo: Entidad | undefined) {
  const [appsInstaladas, setAppsInstaladas] = useState<SoftwareApp[]>([]);
  const [appsDisponibles, setAppsDisponibles] = useState<SoftwareApp[]>([]);
  const [presupuestoActual, setPresupuestoActual] = useState<number>(0);
  const [, forceUpdate] = useState({});

  const escenarioController = useMemo(() => {
    return EscenarioController.getInstance();
  }, []);

  // Función para leer el estado actual del ECS
  const leerEstadoECS = useCallback(() => {
    if (!entidadDispositivo) {
      return { apps: [], disponibles: [], presupuesto: 0 };
    }

    const dispositivo =
      escenarioController.ecsManager.getComponentes(entidadDispositivo);
    const apps = dispositivo?.get(DispositivoComponent)?.apps || [];
    const disponibles =
      escenarioController.getAppsDisponiblesPorDispositivo(
        entidadDispositivo
      ) || [];
    const presupuesto = escenarioController.getPresupuestoActual();

    return { apps: [...apps], disponibles: [...disponibles], presupuesto };
  }, [entidadDispositivo, escenarioController]);

  // Actualizar estado desde ECS
  const actualizarEstado = useCallback(() => {
    const { apps, disponibles, presupuesto } = leerEstadoECS();
    setAppsInstaladas(apps);
    setAppsDisponibles(disponibles);
    setPresupuestoActual(presupuesto);
  }, [leerEstadoECS]);

  // Efecto inicial para cargar datos
  useEffect(() => {
    actualizarEstado();
  }, [actualizarEstado]);

  // Suscribirse a eventos de presupuesto para actualizar la UI
  useEffect(() => {
    const unsubscribePresupuesto = escenarioController.on(
      EventosPublicos.PRESUPUESTO_ACTUALIZADO,
      () => {
        actualizarEstado();
      }
    );

    return () => {
      unsubscribePresupuesto();
    };
  }, [escenarioController, actualizarEstado]);

  const comprarApp = useCallback(
    (nombreApp: string) => {
      if (!entidadDispositivo) return;

      try {
        escenarioController.comprarApp(entidadDispositivo, nombreApp);
        // Leer estado fresco y actualizar
        const { apps, disponibles, presupuesto } = leerEstadoECS();
        setAppsInstaladas(apps);
        setAppsDisponibles(disponibles);
        setPresupuestoActual(presupuesto);
      } catch (error) {
        console.error("Error al comprar app:", error);
      }
    },
    [entidadDispositivo, escenarioController, leerEstadoECS]
  );

  const desinstalarApp = useCallback(
    (nombreApp: string) => {
      if (!entidadDispositivo) return;

      try {
        escenarioController.desinstalarApp(entidadDispositivo, nombreApp);
        // Leer estado fresco y actualizar inmediatamente
        const { apps, disponibles, presupuesto } = leerEstadoECS();
        setAppsInstaladas(apps);
        setAppsDisponibles(disponibles);
        setPresupuestoActual(presupuesto);
        // Forzar re-render
        forceUpdate({});
      } catch (error) {
        console.error("Error al desinstalar app:", error);
      }
    },
    [entidadDispositivo, escenarioController, leerEstadoECS]
  );

  const puedeComprar = useCallback(
    (precio: number): boolean => {
      return presupuestoActual >= precio;
    },
    [presupuestoActual]
  );

  return {
    appsInstaladas,
    appsDisponibles,
    presupuestoActual,
    comprarApp,
    desinstalarApp,
    puedeComprar,
  };
}
