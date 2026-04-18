import { useState, useMemo, useCallback, type ReactNode } from "react";
import styles from "../styles/ModalApps.module.css";
import { useEscenario } from "../../../common/contexts";
import { useAppsDispositivo } from "../hooks";
import NetScanVizIcon from "../../../common/icons/NetScanVizIcon";
import ConexionIcon from "../../../common/icons/ConexionIcon";
import RedesIcon from "../../../common/icons/RedesIcon";
import ShieldCheckIcon from "../../../common/icons/ShieldCheckIcon";

type Tab = 'repositorio' | 'instaladas';

const APP_ICONS: Record<string, ReactNode> = {
    "Net-Scan Viz": <NetScanVizIcon size={44} />,
    "Company Social-Searcher": <span style={{ color: '#42A5F5' }}><ConexionIcon size={44} /></span>,
    "Phish-Matic": <span style={{ color: '#EF5350' }}><RedesIcon size={44} /></span>,
    "FirmaChecker": <span style={{ color: '#4DB6AC' }}><ShieldCheckIcon size={44} /></span>,
};

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

    const [loadingApp, setLoadingApp] = useState<string | null>(null);

    const handleInstall = useCallback((nombre: string) => {
        setLoadingApp(nombre);
        setTimeout(() => {
            comprarApp(nombre);
            setLoadingApp(null);
        }, 800);
    }, [comprarApp]);

    const handleUninstall = useCallback((nombre: string) => {
        setLoadingApp(nombre);
        setTimeout(() => {
            desinstalarApp(nombre);
            setLoadingApp(null);
        }, 800);
    }, [desinstalarApp]);

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

    const getAppIcon = (nombre: string) => {
        return APP_ICONS[nombre] ?? nombre.slice(0, 2).toUpperCase();
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
                    Explorar
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
                                <div className={styles.appIcon}>
                                    {getAppIcon(app.nombre)}
                                </div>
                                <div className={styles.appInfo}>
                                    <div className={styles.appName}>{app.nombre}</div>
                                    <div className={styles.appDesc}>{app.descripcion}</div>
                                </div>
                                <div className={styles.appAction}>
                                    {activeTab === 'repositorio' ? (
                                        <button
                                            className={`${styles.btn} ${loadingApp === app.nombre ? styles.btnLoading : styles.btnInstall}`}
                                            onClick={() => handleInstall(app.nombre)}
                                            disabled={loadingApp !== null}
                                        >
                                            {loadingApp === app.nombre ? <><span className={styles.spinner} />Instalando</> : "Obtener"}
                                        </button>
                                    ) : (
                                        <button
                                            className={`${styles.btn} ${loadingApp === app.nombre ? styles.btnLoading : styles.btnRemove}`}
                                            onClick={() => handleUninstall(app.nombre)}
                                            disabled={loadingApp !== null}
                                        >
                                            {loadingApp === app.nombre ? <><span className={styles.spinner} />Desinstalando</> : "Desinstalar"}
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
