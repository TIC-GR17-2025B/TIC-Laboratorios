import { useEffect, useState } from "react";
import ComboBox from "../../../common/components/ComboBox";
import styles from "../styles/ModalVPN.module.css";
import { TipoProteccionVPN } from "../../../../types/DeviceEnums";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { useEscenario } from "../../../common/contexts";
import type { PerfilClienteVPN } from "../../../../types/EscenarioTypes";
import TrashIcon from "../../../common/icons/TrashIcon";
import { ZonaComponent } from "../../../../ecs/components/ZonaComponent";
import { DispositivoComponent } from "../../../../ecs/components";
import getIconoNodo from "../utils/getIconoNodo";

type OptionItem = { label: string; value: string };

// No cambiar estos valores, deben coincidir con 
// el enum TipoProteccionVPN
const OPCIONES_PROTECCION = [
    { label: "EA", value: TipoProteccionVPN.EA },
    { label: "A", value: TipoProteccionVPN.A },
    { label: "N", value: TipoProteccionVPN.N },
    { label: "B", value: TipoProteccionVPN.B },
];

export default function ModalVPNCliente() {
    const [proteccion, setProteccion] = useState<OptionItem | null>(null);
    const [dominioRemoto, setDominioRemoto] = useState<OptionItem | null>(null);
    const [hostRemoto, setHostRemoto] = useState<OptionItem | null>(null);

    const [configuraciones, setConfiguraciones] = useState<Array<PerfilClienteVPN>>([]);
    const [dominioRemotoOpciones, setDominioRemotoOpciones] = useState<Array<OptionItem>>([]);
    const [hostRemotoOpciones, setHostRemotoOpciones] = useState<Array<OptionItem>>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const isFormularioCompleto = proteccion && dominioRemoto && hostRemoto;

    const { redController } = useECSSceneContext();
    const { entidadSeleccionadaId } = useEscenario();

    function eliminarPerfilClienteVPN(indiceEnTabla: number) {
        redController.removerPerfilClienteVPN(entidadSeleccionadaId!, indiceEnTabla);

        const perfilesActualizados = redController.getPerfilesClienteVPN(entidadSeleccionadaId!);
        if (perfilesActualizados) {
            setConfiguraciones([...perfilesActualizados]);
        }
    }


    useEffect(() => {
        const perfiles = redController.getPerfilesClienteVPN(entidadSeleccionadaId!);
        if (perfiles) {
            setConfiguraciones(perfiles);
        }

        const dominiosRemotos = redController.getDominiosRemotos(entidadSeleccionadaId!);
        if (dominiosRemotos) {
            const opciones = dominiosRemotos
                .map((entidad) => {
                    const zonaComponent = redController.ecsManager.getComponentes(entidad)?.get(ZonaComponent);
                    return zonaComponent
                        ? { label: zonaComponent.dominio, value: entidad.toString() }
                        : null;
                })
                .filter((opcion): opcion is OptionItem => opcion !== null);
            setDominioRemotoOpciones(opciones);
        }


    }, []);

    useEffect(() => {
        if (!dominioRemoto?.value) {
            setHostRemotoOpciones([]);
            return;
        }

        setErrorMessage("");

        const entidadZona = parseInt(dominioRemoto.value);
        const hosts = redController.getDispositivosPorZona(entidadZona);

        if (hosts) {
            const opcionesHosts = hosts
                .map((entidad) => {
                    const dispositivoComponent = redController.ecsManager.getComponentes(entidad)?.get(DispositivoComponent);
                    return dispositivoComponent
                        ? { label: dispositivoComponent.nombre, value: entidad.toString() }
                        : null;
                })
                .filter((opcion): opcion is OptionItem => opcion !== null);
            setHostRemotoOpciones(opcionesHosts);
        }
    }, [dominioRemoto, redController]);

    useEffect(() => {
        setErrorMessage("");
    }, [proteccion, hostRemoto]);

    const agregarConfiguracion = () => {
        if (isFormularioCompleto) {
            const configExistente = configuraciones.some(
                (config) =>
                    config.proteccion === proteccion!.value &&
                    config.dominioRemoto === dominioRemoto!.value &&
                    config.hostRemoto === hostRemoto!.value
            );

            if (configExistente) {
                setErrorMessage("Esta configuración ya existe.");
                return;
            }

            redController.agregarPerfilClienteVPN(
                entidadSeleccionadaId!,
                {
                    proteccion: proteccion!.value as TipoProteccionVPN,
                    dominioRemoto: dominioRemoto!.value,
                    hostRemoto: hostRemoto!.value,
                }
            );

            setProteccion(null);
            setDominioRemoto(null);
            setHostRemoto(null);
            setErrorMessage("");

            const perfilesActualizados = redController.getPerfilesClienteVPN(entidadSeleccionadaId!);
            if (perfilesActualizados) {
                setConfiguraciones(perfilesActualizados);
            }
        }
    };

    return (
        <div className={styles.modalVPNContainer}>
            <p className={styles.nota}>
                Como cliente VPN, este dispositivo se conectará a un dominio remoto específico.
                Define el nivel de protección y los destinos de conexión.
            </p>

            <div className={styles.modalBody}>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Nuevo Perfil</h3>
                    <div className={styles.formHorizontal}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Protección</label>
                            <ComboBox
                                items={OPCIONES_PROTECCION}
                                placeholder="Seleccionar"
                                value={proteccion}
                                onChange={setProteccion}
                                getKey={(item) => item.value}
                                getLabel={(item) => item.label}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Dominio remoto</label>
                            <ComboBox
                                items={dominioRemotoOpciones}
                                placeholder="Seleccionar"
                                value={dominioRemoto}
                                onChange={setDominioRemoto}
                                getKey={(item) => item.value}
                                getLabel={(item) => item.label}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Host remoto</label>
                            <ComboBox
                                items={hostRemotoOpciones}
                                placeholder="Seleccionar"
                                value={hostRemoto}
                                onChange={setHostRemoto}
                                getKey={(item) => item.value}
                                getLabel={(item) => item.label}
                            />
                        </div>
                        <button
                            className={styles.addButton}
                            onClick={agregarConfiguracion}
                            disabled={!isFormularioCompleto}
                            title="Agregar configuración"
                        >
                            +
                        </button>
                    </div>
                    {errorMessage && (
                        <div className={styles.errorMessage}>{errorMessage}</div>
                    )}
                </div>

                <div className={styles.listSection}>
                    <h3 className={styles.sectionTitle}>Perfiles Activos</h3>
                    {configuraciones.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No hay configuraciones agregadas</p>
                        </div>
                    ) : (
                        <div className={styles.listaConfiguraciones}>
                            {configuraciones.map((config, index) => (
                                <ConfiguracionVpnCliente
                                    key={index}
                                    index={index}
                                    proteccion={config.proteccion}
                                    dominioRemoto={config.dominioRemoto}
                                    hostRemoto={config.hostRemoto}
                                    redController={redController}
                                    onEliminar={eliminarPerfilClienteVPN}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ConfiguracionVpnClienteProps extends PerfilClienteVPN {
    index: number;
    redController: ReturnType<typeof useECSSceneContext>["redController"];
    onEliminar: (index: number) => void;
}

function ConfiguracionVpnCliente({ index, proteccion, dominioRemoto, hostRemoto, redController, onEliminar }: ConfiguracionVpnClienteProps) {

    const entidadZona = parseInt(dominioRemoto);
    const zonaComponent = redController.ecsManager.getComponentes(entidadZona)?.get(ZonaComponent);
    const nombreDominio = zonaComponent?.dominio || dominioRemoto;

    const entidadHost = parseInt(hostRemoto);
    const dispositivoComponent = redController.ecsManager.getComponentes(entidadHost)?.get(DispositivoComponent);
    const nombreHost = dispositivoComponent?.nombre || hostRemoto;
    const tipoHost = dispositivoComponent?.tipo as any; // necesito ver bien este tipado luego

    return (
        <div className={styles.configuracionItem}>
            <div className={styles.dispositivoRemotoIcon}>
                {getIconoNodo(tipoHost)}
            </div>
            <div className={styles.configuracionDetalles}>
                <div className={styles.configuracionField}>
                    <span className={styles.configLabel}>Protección</span>
                    <span className={styles.configValue}>{proteccion}</span>
                </div>
                <div className={styles.configuracionField}>
                    <span className={styles.configLabel}>Dominio remoto</span>
                    <span className={styles.configValue}>{nombreDominio}</span>
                </div>
                <div className={styles.configuracionField}>
                    <span className={styles.configLabel}>Host remoto</span>
                    <span className={styles.configValue}>{nombreHost}</span>
                </div>
            </div>
            <button
                className={styles.deleteButton}
                title="Eliminar configuración"
                onClick={() => onEliminar(index)}
            >
                <TrashIcon size={16} />
            </button>
        </div>
    );
}