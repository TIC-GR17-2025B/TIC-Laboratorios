import { useECSSceneContext } from "../context/ECSSceneContext";
import styles from "../styles/TarjetaLogNuevo.module.css";
import { useEffect } from "react";

export default function TarjetaLogNuevo() {
    const { mostrarNuevoLog, setMostrarNuevoLog, setMensajeLog, mensajeLog } = useECSSceneContext();

    useEffect(() => {
        if (!mostrarNuevoLog) return;

        const timer = setTimeout(() => {
            // ocultar la tarjeta y limpiar el mensaje después de 4 segundos
            setMostrarNuevoLog(false);
            setMensajeLog("");
        }, 4000);

        return () => clearTimeout(timer);
    }, [mostrarNuevoLog, setMostrarNuevoLog, setMensajeLog]);

    if (!mostrarNuevoLog) {
        return null;
    }

    return (
        <div className={styles.tarjeta}>
            <p>{mensajeLog}</p>
        </div>
    );
}