import type { Node, Edge } from "@xyflow/react";
import { TipoDispositivo } from "../../../../types/DeviceEnums";
import type { Entidad } from "../../../../ecs/core/Componente";

export interface NodoTopologia {
  id: string;
  nombre: string;
  tipo: TipoDispositivo;
  redes: { nombre: string; color: string }[];
  entidadId?: Entidad;
}

export interface ZonaTopologia {
  id: string;
  nombre: string;
  nodos: NodoTopologia[];
  entidadZona?: Entidad;
}

export interface Topologia {
  zonas: ZonaTopologia[];
}

export interface LayoutConfig {
  espaciadoZonas: number;
  espaciadoDispositivos: number;
  minGroupWidth: number;
  groupPadding: number;
  groupHeight: number;
  topY: number;
  bottomY: number;
}

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  espaciadoZonas: 80,
  espaciadoDispositivos: 120,
  minGroupWidth: 80,
  groupPadding: 16,
  groupHeight: 240,
  topY: 70,
  bottomY: 200,
};

/**
 * Calcula las posiciones de los nodos de una zona
 */
function calcularPosicionesZona(
  zona: ZonaTopologia,
  xOffset: number,
  config: LayoutConfig
): { nodes: Node[]; groupWidth: number } {
  const nodes: Node[] = [];
  const routers = zona.nodos.filter(
    (n) => n.tipo === TipoDispositivo.ROUTER || n.tipo === TipoDispositivo.VPN
  );
  const otros = zona.nodos.filter(
    (n) => n.tipo !== TipoDispositivo.ROUTER && n.tipo !== TipoDispositivo.VPN
  );

  const maxDevicesInRow = Math.max(otros.length, routers.length, 1);
  const groupWidth = Math.max(
    config.minGroupWidth,
    maxDevicesInRow * config.espaciadoDispositivos + config.groupPadding
  );

  // Nodo de grupo (zona)
  nodes.push({
    id: `group-${zona.id}`,
    type: "group",
    position: { x: xOffset, y: 50 },
    data: { label: zona.nombre },
    style: {
      width: groupWidth,
      height: config.groupHeight,
      zIndex: -1,
    },
    draggable: false,
    selectable: false,
  } as Node);

  // Dispositivos superiores
  const topWidth =
    otros.length > 0
      ? otros.length * config.espaciadoDispositivos -
        (config.espaciadoDispositivos - 40)
      : 0;
  const topStartX = xOffset + (groupWidth - topWidth) / 2;

  otros.forEach((nodo, idx) => {
    nodes.push({
      id: nodo.id,
      type: "device",
      position: {
        x: topStartX + idx * config.espaciadoDispositivos,
        y: config.topY,
      },
      data: {
        label: nodo.nombre,
        tipo: nodo.tipo,
        redes: nodo.redes,
        entidadId: nodo.entidadId,
      },
      draggable: false,
      selectable: false,
    } as Node);
  });

  // Routers y VPNs abajo
  const bottomWidth =
    routers.length > 0
      ? routers.length * config.espaciadoDispositivos -
        (config.espaciadoDispositivos - 40)
      : 0;
  const bottomStartX = xOffset + (groupWidth - bottomWidth) / 2;

  routers.forEach((nodo, idx) => {
    nodes.push({
      id: nodo.id,
      type: "device",
      position: {
        x: bottomStartX + idx * config.espaciadoDispositivos,
        y: config.bottomY,
      },
      data: {
        label: nodo.nombre,
        tipo: nodo.tipo,
        redes: nodo.redes,
        entidadId: nodo.entidadId,
      },
      draggable: false,
      selectable: false,
    } as Node);
  });

  // Nodo de Internet (debajo de la zona)
  nodes.push({
    id: `internet-${zona.id}`,
    type: "device",
    position: {
      x: xOffset + groupWidth / 2 - 20,
      y: 310,
    },
    data: { label: "Internet", tipo: "Internet", conectado: true },
    draggable: false,
    selectable: false,
  } as Node);

  return { nodes, groupWidth };
}

/**
 * Genera todos los nodos de la topología
 */
export function generarNodos(
  topologia: Topologia,
  config: Partial<LayoutConfig> = {}
): Node[] {
  const layoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };
  const allNodes: Node[] = [];
  let xOffset = 50;

  topologia.zonas.forEach((zona) => {
    const { nodes, groupWidth } = calcularPosicionesZona(
      zona,
      xOffset,
      layoutConfig
    );
    allNodes.push(...nodes);
    xOffset += groupWidth + layoutConfig.espaciadoZonas;
  });

  return allNodes;
}

/**
 * Agrupa nodos por red (nombre de red)
 */
function agruparPorRed(
  nodos: NodoTopologia[]
): Map<string, { nodos: NodoTopologia[]; color: string }> {
  const redesMap = new Map<string, { nodos: NodoTopologia[]; color: string }>();

  nodos.forEach((nodo) => {
    nodo.redes.forEach((red) => {
      if (!redesMap.has(red.nombre)) {
        redesMap.set(red.nombre, { nodos: [], color: red.color });
      }
      redesMap.get(red.nombre)!.nodos.push(nodo);
    });
  });

  return redesMap;
}

/**
 * Encuentra el router/gateway principal de una red específica
 */
function encontrarRouterDeRed(
  red: string,
  routers: NodoTopologia[]
): NodoTopologia | null {
  // Buscar el primer router/VPN que pertenezca a esta red
  return (
    routers.find((router) => router.redes.some((r) => r.nombre === red)) || null
  );
}

/**
 * Genera las aristas (edges) de conexión entre dispositivos usando topología estrella:
 * - Cada dispositivo se conecta al router de su red (no entre sí directamente)
 * - Mantiene la visualización limpia y legible
 */
export function generarAristas(topologia: Topologia): Edge[] {
  const edges: Edge[] = [];

  topologia.zonas.forEach((zona) => {
    const routers = zona.nodos.filter(
      (n) => n.tipo === TipoDispositivo.ROUTER || n.tipo === TipoDispositivo.VPN
    );
    const otros = zona.nodos.filter(
      (n) => n.tipo !== TipoDispositivo.ROUTER && n.tipo !== TipoDispositivo.VPN
    );

    // Agrupar todos los dispositivos por red
    const todosDispositivos = [...otros, ...routers];
    const redesMap = agruparPorRed(todosDispositivos);

    // Para cada red, conectar dispositivos al router principal de esa red
    redesMap.forEach((grupoRed, nombreRed) => {
      const routerPrincipal = encontrarRouterDeRed(nombreRed, routers);

      if (routerPrincipal) {
        // Conectar cada dispositivo (que no sea router) al router principal
        grupoRed.nodos.forEach((nodo) => {
          if (
            nodo.id !== routerPrincipal.id &&
            nodo.tipo !== TipoDispositivo.ROUTER &&
            nodo.tipo !== TipoDispositivo.VPN
          ) {
            edges.push({
              id: `${nodo.id}-${routerPrincipal.id}-${nombreRed}`,
              source: nodo.id,
              target: routerPrincipal.id,
              type: "step",
              style: {
                stroke: grupoRed.color,
                strokeWidth: 2,
              },
              data: { red: nombreRed },
            } as Edge);
          }
        });
      } else {
        // Si no hay router, conectar dispositivos en cadena (fallback)
        const nodosNoRouter = grupoRed.nodos.filter(
          (n) =>
            n.tipo !== TipoDispositivo.ROUTER && n.tipo !== TipoDispositivo.VPN
        );
        for (let i = 0; i < nodosNoRouter.length - 1; i++) {
          edges.push({
            id: `${nodosNoRouter[i].id}-${
              nodosNoRouter[i + 1].id
            }-${nombreRed}`,
            source: nodosNoRouter[i].id,
            target: nodosNoRouter[i + 1].id,
            type: "step",
            style: {
              stroke: grupoRed.color,
              strokeWidth: 2,
            },
            data: { red: nombreRed },
          } as Edge);
        }
      }
    });

    // Conectar routers a Internet (siempre con rojo)
    routers.forEach((router) => {
      edges.push({
        id: `${router.id}-internet-${zona.id}`,
        source: router.id,
        target: `internet-${zona.id}`,
        type: "step",
        style: { stroke: "#D4474A", strokeWidth: 2 },
        data: { red: "internet" },
      } as Edge);
    });
  });

  return edges;
}
