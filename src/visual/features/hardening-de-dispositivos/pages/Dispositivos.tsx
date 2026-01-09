import { useEffect, useState, type ReactNode } from "react";
import SistemaOpIcon from "../../../common/icons/SistemaOpIcon";
import styles from "../styles/Dispositivos.module.css"

import PanelConfiguraciones from "../components/PanelConfiguraciones";
import { useEscenario } from "../../../common/contexts";
import type { Dispositivo } from "../../../../types/EscenarioTypes";
import { useDispositivos } from "../hooks";
import VPNIcon from "../../../common/icons/VPNIcon";
import ModalVPNCliente from "../../simulacion-redes/components/ModalVPNCliente";
import PageTransition from "../../../common/components/PageTransition";
import ShieldCheckIcon from "../../../common/icons/ShieldCheckIcon";
import ModalVerificacionFirma from "../components/ModalVerificacionFirma";
import ActivosIcon from "../../../common/icons/ActivosIcon";
import ModalExploradorArchivos from "../components/ModalExploradorArchivos";
import SoftwareIcon from "../../../common/icons/SoftwareIcon";
import ModalApps from "../components/ModalApps";
import ComputadoraIcon from "../../../common/icons/ComputadoraIcon";
import ConfiguracionIcon from "../../../common/icons/ConfiguracionIcon";
import ModalEstePC from "../components/ModalEstePC";
import VentanaOS from "../components/VentanaOS";

type VentanaId = "estePC" | "archivos" | "apps" | "configuracion" | "firmaChecker" | "vpn";

interface VentanaConfig {
    id: VentanaId;
    titulo: string;
    icono: ReactNode;
    contenido: ReactNode;
    posicionInicial: { x: number; y: number };
}

function Dispositivos() {
    const { setDispositivoSeleccionado, dispositivoSeleccionado, entidadSeleccionadaId } = useEscenario();
    const { dispositivos } = useDispositivos();
    const [ventanasAbiertas, setVentanasAbiertas] = useState<VentanaId[]>([]);
    const [ventanasMinimizadas, setVentanasMinimizadas] = useState<VentanaId[]>([]);

    const ventanasConfig: VentanaConfig[] = [
        { id: "estePC", titulo: "Este PC", icono: <ComputadoraIcon size={14} />, contenido: <ModalEstePC />, posicionInicial: { x: 50, y: 30 } },
        { id: "archivos", titulo: "Explorador de archivos", icono: <ActivosIcon size={14} />, contenido: <ModalExploradorArchivos />, posicionInicial: { x: 80, y: 50 } },
        { id: "apps", titulo: "Aplicaciones", icono: <SoftwareIcon size={14} />, contenido: <ModalApps />, posicionInicial: { x: 110, y: 70 } },
        { id: "configuracion", titulo: "Configuración", icono: <ConfiguracionIcon size={14} />, contenido: <PanelConfiguraciones />, posicionInicial: { x: 140, y: 40 } },
        { id: "firmaChecker", titulo: "FirmaChecker", icono: <ShieldCheckIcon size={14} />, contenido: <ModalVerificacionFirma />, posicionInicial: { x: 170, y: 60 } },
        { id: "vpn", titulo: "Cliente VPN", icono: <VPNIcon size={14} />, contenido: <ModalVPNCliente />, posicionInicial: { x: 200, y: 80 } },
    ];

    const abrirVentana = (id: VentanaId) => {
        if (ventanasMinimizadas.includes(id)) {
            setVentanasMinimizadas(ventanasMinimizadas.filter(v => v !== id));
        } else if (!ventanasAbiertas.includes(id)) {
            setVentanasAbiertas([...ventanasAbiertas, id]);
        }
    };

    const cerrarVentana = (id: VentanaId) => {
        setVentanasAbiertas(ventanasAbiertas.filter(v => v !== id));
        setVentanasMinimizadas(ventanasMinimizadas.filter(v => v !== id));
    };

    const minimizarVentana = (id: VentanaId) => {
        if (!ventanasMinimizadas.includes(id)) {
            setVentanasMinimizadas([...ventanasMinimizadas, id]);
        }
    };

    useEffect(() => {
        if (dispositivos.length === 0) return;

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

    const getIconoDispositivo = (tipo: string) => {
        switch (tipo?.toLowerCase()) {
            case "servidor":
                return <SistemaOpIcon size={16} />;
            default:
                return <ComputadoraIcon size={16} />;
        }
    };

    return <PageTransition>
        <div className={styles.contenedor}>
            {/* Panel lateral de dispositivos */}
            <div className={styles.panelLateral}>
                <div className={styles.panelHeader}>
                    <span>Máquinas</span>
                </div>
                <div className={styles.listaDispositivos}>
                    {dispositivos.map((dispositivo: Dispositivo) => (
                        <button
                            key={dispositivo.id}
                            className={`${styles.itemDispositivo} ${dispositivoSeleccionado?.id === dispositivo.id ? styles.itemDispositivoActivo : ""}`}
                            onClick={() => setDispositivoSeleccionado(dispositivo)}
                        >
                            <div className={styles.iconoDispositivo}>
                                {getIconoDispositivo(dispositivo.tipo)}
                            </div>
                            <div className={styles.infoDispositivo}>
                                <span className={styles.nombreDispositivo}>
                                    {dispositivo.nombre ?? "Sin nombre"}
                                </span>
                                <span className={styles.tipoDispositivo}>
                                    {dispositivo.sistemaOperativo ?? dispositivo.tipo}
                                </span>
                            </div>
                            
                        </button>
                    ))}
                </div>
            </div>

            {/* Área del escritorio */}
            <div className={styles.escritorio}>
                <div className={styles.areaEscritorio}>
                    <div className={styles.iconosEscritorio}>
                        <button className={styles.iconoApp} onClick={() => abrirVentana("estePC")}>
                            <div className={styles.iconoAppImagen}>
                                <ComputadoraIcon size={32} />
                            </div>
                            <span className={styles.iconoAppNombre}>Este PC</span>
                        </button>
                        <button className={styles.iconoApp} onClick={() => abrirVentana("archivos")}>
                            <div className={styles.iconoAppImagen}>
                                <ActivosIcon size={32} />
                            </div>
                            <span className={styles.iconoAppNombre}>Archivos</span>
                        </button>
                        <button className={styles.iconoApp} onClick={() => abrirVentana("apps")}>
                            <div className={styles.iconoAppImagen}>
                                <SoftwareIcon size={32} />
                            </div>
                            <span className={styles.iconoAppNombre}>Apps</span>
                        </button>
                        <button className={styles.iconoApp} onClick={() => abrirVentana("configuracion")}>
                            <div className={styles.iconoAppImagen}>
                                <ConfiguracionIcon size={32} />
                            </div>
                            <span className={styles.iconoAppNombre}>Configuración</span>
                        </button>
                        <button className={styles.iconoApp} onClick={() => abrirVentana("firmaChecker")}>
                            <div className={styles.iconoAppImagen}>
                                <ShieldCheckIcon size={32} />
                            </div>
                            <span className={styles.iconoAppNombre}>FirmaChecker</span>
                        </button>
                        <button className={styles.iconoApp} onClick={() => abrirVentana("vpn")}>
                            <div className={styles.iconoAppImagen}>
                                <VPNIcon size={32} />
                            </div>
                            <span className={styles.iconoAppNombre}>VPN</span>
                        </button>
                    </div>

                    {ventanasAbiertas
                        .filter(id => !ventanasMinimizadas.includes(id))
                        .map(id => {
                            const config = ventanasConfig.find(v => v.id === id);
                            if (!config) return null;
                            return (
                                <VentanaOS
                                    key={id}
                                    titulo={config.titulo}
                                    icono={config.icono}
                                    onClose={() => cerrarVentana(id)}
                                    onMinimize={() => minimizarVentana(id)}
                                    initialPosition={config.posicionInicial}
                                >
                                    {config.contenido}
                                </VentanaOS>
                            );
                        })}
                </div>
                <div className={styles.barraTareas}>
                    <div className={styles.botonInicio}>
                        <SistemaOpIcon size={18} />
                    </div>
                    <div className={styles.separadorTareas} />
                    <div className={styles.appsTareas}>
                        <button className={`${styles.appTarea} ${ventanasAbiertas.includes("archivos") ? styles.appTareaActiva : ""}`} onClick={() => abrirVentana("archivos")}>
                            <ActivosIcon size={18} />
                        </button>
                        <button className={`${styles.appTarea} ${ventanasAbiertas.includes("apps") ? styles.appTareaActiva : ""}`} onClick={() => abrirVentana("apps")}>
                            <SoftwareIcon size={18} />
                        </button>
                        <button className={`${styles.appTarea} ${ventanasAbiertas.includes("configuracion") ? styles.appTareaActiva : ""}`} onClick={() => abrirVentana("configuracion")}>
                            <ConfiguracionIcon size={18} />
                        </button>
                    </div>
                    <div className={styles.bandejaSistema}>
                        <span className={styles.reloj}>
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </PageTransition>
}
export default Dispositivos;
