import styles from "../styles/ModalApps.module.css";
import { useEscenario } from "../../../common/contexts";
import SoftwareIcon from "../../../common/icons/SoftwareIcon";
import CarritoIcon from "../../../common/icons/CarritoIcon";
import TrashIcon from "../../../common/icons/TrashIcon";
import { useAppsDispositivo } from "../hooks";

export default function ModalApps() {
    const { dispositivoSeleccionado } = useEscenario();
    
    const {
        appsInstaladas,
        appsDisponibles,
        presupuestoActual,
        comprarApp,
        desinstalarApp,
        puedeComprar,
    } = useAppsDispositivo(dispositivoSeleccionado?.entidadId);

    return (
        <div className={styles.modalAppsContainer}>
            <div className={styles.seccionesContainer}>
                {/* Sección de apps disponibles para comprar */}
                <section className={styles.seccion}>
                    <h3 className={styles.tituloSeccion}>
                        <CarritoIcon size={18} />
                        Apps Disponibles
                    </h3>
                    <div className={styles.listaApps}>
                        {appsDisponibles.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No hay aplicaciones disponibles para instalar</p>
                            </div>
                        ) : (
                            appsDisponibles.map((app) => (
                                <div key={app.nombre} className={styles.appItem}>
                                    <div className={styles.appIconContainer}>
                                        <SoftwareIcon size={24} />
                                    </div>
                                    <div className={styles.appDetalles}>
                                        <div className={styles.appNombre}>{app.nombre}</div>
                                        <div className={styles.appDescripcion}>{app.descripcion}</div>
                                        <div className={styles.appPrecio}>${app.precio.toLocaleString()}</div>
                                    </div>
                                    <button
                                        className={`${styles.botonAccion} ${styles.botonComprar}`}
                                        onClick={() => comprarApp(app.nombre)}
                                        disabled={!puedeComprar(app.precio)}
                                        title={puedeComprar(app.precio) ? "Comprar e instalar" : "Presupuesto insuficiente"}
                                    >
                                        <CarritoIcon size={16} />
                                        Comprar
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Sección de apps instaladas */}
                <section className={styles.seccion}>
                    <h3 className={styles.tituloSeccion}>
                        <SoftwareIcon size={18} />
                        Apps Instaladas
                    </h3>
                    <div className={styles.listaApps}>
                        {appsInstaladas.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No hay aplicaciones instaladas</p>
                            </div>
                        ) : (
                            appsInstaladas.map((app) => (
                                <div key={app.nombre} className={styles.appItem}>
                                    <div className={styles.appIconContainer}>
                                        <SoftwareIcon size={24} />
                                    </div>
                                    <div className={styles.appDetalles}>
                                        <div className={styles.appNombre}>{app.nombre}</div>
                                        <div className={styles.appDescripcion}>{app.descripcion}</div>
                                    </div>
                                    <button
                                        className={`${styles.botonAccion} ${styles.botonDesinstalar}`}
                                        onClick={() => desinstalarApp(app.nombre)}
                                        title="Desinstalar aplicación"
                                    >
                                        <TrashIcon size={16} />
                                        Desinstalar
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <div className={styles.nota}>
                <strong>Nota:</strong> Al comprar una aplicación, se instalará inmediatamente en el dispositivo y se descontará del presupuesto. 
                Al desinstalar, la aplicación estará disponible para instalar nuevamente sin costo adicional.
            </div>
        </div>
    );
}
