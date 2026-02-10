import { useEffect, useRef, useState, type ReactNode } from "react";
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
    const [iconoSeleccionado, setIconoSeleccionado] = useState<VentanaId | null>(null);
    const [ordenZ, setOrdenZ] = useState<VentanaId[]>([]);
    const ultimoClick = useRef<{ id: VentanaId; time: number } | null>(null);
    const estadosPorDispositivo = useRef<Map<string, { ventanasAbiertas: VentanaId[]; ventanasMinimizadas: VentanaId[]; ordenZ: VentanaId[]; iconoSeleccionado: VentanaId | null }>>(new Map());

    const ventanasConfig: VentanaConfig[] = [
        { id: "estePC", titulo: "Este PC", icono: <ComputadoraIcon size={14} />, contenido: <ModalEstePC />, posicionInicial: { x: 50, y: 30 } },
        { id: "archivos", titulo: "Explorador de archivos", icono: <ActivosIcon size={14} />, contenido: <ModalExploradorArchivos />, posicionInicial: { x: 80, y: 50 } },
        { id: "apps", titulo: "Aplicaciones", icono: <SoftwareIcon size={14} />, contenido: <ModalApps />, posicionInicial: { x: 110, y: 70 } },
        { id: "configuracion", titulo: "Configuración", icono: <ConfiguracionIcon size={14} />, contenido: <PanelConfiguraciones />, posicionInicial: { x: 140, y: 40 } },
        { id: "firmaChecker", titulo: "FirmaChecker", icono: <ShieldCheckIcon size={14} />, contenido: <ModalVerificacionFirma />, posicionInicial: { x: 170, y: 60 } },
        { id: "vpn", titulo: "Cliente VPN", icono: <VPNIcon size={14} />, contenido: <ModalVPNCliente />, posicionInicial: { x: 200, y: 80 } },
    ];

    const enfocarVentana = (id: VentanaId) => {
        setOrdenZ(prev => [...prev.filter(v => v !== id), id]);
    };

    const abrirVentana = (id: VentanaId) => {
        setVentanasMinimizadas(prev => {
            if (prev.includes(id)) {
                enfocarVentana(id);
                return prev.filter(v => v !== id);
            }
            return prev;
        });
        setVentanasAbiertas(prev => {
            if (!prev.includes(id)) {
                setOrdenZ(z => [...z, id]);
                return [...prev, id];
            }
            enfocarVentana(id);
            return prev;
        });
    };

    const cerrarVentana = (id: VentanaId) => {
        setVentanasAbiertas(prev => prev.filter(v => v !== id));
        setVentanasMinimizadas(prev => prev.filter(v => v !== id));
        setOrdenZ(prev => prev.filter(v => v !== id));
    };

    const minimizarVentana = (id: VentanaId) => {
        setVentanasMinimizadas(prev => prev.includes(id) ? prev : [...prev, id]);
    };

    const handleClickIcono = (e: React.MouseEvent, id: VentanaId) => {
        e.stopPropagation();
        const ahora = Date.now();
        if (ultimoClick.current && ultimoClick.current.id === id && ahora - ultimoClick.current.time < 400) {
            abrirVentana(id);
            ultimoClick.current = null;
        } else {
            setIconoSeleccionado(id);
            ultimoClick.current = { id, time: ahora };
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

    const cambiarDispositivo = (dispositivo: Dispositivo) => {
        // Save current device state
        if (dispositivoSeleccionado) {
            estadosPorDispositivo.current.set(dispositivoSeleccionado.id, {
                ventanasAbiertas,
                ventanasMinimizadas,
                ordenZ,
                iconoSeleccionado,
            });
        }

        setDispositivoSeleccionado(dispositivo);

        // Restore new device state or start fresh
        const estado = estadosPorDispositivo.current.get(dispositivo.id);
        if (estado) {
            setVentanasAbiertas(estado.ventanasAbiertas);
            setVentanasMinimizadas(estado.ventanasMinimizadas);
            setOrdenZ(estado.ordenZ);
            setIconoSeleccionado(estado.iconoSeleccionado);
        } else {
            setVentanasAbiertas([]);
            setVentanasMinimizadas([]);
            setOrdenZ([]);
            setIconoSeleccionado(null);
        }
        ultimoClick.current = null;
    };

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
            {/* Pestañas de dispositivos */}
            <div className={styles.tabsDispositivos}>
                {dispositivos.map((dispositivo: Dispositivo) => (
                    <button
                        key={dispositivo.id}
                        className={`${styles.tabDispositivo} ${dispositivoSeleccionado?.id === dispositivo.id ? styles.tabDispositivoActivo : ""}`}
                        onClick={() => cambiarDispositivo(dispositivo)}
                    >
                        {dispositivo.nombre ?? "Sin nombre"}
                    </button>
                ))}
            </div>

            {/* Área del escritorio */}
            <div className={styles.escritorio}>
                <div className={styles.areaEscritorio} onClick={() => setIconoSeleccionado(null)}>
                    <div className={styles.iconosEscritorio}>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "estePC" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "estePC")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#4FC3F7' }}>
                                <ComputadoraIcon size={36} />
                            </div>
                            <span className={styles.iconoAppNombre}>Este PC</span>
                        </button>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "archivos" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "archivos")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#FFD54F' }}>
                                <ActivosIcon size={36} />
                            </div>
                            <span className={styles.iconoAppNombre}>Archivos</span>
                        </button>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "apps" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "apps")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#81C784' }}>
                                <SoftwareIcon size={36} />
                            </div>
                            <span className={styles.iconoAppNombre}>Apps</span>
                        </button>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "configuracion" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "configuracion")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#B0BEC5' }}>
                                <ConfiguracionIcon size={36} />
                            </div>
                            <span className={styles.iconoAppNombre}>Configuracion</span>
                        </button>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "firmaChecker" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "firmaChecker")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#4DB6AC' }}>
                                <ShieldCheckIcon size={36} />
                            </div>
                            <span className={styles.iconoAppNombre}>FirmaChecker</span>
                        </button>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "vpn" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "vpn")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#7E57C2' }}>
                                <VPNIcon size={36} />
                            </div>
                            <span className={styles.iconoAppNombre}>VPN</span>
                        </button>
                    </div>

                    {ventanasAbiertas.map(id => {
                        const config = ventanasConfig.find(v => v.id === id);
                        if (!config) return null;
                        const minimizada = ventanasMinimizadas.includes(id);
                        return (
                            <VentanaOS
                                key={id}
                                titulo={config.titulo}
                                icono={config.icono}
                                onClose={() => cerrarVentana(id)}
                                onMinimize={() => minimizarVentana(id)}
                                onFocus={() => enfocarVentana(id)}
                                initialPosition={config.posicionInicial}
                                zIndex={10 + ordenZ.indexOf(id)}
                                hidden={minimizada}
                            >
                                {config.contenido}
                            </VentanaOS>
                        );
                    })}
                </div>
                <div className={styles.barraTareas}>
                    <div className={styles.appsTareas}>
                        {ventanasAbiertas.map(id => {
                            const config = ventanasConfig.find(v => v.id === id);
                            if (!config) return null;
                            return (
                                <button
                                    key={id}
                                    className={`${styles.appTarea} ${!ventanasMinimizadas.includes(id) ? styles.appTareaActiva : ""}`}
                                    onClick={() => abrirVentana(id)}
                                    title={config.titulo}
                                >
                                    {config.icono}
                                    <span className={styles.appTareaNombre}>{config.titulo}</span>
                                </button>
                            );
                        })}
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
