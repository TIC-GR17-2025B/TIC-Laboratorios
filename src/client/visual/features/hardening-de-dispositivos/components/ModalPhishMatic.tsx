import { useState, useMemo, useRef, useEffect } from "react";
import styles from "../styles/ModalPhishMatic.module.css";
import { useEscenario } from "../../../common/contexts";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import type { PlantillaCorreoPhishing } from "../../../../shared/types/EscenarioTypes";

function ChevronDown() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ModalPhishMatic() {
    const { dispositivoSeleccionado } = useEscenario();
    const { escenarioController } = useECSSceneContext();

    const plantillas = useMemo(() => {
        return escenarioController.getPlantillasCorreo();
    }, [escenarioController]);

    const [plantillaIdx, setPlantillaIdx] = useState<number | "">("");
    const [correoDestinatario, setCorreoDestinatario] = useState("");
    const [enviado, setEnviado] = useState(false);
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

    const plantillaSeleccionada: PlantillaCorreoPhishing | null =
        plantillaIdx !== "" ? plantillas[plantillaIdx] ?? null : null;

    const handleSelectPlantilla = (idx: number) => {
        setPlantillaIdx(idx);
        setEnviado(false);
        setDropdownOpen(false);
    };

    const handleEnviar = () => {
        if (!plantillaSeleccionada || !correoDestinatario.trim() || !dispositivoSeleccionado?.nombre) return;

        escenarioController.registrarEnvioDeCorreo(
            dispositivoSeleccionado.nombre,
            correoDestinatario.trim(),
            plantillaSeleccionada.asunto
        );

        setEnviado(true);
        setTimeout(() => setEnviado(false), 3000);
    };

    const puedeEnviar = plantillaSeleccionada !== null && correoDestinatario.trim().length > 0;

    const selectedLabel = plantillaSeleccionada
        ? plantillaSeleccionada.asunto
        : "Seleccionar plantilla";

    return (
        <div className={styles.container}>
            <div className={styles.field}>
                <span className={styles.label}>Plantilla de correo</span>
                <div className={styles.comboBox} ref={dropdownRef}>
                    <button
                        className={styles.comboTrigger}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <span className={plantillaIdx === "" ? styles.comboPlaceholder : styles.comboValue}>
                            {selectedLabel}
                        </span>
                        <span className={styles.comboChevron}><ChevronDown /></span>
                    </button>
                    {dropdownOpen && (
                        <div className={styles.comboMenu}>
                            {plantillas.map((p, i) => (
                                <button
                                    key={i}
                                    className={`${styles.comboOption} ${plantillaIdx === i ? styles.comboOptionSelected : ''}`}
                                    onClick={() => handleSelectPlantilla(i)}
                                >
                                    {p.asunto}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.field}>
                <span className={styles.label}>Correo destinatario</span>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="ejemplo@correo.com"
                    value={correoDestinatario}
                    onChange={(e) => {
                        setCorreoDestinatario(e.target.value);
                        setEnviado(false);
                    }}
                />
            </div>

            <div className={styles.preview}>
                {plantillaSeleccionada ? (
                    <>
                        <div className={styles.previewSubject}>
                            Asunto: {plantillaSeleccionada.asunto}
                        </div>
                        <div className={styles.previewBody}>
                            {plantillaSeleccionada.mensaje}
                        </div>
                    </>
                ) : (
                    <div className={styles.previewEmpty}>
                        Selecciona una plantilla para ver la vista previa del correo
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <span className={`${styles.successMsg} ${enviado ? styles.successMsgVisible : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Correo enviado exitosamente
                </span>
                <button
                    className={styles.btnSend}
                    onClick={handleEnviar}
                    disabled={!puedeEnviar}
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
