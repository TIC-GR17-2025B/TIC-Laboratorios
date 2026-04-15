import { NivelController } from "../../../../ecs/controllers/NivelController";
import type { EscenarioPreview } from "../../../../types/EscenarioTypes";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useSelectedLevel } from "../../../common/contexts/SelectedLevelContext";
import type { Escenario } from "../../../../types/EscenarioTypes";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import { AnimatePresence } from "framer-motion";

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

// Zigzag pattern: horizontal positions as % from left (50 = center)
// 50 → 60 → 70 → 60 → 50 → 40 → 30 → 40 → repeat
const ZIGZAG_PATTERN = [50, 60, 70, 60, 50, 40, 30, 40];
const NODE_SIZE = 64;
const TARGET_ARC = 100;
const zigzagOffset = (index: number): number =>
    (ZIGZAG_PATTERN[index % ZIGZAG_PATTERN.length] - 50) * 4;

function nodeMarginTop(index: number): number {
    if (index === 0) return 0;
    const dx = zigzagOffset(index) - zigzagOffset(index - 1);
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

export default function LevelSelectionMenuList() {
    const [escenarios, setEscenarios] = useState<EscenarioPreview[]>([]);
    const [progresos, setProgresos] = useState<Progreso[]>([]);
    const [openTooltip, setOpenTooltip] = useState<number | null>(null);
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

    // Close tooltip when clicking outside
    useEffect(() => {
        if (openTooltip === null) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(`.${styles.nodeRow}`)) setOpenTooltip(null);
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [openTooltip]);

    const isCompletado = (slug: string) => progresos.some(p => p.slug_escenario === slug && p.terminado);
    const hasIntentos = (slug: string) => progresos.some(p => p.slug_escenario === slug);

    // Group by categoria, sorted by defined order. Dentro de cada categoría, ordenar por id
    // para que el orden no dependa del orden alfabético de los exports del namespace.
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
        .map(([categoria, escenarios]) => ({
            categoria,
            escenarios: [...escenarios].sort((a, b) => a.id - b.id),
        }));

    // Flat ordered list of all scenario slugs to determine unlock state
    const allSlugs = groups.flatMap(g => g.escenarios.map(e => e.slug));

    const isUnlocked = (flatIndex: number): boolean => {
        if (flatIndex === 0) return true;
        return allSlugs.slice(0, flatIndex).every(slug => isCompletado(slug));
    };

    // Nivel sugerido: primer nodo desbloqueado, no completado y sin intentos previos.
    // Es el candidato natural para "Empezar".
    const suggestedIdx = allSlugs.findIndex(
        (slug, i) => isUnlocked(i) && !isCompletado(slug) && !hasIntentos(slug)
    );

    let globalIndex = 0;

    return (
        <div className={styles.path} ref={containerRef}>
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
                            const offset = zigzagOffset(globalIndex);
                            const idx = globalIndex++;
                            const unlocked = isUnlocked(idx);

                            const nodeState = completado ? 'done' : attempted ? 'active' : 'available';

                            const mt = nodeMarginTop(idx);

                            const isOpen = openTooltip === esc.id;
                            const dimmed = !(unlocked || attempted || completado);
                            const isSuggested = idx === suggestedIdx;

                            return (
                                <motion.div
                                    key={esc.id}
                                    className={styles.nodeRow}
                                    style={{ marginTop: mt, zIndex: isOpen || isSuggested ? 10 : 1 }}
                                    initial={{ y: 20, x: offset }}
                                    animate={{ y: 0, x: offset }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                >
                                    {isSuggested && (
                                        <motion.div
                                            className={styles.suggestedLabel}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: openTooltip !== null ? 0 : 1, y: 0 }}
                                            transition={{
                                                opacity: { duration: 0.2 },
                                                y: { duration: 0.25, delay: idx * 0.05 + 0.15 },
                                            }}
                                        >
                                            Empezar
                                            <div className={styles.suggestedArrow} />
                                        </motion.div>
                                    )}
                                    <motion.div
                                        data-node
                                        className={`${styles.node} ${styles[nodeState]}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: (dimmed && !isOpen) ? 0.4 : 1 }}
                                        transition={{ duration: 0.25, delay: idx * 0.05 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenTooltip(isOpen ? null : esc.id);
                                        }}
                                    >
                                        {completado ? (
                                            <Check size={24} strokeWidth={3} />
                                        ) : (
                                            <Play size={20} fill="currentColor" />
                                        )}
                                    </motion.div>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                className={styles.tooltip}
                                                style={{ transform: `translateX(calc(-50% - ${offset}px))` }}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <div className={styles.tooltipArrow} />
                                                <span className={styles.tooltipTitle}>{esc.titulo}</span>
                                                <p className={styles.tooltipDesc}>{esc.descripcion}</p>
                                                <button
                                                    className={`${styles.tooltipBtn} ${styles[`tooltipBtn--${nodeState}`]}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectLevel(esc);
                                                    }}
                                                >
                                                    {completado ? 'Repetir' : attempted ? 'Continuar' : 'Empezar'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
