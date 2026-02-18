import { NivelController } from "../../../../ecs/controllers/NivelController";
import type { EscenarioPreview } from "../../../../types/EscenarioTypes";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useSelectedLevel } from "../../../common/contexts/SelectedLevelContext";
import type { Escenario } from "../../../../types/EscenarioTypes";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { motion, animate } from "framer-motion";

interface Progreso {
    id_progreso: number;
    id_estudiante: number;
    id_escenario: number;
    nombre_escenario: string;
    terminado: boolean;
    tiempo: number | null;
}

export default function LevelSelectionMenuList() {
    const [escenarios, setEscenarios] = useState<EscenarioPreview[]>([]);
    const [progresos, setProgresos] = useState<Progreso[]>([]);
    const navigate = useNavigate();
    const { setSelectedEscenario } = useSelectedLevel();
    const nivelController = new NivelController();

    useEffect(() => {
        const escenariosData = nivelController.getEscenarios();
        if (escenariosData) {
            setEscenarios(escenariosData);
        }

        // Obtener progreso del estudiante
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const idEstudiante = user.id_estudiante;
            if (idEstudiante) {
                fetch(`${API_BASE_URL}/progreso/estudiante/${idEstudiante}`)
                    .then(res => res.json())
                    .then(result => {
                        if (result.success && result.data) {
                            setProgresos(result.data);
                        }
                    })
                    .catch(err => console.error('Error al obtener progresos:', err));
            }
        }
    }, []);

    const handleSelectLevel = (escenarioId: number) => {
        const escenarioCompleto = nivelController.cargarEscenario(escenarioId) as Escenario;
        if (escenarioCompleto) {
            localStorage.setItem("id_escenario_actual", escenarioId.toString());
            setSelectedEscenario(escenarioCompleto);
            navigate('/');
        }
    };

    const isEscenarioCompletado = (escenarioTitulo: string): boolean => {
        // Buscar progresos que coincidan con el escenario
        const progresosEscenario = progresos.filter(p => {
            return p.nombre_escenario === escenarioTitulo ||
                p.nombre_escenario.toLowerCase() === escenarioTitulo.toLowerCase() ||
                p.nombre_escenario.toLowerCase().includes(escenarioTitulo.toLowerCase()) ||
                escenarioTitulo.toLowerCase().includes(p.nombre_escenario.toLowerCase());
        });

        // Está completado si hay al menos un progreso con terminado === true
        return progresosEscenario.some(p => p.terminado);
    };

    const scrollRef = useRef<HTMLDivElement>(null);
    const targetScrollRef = useRef(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = useCallback((scrollPos?: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const pos = scrollPos ?? el.scrollLeft;
        const maxScroll = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(pos > 1);
        setCanScrollRight(pos < maxScroll - 1);
    }, []);

    useEffect(() => {
        updateScrollButtons();
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => {
            targetScrollRef.current = el.scrollLeft;
            updateScrollButtons();
        };
        const onResize = () => updateScrollButtons();
        el.addEventListener("scrollend", onScroll);
        window.addEventListener("resize", onResize);
        return () => {
            el.removeEventListener("scrollend", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, [escenarios, updateScrollButtons]);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.querySelector(`.${styles.menuItem}`)?.clientWidth ?? 300;
        const gap = 16;
        const delta = direction === "left" ? -(cardWidth + gap) : cardWidth + gap;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const to = Math.max(0, Math.min(targetScrollRef.current + delta, maxScroll));
        targetScrollRef.current = to;
        updateScrollButtons(to);
        animate(el.scrollLeft, to, {
            duration: 0.25,
            ease: [0.25, 0.1, 0.25, 1],
            onUpdate: (v) => { el.scrollLeft = v; },
        });
    };

    return <div className={styles.carouselWrapper}>
        <div className={styles.menuList} ref={scrollRef}>
            {escenarios.map((escenario, index) => {
                const completado = isEscenarioCompletado(escenario.titulo);

                return (
                    <LevelSelectionMenuItem
                        key={escenario.id}
                        index={index}
                        escenario={escenario}
                        imagen={escenario.imagenPreview || "https://i.pinimg.com/1200x/53/14/cd/5314cd391bb3df2875d5f9b0d8818586.jpg"}
                        completado={completado}
                        onSelect={() => handleSelectLevel(escenario.id)}
                    />
                );
            })}
        </div>
        <div className={styles.carouselControls}>
            <motion.button
                className={styles.chevronBtn}
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </motion.button>
            <motion.button
                className={styles.chevronBtn}
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 6 15 12 9 18" />
                </svg>
            </motion.button>
        </div>
    </div>
}

interface LevelSelectionMenuItemProps {
    escenario: EscenarioPreview;
    imagen: string;
    completado: boolean;
    index: number;
    onSelect: () => void;
}

function LevelSelectionMenuItem({ escenario, imagen, completado, index, onSelect }: LevelSelectionMenuItemProps) {
    return <motion.div
        className={styles.menuItem}
        onClick={onSelect}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
        whileHover={{ y: -4 }}
    >
        <img src={imagen} className={styles.backgroundImage} alt={escenario.titulo} />
        <div className={styles.gradient}></div>
        <div className={styles.content}>
            <h2>{escenario.titulo}</h2>
            <p className={styles.description}>{escenario.descripcion}</p>
            <div className={styles.statusBadge}>
                {completado ? (
                    <span className={styles.locked}>Completado</span>
                ) : (
                    <span className={styles.unlocked}>Pendiente</span>
                )}
            </div>
        </div>
    </motion.div>
}
