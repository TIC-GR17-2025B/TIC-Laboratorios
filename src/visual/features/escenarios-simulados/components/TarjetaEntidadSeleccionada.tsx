import styles from "../styles/TarjetaEntidadSeleccionada.module.css";
import { useEscenario } from "../../../common/contexts";
import DevicesIcon from "../../../common/icons/DevicesIcon";
import SistemaOpIcon from "../../../common/icons/SistemaOpIcon";
import SoftwareIcon from "../../../common/icons/SoftwareIcon";

export default function TarjetaEntidadSeleccionada({ visible }: { visible: boolean }) {
    const { dispositivoSeleccionado } = useEscenario();

    if (!visible || !dispositivoSeleccionado) return null;

    return (
        <div className={styles.contenedor}>
            <div className={styles.header}>
                <DevicesIcon size={16} />
                <h3 className={styles.titulo}>{dispositivoSeleccionado.nombre}</h3>
            </div>

            <div className={styles.contenido}>
                <div className={styles.item}>
                    <div className={styles.etiqueta}>
                        <SistemaOpIcon size={16} />
                        <span>Sistema Operativo</span>
                    </div>
                    <span className={styles.valor}>
                        {dispositivoSeleccionado.sistemaOperativo || "-"}
                    </span>
                </div>

                <div className={styles.item}>
                    <div className={styles.etiqueta}>
                        <DevicesIcon size={16} />
                        <span>Hardware</span>
                    </div>
                    <span className={styles.valor}>
                        {dispositivoSeleccionado.hardware || "-"}
                    </span>
                </div>

                {dispositivoSeleccionado.software && (
                    <div className={styles.item}>
                        <div className={styles.etiqueta}>
                            <SoftwareIcon size={16} />
                            <span>Software</span>
                        </div>
                        <span className={styles.valor}>
                            {dispositivoSeleccionado.software}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}