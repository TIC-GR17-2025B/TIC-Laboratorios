import { useState, useMemo } from "react";
import styles from "../styles/ModalPhishMatic.module.css";
import { useEscenario } from "../../../common/contexts";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import type { PlantillaCorreoPhishing } from "../../../../shared/types/EscenarioTypes";

export default function ModalPhishMatic() {
    const { dispositivoSeleccionado } = useEscenario();
    const { escenarioController } = useECSSceneContext();

    const plantillas = useMemo(() => {
        return escenarioController.getPlantillasCorreo();
    }, [escenarioController]);

    const [plantillaIdx, setPlantillaIdx] = useState<number | "">("");
    const [correoDestinatario, setCorreoDestinatario] = useState("");
    const [enviado, setEnviado] = useState(false);

    const plantillaSeleccionada: PlantillaCorreoPhishing | null =
        plantillaIdx !== "" ? plantillas[plantillaIdx] ?? null : null;

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

    return (
        <div className={styles.container}>
            <div className={styles.field}>
                <span className={styles.label}>Plantilla de correo</span>
                <select
                    className={styles.select}
                    value={plantillaIdx}
                    onChange={(e) => {
                        setPlantillaIdx(e.target.value !== "" ? Number(e.target.value) : "");
                        setEnviado(false);
                    }}
                >
                    <option value="">Seleccionar plantilla...</option>
                    {plantillas.map((p, i) => (
                        <option key={i} value={i}>
                            {p.asunto}
                        </option>
                    ))}
                </select>
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

            {enviado && (
                <div className={styles.successMsg}>
                    Correo enviado exitosamente
                </div>
            )}

            <div className={styles.footer}>
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
