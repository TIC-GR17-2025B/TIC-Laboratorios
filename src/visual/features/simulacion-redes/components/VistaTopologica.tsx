import { useNodesState, useEdgesState, ReactFlow } from "@xyflow/react";
import { TipoDispositivo } from "../../../../types/DeviceEnums";
import "@xyflow/react/dist/style.css";
import { Handle, Position } from '@xyflow/react';
import styles from '../styles/VistaTopologica.module.css';
import { useTopologiaLayout, useTopologiaData, useDispositivoRedes } from '../hooks';
import getIconoNodo from "../utils/getIconoNodo";
import { useState, useEffect } from "react";
import RedChip from "./RedChip";

function DeviceNode({ data }: any) {
    const isWorkstation = data.tipo === TipoDispositivo.WORKSTATION;
    const isRouter = data.tipo === TipoDispositivo.ROUTER || data.tipo === TipoDispositivo.VPN;
    const isInternet = data.tipo === "Internet";
    const redes = data.redes || [];

    return (
        <div className={styles.deviceNodeContainer}>
            {/* Handlers para routers */}
            {isRouter && (
                <>
                    <Handle
                        id="top"
                        type="source"
                        position={Position.Top}
                        className={styles.handleTransparent}
                    />
                    <Handle
                        id="top-target"
                        type="target"
                        position={Position.Top}
                        className={styles.handleTransparent}
                    />
                    <Handle
                        id="bottom"
                        type="source"
                        position={Position.Bottom}
                        className={styles.handleTransparent}
                    />
                </>
            )}

            {/* Handlers para dispositivos normales */}
            {!isRouter && !isInternet && (
                <>
                    <Handle
                        type="target"
                        position={isWorkstation ? Position.Bottom : Position.Top}
                        className={styles.handleTransparent}
                    />
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        className={styles.handleTransparent}
                    />
                </>
            )}

            {/* Handler para Internet */}
            {isInternet && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className={styles.handleTransparent}
                />
            )}

            <div className={styles.deviceNode}>
                {getIconoNodo(data.tipo)}
                {!isInternet && redes.length > 0 && (
                    <div className={styles.networkBadges}>
                        {redes.map((red: any, index: number) => (
                            <div
                                key={`badge-${red.nombre}-${index}`}
                                className={styles.networkBadge}
                                style={{ backgroundColor: red.color }}
                                title={red.nombre}
                            />
                        ))}
                    </div>
                )}
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
    const { topologia, ecsManager } = useTopologiaData();
    const { nodes: initialNodes, edges: initialEdges } = useTopologiaLayout(topologia);

    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges] = useEdgesState(initialEdges);

    const [entidadSeleccionada, setEntidadSeleccionada] = useState<number | null>(null);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const handleNodeClick = (_event: React.MouseEvent, node: any) => {
        if (node.data.entidadId !== undefined) {
            setEntidadSeleccionada(node.data.entidadId);
        } else {
            setEntidadSeleccionada(null);
        }
    };

    const handleCerrarPanel = () => {
        setEntidadSeleccionada(null);
    };

    return (
        <div className={styles.container}>
            <PanelLateralTopologia entidadId={entidadSeleccionada} ecsManager={ecsManager} onCerrar={handleCerrarPanel} />
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
    onCerrar: () => void;
}

function PanelLateralTopologia({ entidadId, ecsManager, onCerrar }: PanelLateralTopologiaProps) {
    const { dispositivo, redesDisponibles, toggleRed } = useDispositivoRedes(entidadId, ecsManager);
    const [isOpen, setIsOpen] = useState(false);
    const [lastDispositivo, setLastDispositivo] = useState(dispositivo);
    const [lastRedesDisponibles, setLastRedesDisponibles] = useState(redesDisponibles);

    useEffect(() => {
        const shouldBeOpen = entidadId !== null && dispositivo !== null;
        setIsOpen(shouldBeOpen);

        if (dispositivo) {
            setLastDispositivo(dispositivo);
            setLastRedesDisponibles(redesDisponibles);
        }
    }, [entidadId, dispositivo, redesDisponibles]);

    const displayDispositivo = dispositivo || lastDispositivo;
    const displayRedes = dispositivo ? redesDisponibles : lastRedesDisponibles;

    return (
        <aside
            className={`${styles.panelLateral} ${!isOpen ? styles.hidden : ''}`}
            aria-label="Panel de dispositivo"
            aria-hidden={!isOpen}
        >
            {displayDispositivo && (
                <>
                    <button
                        className={styles.botonCerrarPanel}
                        onClick={onCerrar}
                        aria-label="Cerrar panel"
                        type="button"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.8334 5.34175L14.6584 4.16675L10.0001 8.82508L5.34175 4.16675L4.16675 5.34175L8.82508 10.0001L4.16675 14.6584L5.34175 15.8334L10.0001 11.1751L14.6584 15.8334L15.8334 14.6584L11.1751 10.0001L15.8334 5.34175Z" fill="currentColor" />
                        </svg>
                    </button>
                    <div className={styles.dispositivoInfoHeader}>
                        <h3>{displayDispositivo.nombre}</h3>
                    </div>
                    <p className={styles.tipoDispo}>{displayDispositivo.tipo}</p>
                    <p>Conectar redes</p>
                    <div className={styles.redChipContainer}>
                        {displayRedes.map((red) => (
                            <div
                                key={red.nombre}
                                className={`${styles.redChipWrapper} ${red.estaActiva ? styles.selected : ''}`}
                                onClick={() => isOpen && toggleRed(red.entidadId)}
                            >
                                <RedChip nombre={red.nombre} color={red.color} activado={red.estaActiva} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
}