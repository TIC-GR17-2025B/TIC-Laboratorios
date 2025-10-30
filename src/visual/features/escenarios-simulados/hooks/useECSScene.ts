import { useState, useEffect, useRef } from "react";
import { ECSManager } from "../../../../ecs/core/ECSManager";
import type { Entidad } from "../../../../ecs/core/Componente";

import { getDispositivoHeight } from "../config/modelConfig";
import { ScenarioBuilder } from "../../../../ecs/utils/ScenarioBuilder";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";
import { SistemaTiempo } from "../../../../ecs/systems";
import { TiempoComponent } from "../../../../ecs/components";

export interface ECSSceneEntity {
  id: Entidad;
  position: [number, number, number];
  rotation: number;
  type: "espacio" | "dispositivo";
  muebleTipo?: string;
  dispositivoTipo?: string;
  nombre?: string;
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

interface ProcessedEntity {
  objetoConTipo: ObjetoConTipo;
  position: [number, number, number];
  rotacionY: number;
  entityIndex: number;
}

export function useECSScene() {
  const escenario = useEscenarioActual();
  const [entities, setEntities] = useState<any>([]);
  const ecsManagerRef = useRef<ECSManager | null>(null);
  const builderRef = useRef<ScenarioBuilder | null>(null);
  const inicializadoRef = useRef(false);

  // Usar un singleton a nivel de módulo para que múltiples hooks/componentes compartan el mismo ECS
  // (Header y la escena deben controlar la misma simulación)
  // Inicializamos perezosamente si no existe
  if (!(globalThis as any).__simECS) {
    const ecs = new ECSManager();
    const timeEntity = ecs.agregarEntidad();
    ecs.agregarComponente(timeEntity, new TiempoComponent());
    const sistemaTiempo = new SistemaTiempo();
    ecs.agregarSistema(sistemaTiempo);

    // Almacenar en globalThis para accesibilidad entre componentes/hook invocaciones
    (globalThis as any).__simECS = {
      ecsManager: ecs,
      timeEntity,
      sistemaTiempo,
      builder: null as ScenarioBuilder | null,
    };
  }

  // Referencias al singleton
  ecsManagerRef.current = (globalThis as any).__simECS.ecsManager as ECSManager;
  const timeEntity = (globalThis as any).__simECS.timeEntity as Entidad;
  const sistemaTiempo = (globalThis as any).__simECS
    .sistemaTiempo as SistemaTiempo;
  builderRef.current = (globalThis as any).__simECS
    .builder as ScenarioBuilder | null;

  useEffect(() => {
    if (inicializadoRef.current) {
      return;
    }
    inicializadoRef.current = true;

    const ecsManager = ecsManagerRef.current!;
    const builder = new ScenarioBuilder(ecsManager);
    builder.construirDesdeArchivo(escenario);
    builderRef.current = builder;
    // Guardar builder en singleton para posibles futuras referencias
    (globalThis as any).__simECS.builder = builder;

    setEntities(builder.getEntidades());
  }, [escenario]);

  // procesar entidades desde los maps
  const processEntities = (): ProcessedEntity[] => {
    if (!entities) return [];

    const processedEntities: ProcessedEntity[] = [];

    Array.from(entities.values()).forEach((value: any, entityIndex: number) => {
      const componentes = Array.from(value.map.values()) as any[];

      const objetoConTipo = componentes.find(
        (obj: any): obj is ObjetoConTipo =>
          "tipo" in obj && typeof obj.tipo === "string"
      );

      const transform = componentes.find(
        (obj: any): obj is Transform =>
          "x" in obj &&
          "y" in obj &&
          "z" in obj &&
          "rotacionY" in obj &&
          typeof obj.x === "number" &&
          typeof obj.y === "number" &&
          typeof obj.z === "number" &&
          typeof obj.rotacionY === "number"
      );

      if (!objetoConTipo) return;

      // el offsetY es para poner el dispositivo a
      // la altura correcta sobre una mesa
      const offsetY = getDispositivoHeight(objetoConTipo.tipo);

      const position: [number, number, number] = transform
        ? [transform.x, transform.y + offsetY, transform.z]
        : [0, offsetY, 0];

      const rotacionY: number = transform?.rotacionY ?? 0;

      processedEntities.push({
        objetoConTipo,
        position,
        rotacionY,
        entityIndex,
      });
    });

    return processedEntities;
  };

  return {
    entities,
    ecsManager: ecsManagerRef.current,
    builder: builderRef.current,
    processEntities,
    iniciar: () => {
      sistemaTiempo.iniciar(timeEntity);
    },
    pause: () => {
      console.log("useECSScene: pausar");
      sistemaTiempo.pausar(timeEntity);
    },
    resume: () => {
      console.log("useECSScene: reanudar");
      sistemaTiempo.reanudar(timeEntity);
    },
    isPaused: () => {
      const ecs = ecsManagerRef.current;
      if (!ecs) return false;
      const cont = ecs.getComponentes(timeEntity);
      if (!cont) return false;
      const tiempo = cont.get(TiempoComponent);
      return !!tiempo.pausado;
    },
  };
}
