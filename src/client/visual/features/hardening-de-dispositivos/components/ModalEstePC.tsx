import { useEscenario } from "../../../common/contexts";
import styles from "../styles/ModalEstePC.module.css";

function InfoCircleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9 8v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="9" cy="5.75" r="0.85" fill="currentColor" />
        </svg>
    );
}

function WindowsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="0.5" fill="currentColor" />
            <rect x="10" y="2" width="6" height="6" rx="0.5" fill="currentColor" />
            <rect x="2" y="10" width="6" height="6" rx="0.5" fill="currentColor" />
            <rect x="10" y="10" width="6" height="6" rx="0.5" fill="currentColor" />
        </svg>
    );
}

function NetworkIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2.5 9h13M9 2.5c-2.2 2-2.2 11 0 13M9 2.5c2.2 2 2.2 11 0 13" stroke="currentColor" strokeWidth="1.1" />
        </svg>
    );
}

export default function ModalEstePC() {
    const { dispositivoSeleccionado } = useEscenario();

    if (!dispositivoSeleccionado) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>No hay dispositivo seleccionado</div>
            </div>
        );
    }

    const redes = dispositivoSeleccionado.redes ?? [];

    return (
        <div className={styles.container}>
            {/* Header card */}
            <div className={styles.headerCard}>
                <div className={styles.headerLeft}>
                    <span className={styles.headerName}>{dispositivoSeleccionado.nombre ?? "Sin nombre"}</span>
                    <span className={styles.headerHardware}>{dispositivoSeleccionado.hardware || dispositivoSeleccionado.tipo}</span>
                </div>
            </div>

            {/* Device specifications */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionIcon}><InfoCircleIcon /></span>
                    <span className={styles.sectionTitle}>Especificaciones del dispositivo</span>
                </div>
                <div className={styles.specRows}>
                    <div className={styles.specRow}>
                        <span className={styles.specLabel}>Nombre del dispositivo</span>
                        <span className={styles.specValue}>{dispositivoSeleccionado.nombre ?? "Sin nombre"}</span>
                    </div>
                    <div className={styles.specRow}>
                        <span className={styles.specLabel}>Tipo</span>
                        <span className={styles.specValue}>{dispositivoSeleccionado.tipo}</span>
                    </div>
                    <div className={styles.specRow}>
                        <span className={styles.specLabel}>Hardware</span>
                        <span className={styles.specValue}>{dispositivoSeleccionado.hardware || "No especificado"}</span>
                    </div>
                    <div className={styles.specRow}>
                        <span className={styles.specLabel}>ID de entidad</span>
                        <span className={styles.specValue}>{dispositivoSeleccionado.entidadId}</span>
                    </div>
                </div>
            </div>

            {/* OS specifications */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionIcon}><WindowsIcon /></span>
                    <span className={styles.sectionTitle}>Especificaciones del sistema operativo</span>
                </div>
                <div className={styles.specRows}>
                    <div className={styles.specRow}>
                        <span className={styles.specLabel}>Sistema operativo</span>
                        <span className={styles.specValue}>{dispositivoSeleccionado.sistemaOperativo ?? "No especificado"}</span>
                    </div>
                </div>
            </div>

            {/* Connected networks */}
            {redes.length > 0 && (
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionIcon}><NetworkIcon /></span>
                        <span className={styles.sectionTitle}>Redes conectadas</span>
                    </div>
                    <div className={styles.specRows}>
                        {redes.map(red => (
                            <div key={red.nombre} className={styles.networkRow}>
                                <span className={styles.networkDot} style={{ backgroundColor: red.color }} />
                                <span className={styles.networkName}>{red.nombre}</span>
                                <span className={styles.networkStatus}>Conectado</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
