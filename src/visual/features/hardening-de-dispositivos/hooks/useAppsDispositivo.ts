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
    const [version, setVersion] = useState(0);

    const escenarioController = useMemo(() => {
        return EscenarioController.getInstance();
    }, []);

    // Función para actualizar el estado desde el ECS
    const actualizarEstado = useCallback(() => {
        if (!entidadDispositivo) {
            setAppsInstaladas([]);
            setAppsDisponibles([]);
            setPresupuestoActual(0);
            return;
        }

        // Obtener apps instaladas del dispositivo
        const dispositivo = escenarioController.ecsManager.getComponentes(entidadDispositivo);
        const apps = dispositivo?.get(DispositivoComponent)?.apps || [];
        setAppsInstaladas([...apps]);

        // Obtener apps disponibles para el dispositivo
        const disponibles = escenarioController.getAppsDisponiblesPorDispositivo(entidadDispositivo) || [];
        setAppsDisponibles([...disponibles]);

        // Obtener presupuesto actual
        const presupuesto = escenarioController.getPresupuestoActual();
        setPresupuestoActual(presupuesto);
    }, [entidadDispositivo, escenarioController]);

    // Efecto inicial para cargar datos
    useEffect(() => {
        actualizarEstado();
    }, [actualizarEstado, version]);

    // Suscribirse a eventos de presupuesto para actualizar la UI
    useEffect(() => {
        const unsubscribePresupuesto = escenarioController.on(
            EventosPublicos.PRESUPUESTO_ACTUALIZADO,
            () => {
                setVersion((prev) => prev + 1);
            }
        );

        return () => {
            unsubscribePresupuesto();
        };
    }, [escenarioController]);

    const comprarApp = useCallback(
        (nombreApp: string) => {
            if (!entidadDispositivo) return;

            try {
                escenarioController.comprarApp(entidadDispositivo, nombreApp);
                // Forzar actualización inmediata
                setVersion((prev) => prev + 1);
            } catch (error) {
                console.error("Error al comprar app:", error);
            }
        },
        [entidadDispositivo, escenarioController]
    );

    const desinstalarApp = useCallback(
        (nombreApp: string) => {
            if (!entidadDispositivo) return;

            try {
                escenarioController.desinstalarApp(entidadDispositivo, nombreApp);
                // Forzar actualización inmediata
                setVersion((prev) => prev + 1);
            } catch (error) {
                console.error("Error al desinstalar app:", error);
            }
        },
        [entidadDispositivo, escenarioController]
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
