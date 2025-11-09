import { useNodesState, useEdgesState, ReactFlow } from "@xyflow/react";
import { TipoDispositivo } from "../../../../types/DeviceEnums";
import "@xyflow/react/dist/style.css";
import { Handle, Position } from '@xyflow/react';
import styles from '../styles/VistaTopologica.module.css';
import { useTopologiaLayout, useTopologiaData, useDispositivoRedes } from '../hooks';
import getIconoNodo from "../utils/getIconoNodo";
import ConexionIcon from "../../../common/icons/ConexionIcon";
import { useState, useEffect } from "react";
import RedChip from "./RedChip";

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

export default function VistaTopologicaFlow() {
    const { topologia, redesDisponibles, ecsManager } = useTopologiaData();
    const { nodes: initialNodes, edges: initialEdges } = useTopologiaLayout(topologia);

    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges] = useEdgesState(initialEdges);

    const [estaPanelAbierto, setEstaPanelAbierto] = useState(false);
    const [entidadSeleccionada, setEntidadSeleccionada] = useState<number | null>(null);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const handleNodeClick = (_event: React.MouseEvent, node: any) => {
        if (node.data.entidadId !== undefined) {
            setEntidadSeleccionada(node.data.entidadId);
            const containerCompleto = ecsManager.getComponentes(node.data.entidadId);

            console.log('Nodo clickeado:', {
                datosBasicos: node.data,
                containerCompleto
            });
        } else {
            setEntidadSeleccionada(null);
            console.log('Nodo clickeado (sin entidad ECS):', node.data);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.conexionesContainer}>
                <button
                    className={styles.botonConexiones}
                    onClick={() => setEstaPanelAbierto(!estaPanelAbierto)}
                >
                    <ConexionIcon />
                </button>
                {estaPanelAbierto && <div className={styles.conexionesDisponibles}>
                    {redesDisponibles.map((red) => (
                        <div className={styles.redChipContainer} onClick={() => { }}>
                            <RedChip key={red.nombre} nombre={red.nombre} color={red.color} />
                        </div>
                    ))}
                </div>}
            </div>
            <PanelLateralTopologia entidadId={entidadSeleccionada} ecsManager={ecsManager} />
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

interface PanelLateralTopologiaProps {
    entidadId: number | null;
    ecsManager: any;
}

function PanelLateralTopologia({ entidadId, ecsManager }: PanelLateralTopologiaProps) {
    const { dispositivo, redesDisponibles, toggleRed } = useDispositivoRedes(entidadId, ecsManager);

    if (!entidadId || !dispositivo) {
        return (
            <div className={styles.panelLateral}>
                <div className={styles.dispositivoInfoHeader}>
                    <h3>Selecciona un dispositivo</h3>
                </div>
                <p className={styles.tipoDispo}>Haz clic en un nodo para ver su información</p>
            </div>
        );
    }

    return (
        <div className={styles.panelLateral}>
            <div className={styles.dispositivoInfoHeader}>
                <h3>{dispositivo.nombre}</h3>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.6667 5.60016L4.73337 11.5335C4.61114 11.6557 4.45559 11.7168 4.2667 11.7168C4.07781 11.7168 3.92225 11.6557 3.80003 11.5335C3.67781 11.4113 3.6167 11.2557 3.6167 11.0668C3.6167 10.8779 3.67781 10.7224 3.80003 10.6002L9.73337 4.66683H4.6667C4.47781 4.66683 4.31959 4.60283 4.19203 4.47483C4.06448 4.34683 4.00048 4.18861 4.00003 4.00016C3.99959 3.81172 4.06359 3.6535 4.19203 3.5255C4.32048 3.3975 4.4787 3.3335 4.6667 3.3335H11.3334C11.5223 3.3335 11.6807 3.3975 11.8087 3.5255C11.9367 3.6535 12.0005 3.81172 12 4.00016V10.6668C12 10.8557 11.936 11.0142 11.808 11.1422C11.68 11.2702 11.5218 11.3339 11.3334 11.3335C11.1449 11.3331 10.9867 11.2691 10.8587 11.1415C10.7307 11.0139 10.6667 10.8557 10.6667 10.6668V5.60016Z" fill="currentColor" />
                </svg>
            </div>
            <p className={styles.tipoDispo}>{dispositivo.tipo}</p>
            <div className={styles.redChipContainer}>
                {redesDisponibles.map((red) => (
                    <div
                        key={red.nombre}
                        className={`${styles.redChipWrapper} ${red.estaActiva ? styles.selected : ''}`}
                        onClick={() => toggleRed(red.entidadId)}
                    >
                        <RedChip nombre={red.nombre} color={red.color} activado={red.estaActiva} />
                    </div>
                ))}
            </div>
        </div>
    );
}