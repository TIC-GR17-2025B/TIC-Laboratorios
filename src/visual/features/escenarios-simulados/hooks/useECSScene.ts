import { useState, useEffect, useRef } from "react";
import { ECSManager } from "../../../../ecs/core/ECSManager";
import type { Entidad } from "../../../../ecs/core/Componente";
import { ScenarioBuilder } from "../../../../ecs/utils/ScenarioBuilder";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";
import { getDispositivoHeight } from "../config/modelConfig";

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

  useEffect(() => {
    if (inicializadoRef.current) {
      return;
    }
    inicializadoRef.current = true;

    const ecsManager = new ECSManager();
    ecsManagerRef.current = ecsManager;

    const builder = new ScenarioBuilder(ecsManager);
    builder.construirDesdeArchivo(escenario);
    builderRef.current = builder;

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
  };
}
