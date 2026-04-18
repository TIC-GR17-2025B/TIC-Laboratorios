import styles from "../styles/TarjetaEntidadSeleccionada.module.css";
import { useEscenario } from "../../../common/contexts";
// import DevicesIcon from "../../../common/icons/DevicesIcon";
// import SistemaOpIcon from "../../../common/icons/SistemaOpIcon";
// import SoftwareIcon from "../../../common/icons/SoftwareIcon";

export default function TarjetaEntidadSeleccionada({ visible }: { visible: boolean }) {
    const { dispositivoSeleccionado } = useEscenario();

    if (!visible || !dispositivoSeleccionado) return null;

    return (
        <div className={styles.contenedor}>
          
                <h3 className={styles.titulo}>{dispositivoSeleccionado.nombre}</h3>
            

        </div>
    );
}
