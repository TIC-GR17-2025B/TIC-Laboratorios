import { useState, useMemo } from "react";
import styles from "../styles/ModalApps.module.css";
import { useEscenario } from "../../../common/contexts";
import { useAppsDispositivo } from "../hooks";

type Tab = 'repositorio' | 'instaladas';

const ICON_COLORS = ['green', 'purple', 'blue', 'orange'] as const;

export default function ModalApps() {
    const { dispositivoSeleccionado } = useEscenario();
    const [activeTab, setActiveTab] = useState<Tab>('repositorio');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        appsInstaladas,
        appsDisponibles,
        comprarApp,
        desinstalarApp,
    } = useAppsDispositivo(dispositivoSeleccionado?.entidadId);

    // Filtrar apps por búsqueda
    const filteredApps = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const apps = activeTab === 'repositorio' ? appsDisponibles : appsInstaladas;

        if (!query) return apps;
        return apps.filter(app =>
            app.nombre.toLowerCase().includes(query) ||
            app.descripcion.toLowerCase().includes(query)
        );
    }, [activeTab, appsDisponibles, appsInstaladas, searchQuery]);

    // Obtener iniciales para el icono
    const getInitials = (nombre: string) => {
        return nombre.slice(0, 2).toUpperCase();
    };

    // Obtener color basado en el nombre
    const getIconColor = (nombre: string) => {
        const index = nombre.charCodeAt(0) % ICON_COLORS.length;
        return ICON_COLORS[index];
    };

    return (
        <div className={styles.container}>
            <div className={styles.searchBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar aplicaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'repositorio' ? styles.active : ''}`}
                    onClick={() => setActiveTab('repositorio')}
                >
                    Repositorio
                    <span className={styles.count}>{appsDisponibles.length}</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'instaladas' ? styles.active : ''}`}
                    onClick={() => setActiveTab('instaladas')}
                >
                    Instaladas
                    <span className={styles.count}>{appsInstaladas.length}</span>
                </button>
            </div>

            <div className={styles.content}>
                {filteredApps.length === 0 ? (
                    <div className={styles.emptyState}>
                        {searchQuery
                            ? 'No se encontraron aplicaciones'
                            : activeTab === 'repositorio'
                                ? 'No hay aplicaciones disponibles'
                                : 'No hay aplicaciones instaladas'
                        }
                    </div>
                ) : (
                    <div className={styles.appList}>
                        {filteredApps.map((app) => (
                            <div key={app.nombre} className={styles.appCard}>
                                <div className={`${styles.appIcon} ${styles[getIconColor(app.nombre)]}`}>
                                    {getInitials(app.nombre)}
                                </div>
                                <div className={styles.appInfo}>
                                    <div className={styles.appName}>{app.nombre}</div>
                                    <div className={styles.appDesc}>{app.descripcion}</div>
                                </div>
                                <div className={styles.appAction}>
                                    {activeTab === 'repositorio' ? (
                                        <button
                                            className={`${styles.btn} ${styles.btnInstall}`}
                                            onClick={() => comprarApp(app.nombre)}
                                        >
                                            Instalar
                                        </button>
                                    ) : (
                                        <button
                                            className={`${styles.btn} ${styles.btnRemove}`}
                                            onClick={() => desinstalarApp(app.nombre)}
                                        >
                                            Quitar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
