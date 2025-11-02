/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Entidad } from "../../../../ecs/core/Componente";
import { getDispositivoHeight } from "../config/modelConfig";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";

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
  const [isPaused, setIsPaused] = useState(false);
  const [presupuesto, setPresupuesto] = useState(0);

  // useRef para evitar múltiples inicializaciones
  const inicializado = useRef(false);
  const tiempoIniciadoRef = useRef(false);

  const escenarioController = useMemo(
    () => EscenarioController.getInstance(escenario),
    [escenario]
  );

  // NO llamar ejecutarTiempo() ni efectuarPresupuesto() aquí
  // Se llamarán después de iniciarEscenario()

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (inicializado.current) {
      console.log("Hook ya inicializado, omitiendo");
      return;
    }

    inicializado.current = true;

    // PRIMERO: Inicializar el escenario
    escenarioController.iniciarEscenario();
    // SEGUNDO: Configurar tiempo
    escenarioController.ejecutarTiempo();
    // TERCERO: Cargar ataques DIRECTAMENTE en el sistema de tiempo
    escenarioController.cargarAtaquesEnSistema();
    // CUARTO: Configurar presupuesto
    escenarioController.efectuarPresupuesto(escenario.presupuestoInicial);
    // QUINTO: Obtener estado inicial
    setEntities(escenarioController.builder.getEntidades());
    setIsPaused(escenarioController.estaTiempoPausado());
    setPresupuesto(escenarioController.getPresupuestoActual());
    // SEXTO: Iniciar el tiempo automáticamente desde useEffect
    escenarioController.iniciarTiempo();
    tiempoIniciadoRef.current = true;

    const unsubscribePresupuesto = escenarioController.on(
      "presupuesto:actualizado",
      (data: unknown) => {
        const d = data as { presupuesto: number };
        setPresupuesto(d.presupuesto);
      }
    );

    const unsubscribeActualizado = escenarioController.on(
      "tiempo:actualizado",
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        setTiempoTranscurrido(d.transcurrido);
      }
    );

    const unsubscribePausado = escenarioController.on(
      "tiempo:pausado",
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        setTiempoTranscurrido(d.transcurrido);
        setIsPaused(true);
      }
    );

    const unsubscribeAtaqueRealizado = escenarioController.on(
      "ataque:ataqueRealizado",
      (data: unknown) => {
        const ataque = (data as unknown as { ataque?: { tipoAtaque?: string } })
          .ataque;
        setMostrarNuevoLog(true);
        setMensajeLog(`Ataque ejecutado: ${ataque?.tipoAtaque ?? ""}`);
      }
    );

    const unsubscribeAtaqueMitigado = escenarioController.on(
      "ataque:ataqueMitigado",
      (data: unknown) => {
        const ataque = (data as unknown as { ataque?: { tipoAtaque?: string } })
          .ataque;
        setMostrarNuevoLog(true);
        setMensajeLog(`Ataque mitigado: ${ataque?.tipoAtaque ?? ""}`);
      }
    );

    const unsubscribeReanudado = escenarioController.on(
      "tiempo:reanudado",
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        setTiempoTranscurrido(d.transcurrido);
        setIsPaused(false);
      }
    );

    return () => {
      console.log("Limpiando suscripciones");
      unsubscribePresupuesto();
      unsubscribeActualizado();
      unsubscribePausado();
      unsubscribeReanudado();
      unsubscribeAtaqueRealizado();
      unsubscribeAtaqueMitigado();
    };
  }, []); // Sin dependencias - solo se ejecuta una vez

  /**
   * Devuelve un array de entidades listo para render 3D
   * Sin filtrar ni perder datos, mantiene referencia a la entidad original
   */
  const processEntities = (): ECSSceneEntity[] => {
    if (!entities) return [];

    return Array.from(entities.entries()).map(
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
      console.log("Tiempo ya iniciado, omitiendo");
      return;
    }
    console.log("Llamando iniciar manualmente desde useECSScene");
    escenarioController.iniciarTiempo();
    tiempoIniciadoRef.current = true;
    setIsPaused(escenarioController.estaTiempoPausado());
  }, [escenarioController]);

  const pause = useCallback(() => {
    console.log("efectuando pausa");
    escenarioController.pausarTiempo();
    setIsPaused(true);
  }, [escenarioController]);

  const resume = useCallback(() => {
    console.log("efectuando reanudación");
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

  return {
    entities,
    mostrarNuevoLog,
    mensajeLog,
    setMostrarNuevoLog,
    setMensajeLog,
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
  };
}
