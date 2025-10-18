import { useMemo, useState } from "react";
import DevicesIcon from "../../../common/icons/DevicesIcon";
import SistemaOpIcon from "../../../common/icons/SistemaOpIcon";
import SoftwareIcon from "../../../common/icons/SoftwareIcon";
import styles from "../styles/Dispositivos.module.css"

import { dispositivosMock } from "../../../mocks/DispositivoMock";
import ComboBox from "../../../common/components/ComboBox";
import PanelConfiguraciones from "../components/PanelConfiguraciones";

function Dispositivos() {
    const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(dispositivosMock[0]);

    const opciones = useMemo(() => dispositivosMock, []);

    return <div className={styles.contenedor}>
        <div className={styles.comboBoxDispositivo}>
            <ComboBox
                items={opciones}
                value={dispositivoSeleccionado}
                onChange={setDispositivoSeleccionado}
                getKey={(d) => d.id}
                getLabel={(d) => d.nombre}
                icon={<DevicesIcon size={16} />}
            />
        </div>
        <div className={styles.contenidoDispositivo}>
            <div className={styles.imagenDispositivo}>
            </div>
            <section className={styles.descripcion}>
                <div className={styles.item}>
                    <div className={styles.etiqueta}>
                        <SistemaOpIcon size={16} />
                        <span>Sistema Operativo</span>
                    </div>
                    <span className={styles.valor}>{dispositivoSeleccionado?.sistemaOperativo}</span>
                </div>
                <div className={styles.item}>
                    <div className={styles.etiqueta}>
                        <DevicesIcon size={16} />
                        <span>Hardware</span>
                    </div>
                    <span className={styles.valor}>{dispositivoSeleccionado?.hardware}</span>
                </div>
                <div className={styles.item}>
                    <div className={styles.etiqueta}>
                        <SoftwareIcon size={16} />
                        <span>Software</span>
                    </div>
                    <span className={styles.valor}>{dispositivoSeleccionado?.software}</span>
                </div>
                {/* <div className={`${styles.item} ${styles.itemLista}`}>
                    <div className={styles.etiqueta}>
                        <ActivosIcon size={16} />
                        <span>Activos</span>
                    </div>
                    {dispositivoSeleccionado?.activos.length ? (
                        <div>
                            {dispositivoSeleccionado?.activos.map((activo, index) => (
                                <div className={styles.itemListaDetalle} key={index}>{activo}</div>
                            ))}
                        </div>
                    ) : (
                        <span className={styles.valor}>-</span>
                    )}
                </div> */}
            </section>
            <section className={styles.configuraciones}>
                <PanelConfiguraciones />
            </section>
        </div>
    </div>
}
export default Dispositivos;