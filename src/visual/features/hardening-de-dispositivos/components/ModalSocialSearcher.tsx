import { useState } from "react";
import styles from "../styles/ModalSocialSearcher.module.css";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import type { InfoPersonaEncontrada } from "../../../../types/EscenarioTypes";

export default function ModalSocialSearcher() {
    const { escenarioController, zonasDisponibles } = useECSSceneContext();
    const [zonaSeleccionada, setZonaSeleccionada] = useState<number | "">("");
    const [resultados, setResultados] = useState<InfoPersonaEncontrada[]>([]);
    const [buscado, setBuscado] = useState(false);

    const handleBuscar = () => {
        if (zonaSeleccionada === "") return;

        const entidadZona = escenarioController.builder.obtenerEntidadZonaPorId(zonaSeleccionada);
        if (entidadZona === undefined) return;

        const personas = escenarioController.getInfoPersonasPorEmpresa(entidadZona);
        setResultados(personas ?? []);
        setBuscado(true);

        escenarioController.registrarEjecucionAplicacion("Company Social-Searcher");
    };

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
                <select
                    className={styles.select}
                    value={zonaSeleccionada}
                    onChange={(e) => {
                        setZonaSeleccionada(e.target.value ? Number(e.target.value) : "");
                        setBuscado(false);
                    }}
                >
                    <option value="">Seleccionar zona</option>
                    {zonasDisponibles.map((zona) => (
                        <option key={zona.id} value={zona.id}>
                            {zona.nombre}
                        </option>
                    ))}
                </select>
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
                            <div key={i} className={styles.personCard}>
                                <div className={styles.avatar}>
                                    {getInitials(persona.nombre)}
                                </div>
                                <div className={styles.personInfo}>
                                    <div className={styles.personName}>{persona.nombre}</div>
                                    <div className={styles.personEmail}>{persona.correo}</div>
                                </div>
                                <span className={`${styles.badge} ${getBadgeClass(persona.nivelConcienciaSeguridad)}`}>
                                    {persona.nivelConcienciaSeguridad}
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
