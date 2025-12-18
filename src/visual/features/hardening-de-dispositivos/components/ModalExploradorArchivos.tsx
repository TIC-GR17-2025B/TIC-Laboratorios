import { useEffect, useState, useRef } from "react";
import styles from "../styles/ModalExploradorArchivos.module.css";
import { useEscenario } from "../../../common/contexts";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import type { Activo } from "../../../../types/EscenarioTypes";
import ActivosIcon from "../../../common/icons/ActivosIcon";
import TrashIcon from "../../../common/icons/TrashIcon";

interface MenuContextual {
    visible: boolean;
    x: number;
    y: number;
    archivo: string | null;
}

export default function ModalExploradorArchivos() {
    const [activos, setActivos] = useState<Activo[]>([]);
    const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);
    const [menuContextual, setMenuContextual] = useState<MenuContextual>({
        visible: false,
        x: 0,
        y: 0,
        archivo: null
    });

    const { entidadSeleccionadaId } = useEscenario();
    const { escenarioController } = useECSSceneContext();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (entidadSeleccionadaId !== null) {
            const activosDispositivo = escenarioController.getActivosDeDispositivo(entidadSeleccionadaId);
            if (activosDispositivo) {
                setActivos([...activosDispositivo]);
                if (activosDispositivo.length > 0) {
                    setActivoSeleccionado(activosDispositivo[0]);
                }
            }
        }
    }, [entidadSeleccionadaId, escenarioController]);

    // Cerrar menú contextual al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuContextual({ visible: false, x: 0, y: 0, archivo: null });
            }
        };

        if (menuContextual.visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuContextual.visible]);

    const handleContextMenu = (e: React.MouseEvent, activo: Activo) => {
        e.preventDefault();
        setMenuContextual({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            archivo: activo.nombre
        });
    };

    const handleEliminarActivo = () => {
        if (entidadSeleccionadaId !== null && menuContextual.archivo) {
            escenarioController.eliminarActivoDeDispositivo(entidadSeleccionadaId, menuContextual.archivo);

            // Actualizar la lista local
            const activosActualizados = activos.filter(a => a.nombre !== menuContextual.archivo);
            setActivos(activosActualizados);

            // Si el activo eliminado era el seleccionado, seleccionar otro
            if (activoSeleccionado?.nombre === menuContextual.archivo) {
                setActivoSeleccionado(activosActualizados.length > 0 ? activosActualizados[0] : null);
            }

            setMenuContextual({ visible: false, x: 0, y: 0, archivo: null });
        }
    };

    const handleClickArchivo = (activo: Activo) => {
        setActivoSeleccionado(activo);
        setMenuContextual({ visible: false, x: 0, y: 0, archivo: null });
    };

    return (
        <div className={styles.contenedor}>
            <div className={styles.panelIzquierdo}>
                {activos.length === 0 ? (
                    <div className={styles.sinArchivos}>
                        <p>No hay archivos en este dispositivo</p>
                    </div>
                ) : (
                    <div className={styles.listaArchivos}>
                        {activos.map((activo) => (
                            <div
                                key={activo.nombre}
                                className={`${styles.itemArchivo} ${activoSeleccionado?.nombre === activo.nombre ? styles.seleccionado : ""
                                    }`}
                                onClick={() => handleClickArchivo(activo)}
                                onContextMenu={(e) => handleContextMenu(e, activo)}
                            >
                                <ActivosIcon size={16} />
                                <span className={styles.nombreArchivo}>{activo.nombre}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.panelDerecho}>
                {activoSeleccionado ? (
                    <div className={styles.visorDocumento}>
                        <div className={styles.documento}>
                            <pre>{activoSeleccionado.contenido}</pre>
                        </div>
                    </div>
                ) : (
                    <div className={styles.sinSeleccion}>
                        <ActivosIcon size={48} />
                        <p>Selecciona un archivo para ver su contenido</p>
                    </div>
                )}
            </div>

            {menuContextual.visible && (
                <div
                    ref={menuRef}
                    className={styles.menuContextual}
                    style={{ top: menuContextual.y, left: menuContextual.x }}
                >
                    <div className={styles.menuItem} onClick={handleEliminarActivo}>
                        <TrashIcon size={16} />
                        <span>Eliminar</span>
                    </div>
                </div>
            )}
        </div>
    );
}
