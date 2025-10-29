import { useState, useEffect, useMemo } from "react";
import type { Entidad } from "../../../../ecs/core/Componente";
import { getDispositivoHeight } from "../config/modelConfig";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";

export interface ECSSceneEntity {
  entidadId: Entidad;
  objetoConTipo: { tipo: string; [key: string]: any };
  position: [number, number, number];
  rotacionY: number;
  entidadCompleta: any;
}

interface Transform {
  x: number;
  y: number;
  z: number;
  rotacionY: number;
}

interface ObjetoConTipo {
  tipo: string;
  [key: string]: any;
}

export function useECSScene() {
  const escenario = useEscenarioActual();
  const [entities, setEntities] = useState<Map<Entidad, any>>(new Map());
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [mostrarNuevoLog, setMostrarNuevoLog] = useState(false);
  const [mensajeLog, setMensajeLog] = useState("");
  const escenarioController = useMemo(
    () => EscenarioController.getInstance(escenario),
    [escenario]
  );

  const { iniciarTiempo, pausarTiempo, reanudarTiempo } =
    escenarioController.ejecutarTiempo();

  const { toggleConfiguracionWorkstation } =
    escenarioController.efectuarPresupuesto(escenario.presupuestoInicial);

  const [isPaused, setIsPaused] = useState(false);
  const [presupuesto, setPresupuesto] = useState(0);
  useEffect(() => {
    escenarioController.iniciarEscenario();
    setEntities(escenarioController.builder.getEntidades());
    setIsPaused(escenarioController.estaTiempoPausado());

    setPresupuesto(escenarioController.getPresupuestoActual());

    const unsubscribePresupuesto = escenarioController.on(
      "presupuesto:actualizado",
      (data: { presupuesto: number }) => {
        setPresupuesto(data.presupuesto);
      }
    );

    const unsubscribeActualizado = escenarioController.on(
      "tiempo:actualizado",
      (data: { transcurrido: number; pausado: boolean }) => {
        setTiempoTranscurrido(data.transcurrido);
      }
    );

    const unsubscribePausado = escenarioController.on(
      "tiempo:pausado",
      (data: { transcurrido: number; pausado: boolean }) => {
        setTiempoTranscurrido(data.transcurrido);
      }
    );

    const unsubscribeAtaqueRealizado = escenarioController.on(
      "ataque:ataqueRealizado",
      (data: { ataque: any }) => {
        setMostrarNuevoLog(true);
        setMensajeLog(`Ataque ejecutado: ${data.ataque.tipoAtaque}`);
      }
    );

    const unsubscribeAtaqueMitigado = escenarioController.on(
      "ataque:ataqueMitigado",
      (data: { ataque: any }) => {
        setMostrarNuevoLog(true);
        setMensajeLog(`Ataque mitigado: ${data.ataque.tipoAtaque}`);
      }
    );

    const unsubscribeReanudado = escenarioController.on(
      "tiempo:reanudado",
      (data: { transcurrido: number; pausado: boolean }) => {
        setTiempoTranscurrido(data.transcurrido);
      }
    );

    return () => {
      unsubscribePresupuesto();
      unsubscribeActualizado();
      unsubscribePausado();
      unsubscribeReanudado();
      unsubscribeAtaqueRealizado();
      unsubscribeAtaqueMitigado();
    };
  }, []);

  /**
   * Devuelve un array de entidades listo para render 3D
   * Sin filtrar ni perder datos, mantiene referencia a la entidad original
   */
  const processEntities = (): ECSSceneEntity[] => {
    if (!entities) return [];

    return Array.from(entities.entries()).map(
      ([entidadId, entidadObjeto]): ECSSceneEntity => {
        const componentes = Array.from(entidadObjeto.map.values());

        const objetoConTipo = componentes.find(
          (c: any): c is ObjetoConTipo =>
            "tipo" in c && typeof c.tipo === "string"
        );

        const transform = componentes.find(
          (c: any): c is Transform =>
            "x" in c &&
            "y" in c &&
            "z" in c &&
            "rotacionY" in c &&
            typeof c.x === "number"
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

  return {
    entities,
    mostrarNuevoLog,
    mensajeLog,
    setMostrarNuevoLog,
    setMensajeLog,
    ecsManager: escenarioController.escManager,
    builder: escenarioController.builder,
    processEntities,
    tiempoTranscurrido,
    iniciar: () => {
      iniciarTiempo();
      setIsPaused(escenarioController.estaTiempoPausado());
    },
    pause: () => {
      console.log("efectuando pausa");
      pausarTiempo();
      setIsPaused(true);
    },
    resume: () => {
      console.log("efectuando reanudación");
      reanudarTiempo();
      setIsPaused(false);
    },
    isPaused,
    presupuesto,
    toggleConfigWorkstation: (
      entidadWorkstation: Entidad,
      nombreConfig: string
    ) => {
      toggleConfiguracionWorkstation(entidadWorkstation, nombreConfig);
    },
  };
}
