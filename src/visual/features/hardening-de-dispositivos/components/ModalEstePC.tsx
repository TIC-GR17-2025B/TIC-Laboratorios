import { useEscenario } from "../../../common/contexts";
import styles from "../styles/ModalEstePC.module.css";
import ComputadoraIcon from "../../../common/icons/ComputadoraIcon";
import SistemaOpIcon from "../../../common/icons/SistemaOpIcon";

export default function ModalEstePC() {
    const { dispositivoSeleccionado } = useEscenario();

    if (!dispositivoSeleccionado) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    No hay dispositivo seleccionado
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ComputadoraIcon size={48} />
                <div className={styles.headerInfo}>
                    <h2 className={styles.nombre}>{dispositivoSeleccionado.nombre ?? "Dispositivo sin nombre"}</h2>
                    <span className={styles.tipo}>{dispositivoSeleccionado.tipo}</span>
                </div>
            </div>

            <div className={styles.seccion}>
                <h3 className={styles.seccionTitulo}>Especificaciones del dispositivo</h3>
                <div className={styles.propiedades}>
                    <div className={styles.propiedad}>
                        <span className={styles.etiqueta}>Nombre del dispositivo</span>
                        <span className={styles.valor}>{dispositivoSeleccionado.nombre ?? "Sin nombre"}</span>
                    </div>
                    <div className={styles.propiedad}>
                        <span className={styles.etiqueta}>Tipo</span>
                        <span className={styles.valor}>{dispositivoSeleccionado.tipo}</span>
                    </div>
                    <div className={styles.propiedad}>
                        <span className={styles.etiqueta}>ID de entidad</span>
                        <span className={styles.valor}>{dispositivoSeleccionado.entidadId}</span>
                    </div>
                </div>
            </div>

            <div className={styles.seccion}>
                <h3 className={styles.seccionTitulo}>
                    <SistemaOpIcon size={16} />
                    Sistema operativo
                </h3>
                <div className={styles.propiedades}>
                    <div className={styles.propiedad}>
                        <span className={styles.etiqueta}>Sistema</span>
                        <span className={styles.valor}>{dispositivoSeleccionado.sistemaOperativo ?? "No especificado"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
