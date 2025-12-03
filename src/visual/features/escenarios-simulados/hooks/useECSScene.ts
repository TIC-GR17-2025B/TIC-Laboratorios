import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Entidad } from "../../../../ecs/core/Componente";
import { getDispositivoHeight } from "../config/modelConfig";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import {
  EventosPublicos,
  TipoLogGeneral,
} from "../../../../types/EventosEnums";
import { RedController } from "../../../../ecs/controllers/RedController";
import { EscenarioComponent } from "../../../../ecs/components";

export interface ECSSceneEntity {
  entidadId: Entidad;
  objetoConTipo: { tipo: string; [key: string]: unknown };
  position: [number, number, number];
  rotacionY: number;
  entidadCompleta: unknown;
}

interface Transform {
  x: number;
  y: number;
  z: number;
  rotacionY: number;
}

interface ObjetoConTipo {
  tipo: string;
  [key: string]: unknown;
}

export function useECSScene() {
  const escenario = useEscenarioActual();
  const [entities, setEntities] = useState<Map<Entidad, unknown>>(new Map());
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [mostrarNuevoLog, setMostrarNuevoLog] = useState(false);
  const [mensajeLog, setMensajeLog] = useState("");
  const [tiempoLog, setTiempoLog] = useState(0);
  const [tipoLog, setTipoLog] = useState<
    "ataque" | "advertencia" | "completado"
  >("advertencia");
  const [logs, setLogs] = useState<
    Array<{ time: string; content: string; category: string }>
  >([]);
  const [isPaused, setIsPaused] = useState(false);
  const [presupuesto, setPresupuesto] = useState(0);
  const [logsPanelOpen, setLogsPanelOpen] = useState(false);
  const [hasNewLog, setHasNewLog] = useState(false);
  const [zonaActual, setZonaActual] = useState<number | null>(null);
  const [zonasDisponibles, setZonasDisponibles] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [showZoneToast, setShowZoneToast] = useState(false);
  const [zoneToastName, setZoneToastName] = useState("");

  // useRef para evitar múltiples inicializaciones
  const inicializado = useRef(false);
  const tiempoIniciadoRef = useRef(false);
  const lastSeenCountRef = useRef(0);
  const escenarioIdRef = useRef<number | null>(null);

  const escenarioController = useMemo(
    () => EscenarioController.getInstance(escenario),
    [escenario]
  );

  const redController = useMemo(
    () => RedController.getInstance(escenarioController.ecsManager),
    [escenarioController]
  );

  // Detectar cambio de escenario y resetear el estado de inicialización
  if (escenarioIdRef.current !== escenario.id) {
    escenarioIdRef.current = escenario.id;
    inicializado.current = false;
    tiempoIniciadoRef.current = false;
  }

  // Función helper para formatear tiempo
  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos.toString().padStart(2, "0")}:${segs
      .toString()
      .padStart(2, "0")}`;
  };

  // Función helper para agregar un log
  const agregarLog = useCallback(
    (content: string, category: string) => {
      const tiempo = escenarioController.tiempoTranscurrido;
      const nuevoLog = {
        time: formatearTiempo(tiempo),
        content,
        category,
      };
      setLogs((prev) => [...prev, nuevoLog]);
      // Si el panel está cerrado, marcar que hay logs nuevos
      if (!logsPanelOpen) {
        setHasNewLog(true);
      }
    },
    [escenarioController]
  );

  // Función para abrir/cerrar el panel de logs
  const toggleLogsPanel = useCallback(
    (isOpen: boolean) => {
      setLogsPanelOpen(isOpen);
      if (isOpen) {
        // Al abrir el panel, marcar todos los logs como vistos
        setHasNewLog(false);
        lastSeenCountRef.current = logs.length;
      }
    },
    [logs.length]
  );

  // NO llamar ejecutarTiempo() ni efectuarPresupuesto() aquí
  // Se llamarán después de iniciarEscenario()

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (inicializado.current) {
      return;
    }

    inicializado.current = true;

    // Resetear todos los estados al inicializar un nuevo escenario
    setLogs([]);
    setMostrarNuevoLog(false);
    setTiempoTranscurrido(0);
    lastSeenCountRef.current = 0;

    // PRIMERO: Inicializar el escenario
    escenarioController.iniciarEscenario();

    // SEGUNDO: Configurar tiempo
    escenarioController.ejecutarTiempo();
    // TERCERO: Cargar eventos DIRECTAMENTE en el sistema de tiempo
    escenarioController.cargarEventosEnSistema();
    // CUARTO: Configurar presupuesto
    escenarioController.efectuarPresupuesto(escenario.presupuestoInicial);
    // QUINTO: Obtener estado inicial
    setEntities(escenarioController.builder.getEntidades());
    setIsPaused(escenarioController.estaTiempoPausado());
    setPresupuesto(escenarioController.getPresupuestoActual());

    // Obtener zonas del escenario
    const zonas = escenarioController.builder.obtenerZonas();
    setZonasDisponibles(zonas);
    // Establecer la primera zona como activa por defecto
    if (zonas.length > 0) {
      setZonaActual(zonas[0].id);
      // Mostrar toast inicial con la zona cargada
      setZoneToastName(zonas[0].nombre);
      setShowZoneToast(true);
    }

    // SEXTO: Iniciar sistema de red
    redController.iniciarController();
    // SÉPTIMO: Iniciar el tiempo automáticamente desde useEffect
    escenarioController.iniciarTiempo();
    tiempoIniciadoRef.current = true;

    const unsubscribeLogsGeneralesActualizados = escenarioController.on(
      EventosPublicos.LOGS_GENERALES_ACTUALIZADOS,
      (data: unknown) => {
        const pausarTiempo = data as boolean;

        // Obtener el último log del EscenarioComponent
        for (const [
          ,
          container,
        ] of escenarioController.ecsManager.getEntidades()) {
          if (container.tiene(EscenarioComponent)) {
            const escenarioComp = container.get(EscenarioComponent);
            const logsGenerales = escenarioComp?.logsGenerales || [];
            if (logsGenerales.length > 0) {
              const ultimoLog = logsGenerales[logsGenerales.length - 1];

              // Mostrar el nuevo log en la UI
              setMostrarNuevoLog(true);
              setMensajeLog(ultimoLog.mensaje);
              setTiempoLog(escenarioController.tiempoTranscurrido);

              // Determinar el tipo de log según el tipo del log general
              let tipoLogUI: "ataque" | "advertencia" | "completado" =
                "advertencia";
              let categoria = "ADVERTENCIA";

              if (ultimoLog.tipo === TipoLogGeneral.ATAQUE) {
                tipoLogUI = "ataque";
                categoria = "ATAQUE";
              } else if (ultimoLog.tipo === TipoLogGeneral.COMPLETADO) {
                tipoLogUI = "completado";
                categoria = "INFO";
              }

              setTipoLog(tipoLogUI);
              agregarLog(ultimoLog.mensaje, categoria);
            }
            break;
          }
        }

        // Pausar el tiempo si es necesario
        if (pausarTiempo) {
          pause();
        }
      }
    );

    const unsubscribePresupuesto = escenarioController.on(
      EventosPublicos.PRESUPUESTO_ACTUALIZADO,
      (data: unknown) => {
        const d = data as { presupuesto: number };
        setPresupuesto(d.presupuesto);
      }
    );

    const unsubscribeActualizado = escenarioController.on(
      EventosPublicos.TIEMPO_ACTUALIZADO,
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        setTiempoTranscurrido(d.transcurrido);
      }
    );

    const unsubscribePausado = escenarioController.on(
      EventosPublicos.TIEMPO_PAUSADO,
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        setTiempoTranscurrido(d.transcurrido);
        setIsPaused(true);
      }
    );

    const unsubscribeReanudado = escenarioController.on(
      EventosPublicos.TIEMPO_REANUDADO,
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        setTiempoTranscurrido(d.transcurrido);
        setIsPaused(false);
      }
    );

    return () => {
      unsubscribeLogsGeneralesActualizados();
      unsubscribePresupuesto();
      unsubscribeActualizado();
      unsubscribePausado();
      unsubscribeReanudado();
    };
  }, [escenarioController, agregarLog]);

  /**
   * Devuelve un array de entidades listo para render 3D
   * Filtra las entidades según la zona actual seleccionada
   */
  const processEntities = (): ECSSceneEntity[] => {
    if (!entities) return [];

    // Si hay una zona seleccionada, obtener solo las entidades de esa zona
    const entidadesAMostrar =
      zonaActual !== null
        ? escenarioController.builder.obtenerEntidadesDeZona(zonaActual)
        : entities;

    return Array.from(entidadesAMostrar.entries()).map(
      ([entidadId, entidadObjeto]): ECSSceneEntity => {
        const componentes = Array.from(
          (
            entidadObjeto as unknown as { map: Map<unknown, unknown> }
          ).map.values()
        ) as unknown[];

        const objetoConTipo = componentes.find(
          (c: unknown): c is ObjetoConTipo =>
            typeof c === "object" &&
            c !== null &&
            "tipo" in (c as Record<string, unknown>) &&
            typeof (c as Record<string, unknown>).tipo === "string"
        );

        const transform = componentes.find(
          (c: unknown): c is Transform =>
            typeof c === "object" &&
            c !== null &&
            "x" in (c as Record<string, unknown>) &&
            "y" in (c as Record<string, unknown>) &&
            "z" in (c as Record<string, unknown>) &&
            "rotacionY" in (c as Record<string, unknown>) &&
            typeof (c as Record<string, unknown>).x === "number"
        );

        const offsetY = objetoConTipo
          ? getDispositivoHeight(objetoConTipo.tipo)
          : 0;
        const position: [number, number, number] = transform
          ? [transform.x, transform.y + offsetY, transform.z]
          : [0, offsetY, 0];

        const rotacionY = transform ? (transform.rotacionY * Math.PI) / 180 : 0;

        return {
          entidadId,
          objetoConTipo: objetoConTipo ?? { tipo: "desconocido" },
          position,
          rotacionY,
          entidadCompleta: entidadObjeto,
        };
      }
    );
  };

  // Memoizar las funciones para que no cambien en cada render
  const iniciar = useCallback(() => {
    if (tiempoIniciadoRef.current) {
      return;
    }
    escenarioController.iniciarTiempo();
    tiempoIniciadoRef.current = true;
    setIsPaused(escenarioController.estaTiempoPausado());
  }, [escenarioController]);

  const pause = useCallback(() => {
    escenarioController.pausarTiempo();
    setIsPaused(true);
  }, [escenarioController]);

  const resume = useCallback(() => {
    escenarioController.reanudarTiempo();
    setIsPaused(false);
  }, [escenarioController]);

  const toggleConfigWorkstation = useCallback(
    (entidadWorkstation: Entidad, nombreConfig: string) => {
      escenarioController.toggleConfiguracionWorkstation(
        entidadWorkstation,
        nombreConfig
      );
    },
    [escenarioController]
  );

  const cambiarZona = useCallback(
    (nuevaZonaId: number) => {
      setZonaActual(nuevaZonaId);
      // Mostrar toast con el nombre de la zona
      const zona = zonasDisponibles.find((z) => z.id === nuevaZonaId);
      if (zona) {
        setZoneToastName(zona.nombre);
        setShowZoneToast(true);
      }
    },
    [zonasDisponibles]
  );

  const siguienteZona = useCallback(() => {
    if (zonasDisponibles.length === 0 || zonaActual === null) return;

    const currentIndex = zonasDisponibles.findIndex((z) => z.id === zonaActual);
    const nextIndex = (currentIndex + 1) % zonasDisponibles.length;
    const siguienteZonaId = zonasDisponibles[nextIndex].id;

    cambiarZona(siguienteZonaId);
  }, [zonasDisponibles, zonaActual, cambiarZona]);

  const anteriorZona = useCallback(() => {
    if (zonasDisponibles.length === 0 || zonaActual === null) return;

    const currentIndex = zonasDisponibles.findIndex((z) => z.id === zonaActual);
    const prevIndex =
      (currentIndex - 1 + zonasDisponibles.length) % zonasDisponibles.length;
    const anteriorZonaId = zonasDisponibles[prevIndex].id;

    cambiarZona(anteriorZonaId);
  }, [zonasDisponibles, zonaActual, cambiarZona]);

  const hideZoneToast = useCallback(() => {
    setShowZoneToast(false);
  }, []);

  return {
    entities,
    mostrarNuevoLog,
    mensajeLog,
    tiempoLog,
    tipoLog,
    logs,
    hasNewLog,
    logsPanelOpen,
    toggleLogsPanel,
    setMostrarNuevoLog,
    setMensajeLog,
    redController,
    ecsManager: escenarioController.ecsManager,
    builder: escenarioController.builder,
    processEntities,
    tiempoTranscurrido,
    iniciar,
    pause,
    resume,
    isPaused,
    presupuesto,
    toggleConfigWorkstation,
    zonaActual,
    anteriorZona,
    zonasDisponibles,
    cambiarZona,
    siguienteZona,
    showZoneToast,
    zoneToastName,
    hideZoneToast,
  };
}
