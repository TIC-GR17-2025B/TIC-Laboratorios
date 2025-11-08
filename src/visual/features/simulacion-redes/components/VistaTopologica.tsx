import { useNodesState, useEdgesState, ReactFlow } from "@xyflow/react";
import { TipoDispositivo } from "../../../../types/DeviceEnums";
import "@xyflow/react/dist/style.css";
import { Handle, Position } from '@xyflow/react';
import styles from '../styles/VistaTopologica.module.css';
import { useTopologiaLayout } from '../hooks/useTopologiaLayout';
import type { Topologia } from '../utils/topologiaLayout';
import getIconoNodo from "../utils/getIconoNodo";
import ConexionIcon from "../../../common/icons/ConexionIcon";
import { useState } from "react";
import RedChip from "./RedChip";
import CheckableItem from "../../../common/components/CheckableItem";

function DeviceNode({ data }: any) {
    return (
        <div className={styles.deviceNodeContainer}>
            <Handle
                type="target"
                position={data.tipo === TipoDispositivo.WORKSTATION ? Position.Bottom : Position.Top}
                className={styles.handleTransparent}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className={styles.handleTransparent}
            />
            <div className={styles.deviceNode}>
                {getIconoNodo(data.tipo)}
                {/* {data.conectado && (
                <div className={styles.connectedDot} />
                )} */}
            </div>
            <div className={styles.deviceLabel}>
                {data.label}
            </div>
        </div>
    );
}

// zonas
function GroupNode({ data }: any) {
    return (
        <div className={styles.groupNode}>
            <div className={styles.groupLabel}>
                {data.label}
            </div>
        </div>
    );
}

const nodeTypes = {
    device: DeviceNode,
    group: GroupNode
};

// datos de ejemplo, esto debo reemplazarlo luego por el contexto
const TOPOLOGIA_EJEMPLO: Topologia = {
    zonas: [
        {
            id: 'hq',
            nombre: 'Boilplate Corporate HQ',
            nodos: [
                { id: 'hq-server', nombre: 'Server', tipo: TipoDispositivo.SERVER, redes: [{ nombre: "lan-hq", color: "#E5E56C" }, { nombre: "lan-hq2", color: "#3C91E6" }] },
                { id: 'hq-pc1', nombre: 'PC de Harry', tipo: TipoDispositivo.WORKSTATION, redes: [{ nombre: "lan-hq", color: "#E5E56C" }, { nombre: "lan-hq2", color: "#3C91E6" }] },
                { id: 'hq-router', nombre: 'Router 1', tipo: TipoDispositivo.ROUTER, redes: [{ nombre: "lan-hq", color: "#E5E56C" }] },
                { id: 'hq-vpn1', nombre: 'VPN 1', tipo: TipoDispositivo.VPN, redes: [{ nombre: "lan-hq", color: "#E5E56C" }] }
            ]
        },
        {
            id: 'west',
            nombre: 'Boilplate West',
            nodos: [
                { id: 'west-pc1', nombre: 'PC de Lisa', tipo: TipoDispositivo.WORKSTATION, redes: [{ nombre: "lan1", color: "#f87ead" }] },
                { id: 'west-router', nombre: 'Router 2', tipo: TipoDispositivo.ROUTER, redes: [{ nombre: "lan1", color: "#f87ead" }] }
            ]
        },
        {
            id: 'www',
            nombre: 'World Wide Web',
            nodos: [
                { id: 'www-router', nombre: 'WWW Router', tipo: TipoDispositivo.ROUTER, redes: [{ nombre: "lan1", color: "#F2973C" }] },
                { id: 'www-server', nombre: 'WWW Server', tipo: TipoDispositivo.SERVER, redes: [{ nombre: "lan1", color: "#F2973C" }] }
            ]
        },
        {
            id: 'east',
            nombre: 'Boilplate East Subsidiary',
            nodos: [
                { id: 'east-pc1', nombre: 'PC de Isaac', tipo: TipoDispositivo.WORKSTATION, redes: [{ nombre: "lan-este2", color: "#60d8d2" }] },
                { id: 'east-pc2', nombre: 'PC de Eliath', tipo: TipoDispositivo.WORKSTATION, redes: [{ nombre: "lan-este", color: "#B847D4" }] },
                { id: 'east-pc3', nombre: 'PC de Jacob', tipo: TipoDispositivo.WORKSTATION, redes: [{ nombre: "lan-este", color: "#B847D4" }, { nombre: "lan-este2", color: "#60d8d2" }] },
                { id: 'east-router', nombre: 'Router Este', tipo: TipoDispositivo.ROUTER, redes: [{ nombre: "lan-este", color: "#B847D4" }] },
                { id: 'east-router2', nombre: 'Router Este 2', tipo: TipoDispositivo.ROUTER, redes: [{ nombre: "lan-este", color: "#B847D4" }] },
                { id: 'east-vpn', nombre: 'VPN Este', tipo: TipoDispositivo.VPN, redes: [{ nombre: "lan-este", color: "#B847D4" }] }
            ]
        }
    ]
};

interface VistaTopologicaProps {
    topologia?: Topologia;
}

/**
 * Componente para visualizar topología de red.
 */
export default function VistaTopologicaFlow({ topologia = TOPOLOGIA_EJEMPLO }: VistaTopologicaProps) {
    // Hook que encapsula toda la lógica de generación de nodos/edges
    const { nodes: initialNodes, edges: initialEdges } = useTopologiaLayout(topologia);

    const [nodes] = useNodesState(initialNodes);
    const [edges] = useEdgesState(initialEdges);

    const [estaConexionesAbierto, setEstaConexionesAbierto] = useState(false);

    // redes de prueba, esto se obtendria desde las redes de la zona
    const redesDisponibles = [
        { nombre: "lan-hq", color: "#E5E56C" },
        { nombre: "lan-este", color: "#B847D4" },
        { nombre: "lan-este2", color: "#60d8d2" },
        { nombre: "lan-oeste", color: "#F2973C" },
        { nombre: "lan-oeste2", color: "#78ce4d" },
        { nombre: "Internet", color: "#D4474A" },
    ];

    const handleNodeClick = (_event: React.MouseEvent, node: any) => {
        console.log('Nodo clickeado:', node.data);
    };

    return (
        <div className={styles.container}>
            <div className={styles.conexionesContainer}>
                <button
                    className={styles.botonConexiones}
                    onClick={() => setEstaConexionesAbierto(!estaConexionesAbierto)}
                >
                    <ConexionIcon />
                </button>
                {estaConexionesAbierto && <div className={styles.conexionesDisponibles}>
                    {redesDisponibles.map((red) => (
                        <div className={styles.redChipContainer} onClick={() => { }}>
                            <RedChip key={red.nombre} nombre={red.nombre} color={red.color} />
                        </div>
                    ))}
                </div>}
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={handleNodeClick}
                fitView
                fitViewOptions={{ padding: 0.1, maxZoom: 1 }}
                minZoom={0.3}
                maxZoom={2.2}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                preventScrolling={true}
                proOptions={{ hideAttribution: true }}
            >
            </ReactFlow>
        </div>
    );
}