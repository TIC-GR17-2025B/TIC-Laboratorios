import { useState } from "react";
import Toggle from "../../../common/components/Toggle";
import styles from "../styles/Redes.module.css";
import VistaTabla from "../components/VistaTabla";

const opcionesVista = [
    { value: 'topologia', label: 'Topología' },
    { value: 'tabla', label: 'Tabla' },
];

export default function Redes() {
    const [vistaSeleccionada, setVistaSeleccionada] = useState<string>('topologia');
    return <div className={styles.contenedor}>
        <div>
            <Toggle value={vistaSeleccionada} options={opcionesVista} onChange={setVistaSeleccionada} />
        </div>
        {
            <div className={styles.contenedorVistas}>
                {vistaSeleccionada === 'topologia' ? (
                    <div className={styles.vistaTopologia}>Vista de Topología de Redes (a implementar)</div>
                ) : (
                    <VistaTabla />
                )}
            </div>
        }
    </div>;
}