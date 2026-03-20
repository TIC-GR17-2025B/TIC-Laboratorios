import { NivelController } from "../../../../ecs/controllers/NivelController";
import type { EscenarioPreview } from "../../../../types/EscenarioTypes";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useSelectedLevel } from "../../../common/contexts/SelectedLevelContext";
import type { Escenario } from "../../../../types/EscenarioTypes";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";

interface Progreso {
    id_progreso: number;
    id_estudiante: number;
    slug_escenario: string;
    nombre_escenario: string;
    terminado: boolean;
    tiempo: number | null;
}

interface CategoriaGroup {
    categoria: string;
    escenarios: EscenarioPreview[];
}

// Zigzag: consistent left-right alternation
const ZIGZAG = [-90, 90] as const;

// Layout constants (must match CSS)
const NODE_SIZE = 56;
const NODE_ROW_PADDING = 24; // padding top+bottom per nodeRow
const NODE_ROW_HEIGHT = NODE_SIZE + NODE_ROW_PADDING * 2; // 104px
const NODES_PADDING_TOP = 28; // .nodes padding-top
const BANNER_HEIGHT = 34; // banner approximate height (padding 4+4 + font ~26)


// Category display order (reversed: Cap. 6 at top, Cap. 1 at bottom)
const CATEGORY_ORDER = [
    'Cap. 6 — Tendencias Actuales',
    'Cap. 5 — Administración de Riesgos',
    'Cap. 4 — Seguridad de Redes',
    'Cap. 3 — Autenticación',
    'Cap. 2 — Criptografía',
    'Cap. 1 — Introducción',
];

/** Build an SVG path string with smooth quadratic curves through all node centers */
function buildCurvePath(
    groups: CategoriaGroup[],
): { path: string; width: number; height: number } {
    // Collect all node center positions (x, y) relative to the path container
    const centers: { x: number; y: number }[] = [];
    const pathWidth = 480;
    const cx = pathWidth / 2; // center x

    let y = 0;
    let globalIdx = 0;

    for (const group of groups) {
        // Banner
        y += BANNER_HEIGHT;
        // Nodes container padding top
        y += NODES_PADDING_TOP;

        for (let i = 0; i < group.escenarios.length; i++) {
            const offset = ZIGZAG[globalIdx % ZIGZAG.length];
            // Center of this node
            const nodeCenterY = y + NODE_ROW_PADDING + NODE_SIZE / 2;
            centers.push({ x: cx + offset, y: nodeCenterY });
            y += NODE_ROW_HEIGHT;
            globalIdx++;
        }

        // Nodes container padding bottom
        y += NODES_PADDING_TOP; // symmetric
    }

    if (centers.length < 2) return { path: '', width: pathWidth, height: y };

    // Build smooth path using quadratic beziers through midpoints
    let d = `M ${centers[0].x} ${centers[0].y}`;

    for (let i = 0; i < centers.length - 1; i++) {
        const curr = centers[i];
        const next = centers[i + 1];
        // Control point: midpoint x uses current node's x for a nice curve
        const midY = (curr.y + next.y) / 2;
        d += ` Q ${curr.x} ${midY}, ${next.x} ${next.y}`;
    }

    return { path: d, width: pathWidth, height: y };
}

export default function LevelSelectionMenuList() {
    const [escenarios, setEscenarios] = useState<EscenarioPreview[]>([]);
    const [progresos, setProgresos] = useState<Progreso[]>([]);
    const navigate = useNavigate();
    const { setSelectedEscenario } = useSelectedLevel();
    const nivelController = new NivelController();

    useEffect(() => {
        const escenariosData = nivelController.getEscenarios();
        if (escenariosData) setEscenarios(escenariosData);

        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const idEstudiante = user.id_estudiante;
            if (idEstudiante) {
                fetch(`${API_BASE_URL}/progreso/estudiante/${idEstudiante}`)
                    .then(res => res.json())
                    .then(result => {
                        if (result.success && result.data) setProgresos(result.data);
                    })
                    .catch(err => console.error('Error al obtener progresos:', err));
            }
        }
    }, []);

    const handleSelectLevel = (escenario: EscenarioPreview) => {
        const escenarioCompleto = nivelController.cargarEscenario(escenario.id) as Escenario;
        if (escenarioCompleto) {
            localStorage.setItem("slug_escenario_actual", escenario.slug);
            setSelectedEscenario(escenarioCompleto);
            navigate('/');
        }
    };

    const isCompletado = (slug: string) => progresos.some(p => p.slug_escenario === slug && p.terminado);
    const hasIntentos = (slug: string) => progresos.some(p => p.slug_escenario === slug);

    // Group by categoria, sorted by defined order
    const groupMap = new Map<string, EscenarioPreview[]>();
    for (const esc of escenarios) {
        const cat = esc.categoria || 'General';
        if (!groupMap.has(cat)) groupMap.set(cat, []);
        groupMap.get(cat)!.push(esc);
    }
    const groups: CategoriaGroup[] = [...groupMap.entries()]
        .sort(([a], [b]) => {
            const ia = CATEGORY_ORDER.indexOf(a);
            const ib = CATEGORY_ORDER.indexOf(b);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        })
        .map(([categoria, escenarios]) => ({ categoria, escenarios }));

    const curve = useMemo(() => buildCurvePath(groups), [groups]);

    let globalIndex = 0;

    return (
        <div className={styles.path}>
            {/* Dashed curve SVG behind everything */}
            {curve.path && (
                <svg
                    className={styles.curveSvg}
                    width={curve.width}
                    height={curve.height}
                    viewBox={`0 0 ${curve.width} ${curve.height}`}
                    fill="none"
                >
                    <path
                        d={curve.path}
                        stroke="var(--border-primary)"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                        fill="none"
                    />
                </svg>
            )}

            {groups.map((group, gi) => (
                <div key={group.categoria} className={styles.section}>
                    <motion.div
                        className={styles.banner}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: gi * 0.06 }}
                    >
                        <span className={styles.bannerTitle}>{group.categoria}</span>
                    </motion.div>

                    <div className={styles.nodes}>
                        {group.escenarios.map((esc) => {
                            const completado = isCompletado(esc.slug);
                            const attempted = hasIntentos(esc.slug);
                            const offset = ZIGZAG[globalIndex % ZIGZAG.length];
                            const isLeft = offset < 0;
                            const idx = globalIndex++;

                            const nodeState = completado ? 'done' : attempted ? 'active' : 'available';

                            return (
                                <motion.div
                                    key={esc.id}
                                    className={styles.nodeRow}
                                    initial={{ opacity: 0, y: 20, x: offset }}
                                    animate={{ opacity: 1, y: 0, x: offset }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                >
                                    <div
                                        className={`${styles.node} ${styles[nodeState]}`}
                                        onClick={() => handleSelectLevel(esc)}
                                    >
                                        {completado ? (
                                            <Check size={20} strokeWidth={3} />
                                        ) : (
                                            <Play size={16} fill="currentColor" />
                                        )}
                                    </div>

                                    <span className={`${styles.nodeLabel} ${isLeft ? styles.nodeLabelRight : styles.nodeLabelLeft}`}>
                                        {esc.titulo}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
