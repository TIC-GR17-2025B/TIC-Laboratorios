import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import {
  generarNodos,
  generarAristas,
  type Topologia,
  type LayoutConfig,
} from "../utils/topologiaLayout";

/**
 * Custom hook que encapsula la lógica de generación de nodos y aristas
 * para la visualización de topología de red
 */
export function useTopologiaLayout(
  topologia: Topologia,
  layoutConfig?: Partial<LayoutConfig>
) {
  const nodes: Node[] = useMemo(
    () => generarNodos(topologia, layoutConfig),
    [topologia, layoutConfig]
  );

  const edges: Edge[] = useMemo(() => generarAristas(topologia), [topologia]);

  return { nodes, edges };
}
