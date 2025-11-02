import { useEffect, useMemo } from "react";
import DevicesIcon from "../../../common/icons/DevicesIcon";
import SistemaOpIcon from "../../../common/icons/SistemaOpIcon";
import styles from "../styles/Dispositivos.module.css"

import ComboBox from "../../../common/components/ComboBox";
import PanelConfiguraciones from "../components/PanelConfiguraciones";
import { useEscenario } from "../../../common/contexts";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import { DispositivoComponent, WorkstationComponent, Transform } from "../../../../ecs/components";
import type { Dispositivo } from "../../../../types/EscenarioTypes";
import { EstadoAtaqueDispositivo, TipoDispositivo } from "../../../../types/DeviceEnums";

function Dispositivos() {
    const { setDispositivoSeleccionado, dispositivoSeleccionado } = useEscenario();

    // Obtener dispositivos reales desde el ECS
    const opciones = useMemo(() => {
        try {
            const controller = EscenarioController.getInstance();
            const entidades = controller.getWorkstationsYServers();

            return entidades.map((entidad): Dispositivo => {
                const container = controller.ecsManager.getComponentes(entidad);
                if (!container) {
                    return {
                        id: entidad,
                        entidadId: entidad,
                        tipo: TipoDispositivo.OTRO,
                        nombre: "Dispositivo desconocido",
                        sistemaOperativo: "",
                        hardware: "",
                        software: "",
                        estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                    } as Dispositivo;
                }

                const dispComp = container.get(DispositivoComponent);
                const wsComp = container.get(WorkstationComponent);
                const transform = container.get(Transform);

                const posicion = transform
                    ? { x: transform.x, y: transform.y, z: transform.z, rotacionY: transform.rotacionY }
                    : undefined;

                const dispositivo: Dispositivo = {
                    id: entidad,
                    entidadId: entidad,
                    tipo: dispComp?.tipo ?? TipoDispositivo.OTRO,
                    nombre: dispComp?.nombre ?? "Dispositivo sin nombre",
                    sistemaOperativo: dispComp?.sistemaOperativo ?? "",
                    hardware: dispComp?.hardware ?? "",
                    software: "",
                    posicion,
                    estadoAtaque: dispComp?.estadoAtaque ?? EstadoAtaqueDispositivo.NORMAL,
                };

                // Agregar configuraciones si es workstation
                if (wsComp) {
                    dispositivo.configuraciones = wsComp.configuraciones;
                }

                return dispositivo;
            });
        } catch (error) {
            console.error("Error obteniendo dispositivos:", error);
            return [];
        }
    }, []);

    // Establecer el primer dispositivo como seleccionado por defecto
    useEffect(() => {
        if (!dispositivoSeleccionado && opciones.length > 0) {
            setDispositivoSeleccionado(opciones[0]);
        }
    }, [opciones, dispositivoSeleccionado, setDispositivoSeleccionado]);

    return <div className={styles.contenedor}>
        <div className={styles.comboBoxDispositivo}>
            <ComboBox<Dispositivo>
                items={opciones}
                value={dispositivoSeleccionado}
                onChange={setDispositivoSeleccionado}
                getKey={(d) => d.id.toString()}
                getLabel={(d) => d.nombre ?? "Dispositivo sin nombre"}
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

                {/*
                <div className={styles.item}>
                    <div className={styles.etiqueta}>
                        <SoftwareIcon size={16} />
                        <span>Software</span>
                    </div>
                    <span className={styles.valor}>{dispositivoSeleccionado?.software}</span>
                </div>
                
                <div className={`${styles.item} ${styles.itemLista}`}>
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