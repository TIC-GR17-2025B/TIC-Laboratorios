import styles from "../styles/Controles3D.module.css";
import { useECSSceneContext } from "../context/ECSSceneContext";
import SiguienteZonaIcon from "../../../common/icons/SiguienteZonaIcon";
import AnteriorZonaIcon from "../../../common/icons/AnteriorZonaIcon";

/**
 * Componente para controles 3D adicionales en la interfaz, 
 * como ir al siguiente usuario, dispositivo, etc.
 */

export default function Controles3D() {
    const { siguienteZona, anteriorZona } = useECSSceneContext();

    return (
        <aside className={styles.controles3D} aria-label="Controles de vista 3D">
            <button
                type="button"
                onClick={anteriorZona}
                aria-label="Zona Anterior"
                title="Ir a la zona anterior"
            >
                <AnteriorZonaIcon size={20} />
            </button>
            <button
                type="button"
                onClick={siguienteZona}
                aria-label="Siguiente Zona"
                title="Ir a la siguiente zona"
            >
                <SiguienteZonaIcon size={20} />
            </button>
        </aside>
    );
}