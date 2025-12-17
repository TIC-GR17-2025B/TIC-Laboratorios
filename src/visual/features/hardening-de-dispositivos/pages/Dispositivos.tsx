import { useEffect } from "react";
import DevicesIcon from "../../../common/icons/DevicesIcon";
import SistemaOpIcon from "../../../common/icons/SistemaOpIcon";
import styles from "../styles/Dispositivos.module.css"

import ComboBox from "../../../common/components/ComboBox";
import PanelConfiguraciones from "../components/PanelConfiguraciones";
import { useEscenario, useModal } from "../../../common/contexts";
import type { Dispositivo } from "../../../../types/EscenarioTypes";
import ConexionIcon from "../../../common/icons/ConexionIcon";
import RedChip from "../../simulacion-redes/components/RedChip";
import { useDispositivos } from "../hooks";
import VPNIcon from "../../../common/icons/VPNIcon";
import ModalVPNCliente from "../../simulacion-redes/components/ModalVPNCliente";
import PageTransition from "../../../common/components/PageTransition";
import ShieldCheckIcon from "../../../common/icons/ShieldCheckIcon";
import ModalVerificacionFirma from "../components/ModalVerificacionFirma";
import SoftwareIcon from "../../../common/icons/SoftwareIcon";
import ModalApps from "../components/ModalApps";

function Dispositivos() {
    const { setDispositivoSeleccionado, dispositivoSeleccionado, entidadSeleccionadaId } = useEscenario();
    const { openModal } = useModal();
    const { dispositivos } = useDispositivos();

    useEffect(() => {
        if (dispositivos.length === 0) return;

        // Verificar que sea una entidad de la lista
        const esEntidadValida = entidadSeleccionadaId !== null &&
            dispositivos.some(d => d.entidadId === entidadSeleccionadaId);

        if (!dispositivoSeleccionado || !esEntidadValida) {
            setDispositivoSeleccionado(dispositivos[0]);
        }
    }, [dispositivos, dispositivoSeleccionado, entidadSeleccionadaId, setDispositivoSeleccionado]);

    useEffect(() => {
        if (dispositivoSeleccionado) {
            const dispositivoActualizado = dispositivos.find(d => d.entidadId === dispositivoSeleccionado.entidadId);
            if (dispositivoActualizado) {
                setDispositivoSeleccionado(dispositivoActualizado);
            }
        }
    }, [dispositivos]);

    return <PageTransition>
        <div className={styles.contenedor}>
            <div className={styles.parteSuperior}>
                <div className={styles.comboBoxDispositivo}>
                    <ComboBox<Dispositivo>
                        items={dispositivos}
                        value={dispositivoSeleccionado}
                        onChange={setDispositivoSeleccionado}
                        getKey={(d) => d.id.toString()}
                        getLabel={(d) => d.nombre ?? "Dispositivo sin nombre"}
                        icon={<DevicesIcon size={16} />}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openModal(<ModalVerificacionFirma />, 'Verificación de Firma Digital')}>
                        <ShieldCheckIcon />Verificar Firma
                <div className={styles.botonesAccion}>
                    <button onClick={() => openModal(<ModalApps />, 'Gestionar Aplicaciones')}>
                        <SoftwareIcon />Gestionar Apps
                    </button>
                    <button onClick={() => openModal(<ModalVPNCliente />, 'Configuración de VPN Cliente')}>
                        <VPNIcon />Configurar VPN
                    </button>
                </div>
            </div>
            <div className={styles.contenidoDispositivo}>
                <img draggable={false} className={styles.imagenDispositivo} src="/assets/models_picture/workstation.webp" alt="Imagen de Estación de trabajo" />
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
                    <div className={`${styles.item} ${styles.itemLista}`}>
                        <div className={styles.etiqueta}>
                            <ConexionIcon size={16} />
                            <span>Redes</span>
                        </div>
                        {dispositivoSeleccionado?.redes && dispositivoSeleccionado.redes.length > 0 ? (
                            <div>
                                {dispositivoSeleccionado.redes.map((red) => (
                                    <div className={styles.itemListaDetalle} key={red.entidadId}>
                                        <RedChip nombre={red.nombre} color={red.color} activado={true} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className={styles.valor}>-</span>
                        )}
                    </div>
                </section>
                <section className={styles.configuraciones}>
                    <PanelConfiguraciones />
                </section>
            </div>
        </div>
    </PageTransition>
}
export default Dispositivos;