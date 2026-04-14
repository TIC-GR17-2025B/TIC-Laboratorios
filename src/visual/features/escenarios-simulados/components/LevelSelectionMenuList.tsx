import { NivelController } from "../../../../ecs/controllers/NivelController";
import type { EscenarioPreview } from "../../../../types/EscenarioTypes";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
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

const SINE_AMPLITUDE = 80;
const SINE_STEP = (2 * Math.PI) / 5; // ~5 nodes per full cycle
const NODE_SIZE = 56;
const TARGET_ARC = 82; // desired arc length between node centers
const sineOffset = (index: number) => Math.sin(index * SINE_STEP) * SINE_AMPLITUDE;

/** Compute marginTop for a node so arc distance from previous node is constant */
function nodeMarginTop(index: number): number {
    if (index === 0) return 0;
    const dx = sineOffset(index) - sineOffset(index - 1);
    const dy = Math.sqrt(Math.max(0, TARGET_ARC * TARGET_ARC - dx * dx));
    return Math.max(4, dy - NODE_SIZE);
}

// Category display order (Cap. 1 at top, Cap. 6 at bottom)
const CATEGORY_ORDER = [
    'Cap. 1 — Introducción',
    'Cap. 2 — Criptografía',
    'Cap. 3 — Autenticación',
    'Cap. 4 — Seguridad de Redes',
    'Cap. 5 — Administración de Riesgos',
    'Cap. 6 — Tendencias Actuales',
];

/** Build a smooth SVG path through node centers using S-curve beziers */
function buildSmoothPath(centers: { x: number; y: number }[]): string {
    if (centers.length < 2) return '';

    let d = `M ${centers[0].x} ${centers[0].y}`;

    for (let i = 0; i < centers.length - 1; i++) {
        const curr = centers[i];
        const next = centers[i + 1];
        const midY = (curr.y + next.y) / 2;

        // S-curve: hold current x until midpoint, then transition to next x
        d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
    }

    return d;
}

export default function LevelSelectionMenuList() {
    const [escenarios, setEscenarios] = useState<EscenarioPreview[]>([]);
    const [progresos, setProgresos] = useState<Progreso[]>([]);
    const [curvePath, setCurvePath] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
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

    // Measure actual node positions after render and build SVG path
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Small delay to let framer-motion animations settle into final positions
        const timer = setTimeout(() => {
            const nodeEls = container.querySelectorAll<HTMLElement>('[data-node]');
            if (nodeEls.length < 2) return;

            const containerRect = container.getBoundingClientRect();
            const centers = Array.from(nodeEls).map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    x: rect.left + rect.width / 2 - containerRect.left,
                    y: rect.top + rect.height / 2 - containerRect.top,
                };
            });

            setCurvePath(buildSmoothPath(centers));
        }, 350);

        return () => clearTimeout(timer);
    }, [escenarios, progresos]);

    let globalIndex = 0;

    return (
        <div className={styles.path} ref={containerRef}>
            {/* Dashed curve SVG behind everything */}
            {curvePath && (
                <svg
                    className={styles.curveSvg}
                    width="100%"
                    height="100%"
                    fill="none"
                >
                    <path
                        d={curvePath}
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
                            const offset = sineOffset(globalIndex);
                            const isLeft = offset < 0;
                            const idx = globalIndex++;

                            const nodeState = completado ? 'done' : attempted ? 'active' : 'available';

                            const mt = nodeMarginTop(idx);

                            return (
                                <motion.div
                                    key={esc.id}
                                    className={styles.nodeRow}
                                    style={{ marginTop: mt }}
                                    initial={{ opacity: 0, y: 20, x: offset }}
                                    animate={{ opacity: 1, y: 0, x: offset }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                >
                                    <div
                                        data-node
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
