import { useState, useRef, useEffect } from "react";
import styles from "../styles/ModalSocialSearcher.module.css";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import type { InfoPersonaEncontrada } from "../../../../shared/types/EscenarioTypes";

function ChevronDown() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ModalSocialSearcher() {
    const { escenarioController, zonasDisponibles } = useECSSceneContext();
    const [zonaSeleccionada, setZonaSeleccionada] = useState<number | "">("");
    const [resultados, setResultados] = useState<InfoPersonaEncontrada[]>([]);
    const [buscado, setBuscado] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleBuscar = () => {
        if (zonaSeleccionada === "") return;

        const entidadZona = escenarioController.builder.obtenerEntidadZonaPorId(zonaSeleccionada);
        if (entidadZona === undefined) return;

        const personas = escenarioController.getInfoPersonasPorEmpresa(entidadZona);
        setResultados(personas ?? []);
        setBuscado(true);

        escenarioController.registrarEjecucionAplicacion("Company Social-Searcher");
    };

    const handleSelectZona = (id: number) => {
        setZonaSeleccionada(id);
        setBuscado(false);
        setDropdownOpen(false);
    };

    const selectedLabel = zonaSeleccionada === ""
        ? "Seleccionar zona"
        : zonasDisponibles.find(z => z.id === zonaSeleccionada)?.nombre ?? "Seleccionar zona";

    const getInitials = (nombre: string) => {
        const parts = nombre.split(" ");
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : nombre.slice(0, 2).toUpperCase();
    };

    const getBadgeClass = (nivel: string) => {
        switch (nivel) {
            case "Alta": return styles.badgeAlta;
            case "Media": return styles.badgeMedia;
            case "Baja": return styles.badgeBaja;
            default: return styles.badgeMedia;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.comboBox} ref={dropdownRef}>
                    <button
                        className={styles.comboTrigger}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <span className={zonaSeleccionada === "" ? styles.comboPlaceholder : styles.comboValue}>
                            {selectedLabel}
                        </span>
                        <span className={styles.comboChevron}><ChevronDown /></span>
                    </button>
                    {dropdownOpen && (
                        <div className={styles.comboMenu}>
                            {zonasDisponibles.map((zona) => (
                                <button
                                    key={zona.id}
                                    className={`${styles.comboOption} ${zonaSeleccionada === zona.id ? styles.comboOptionSelected : ''}`}
                                    onClick={() => handleSelectZona(zona.id)}
                                >
                                    {zona.nombre}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    className={styles.btnSearch}
                    onClick={handleBuscar}
                    disabled={zonaSeleccionada === ""}
                >
                    Buscar
                </button>
            </div>

            {buscado ? (
                resultados.length > 0 ? (
                    <div className={styles.resultsList}>
                        {resultados.map((persona, i) => (
                            <div key={i} className={styles.personRow}>
                                <div className={styles.avatar}>
                                    {getInitials(persona.nombre)}
                                </div>
                                <div className={styles.personInfo}>
                                    <span className={styles.personName}>{persona.nombre}</span>
                                    <span className={styles.personEmail}>{persona.correo}</span>
                                </div>
                                <span className={`${styles.badge} ${getBadgeClass(persona.nivelConcienciaSeguridad)}`}>
                                    Conciencia de seguridad: {persona.nivelConcienciaSeguridad}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        No se encontraron personas en esta empresa
                    </div>
                )
            ) : (
                <div className={styles.emptyState}>
                    Selecciona una empresa y presiona Buscar
                </div>
            )}
        </div>
    );
}
