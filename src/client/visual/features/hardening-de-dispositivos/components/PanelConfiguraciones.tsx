import { useState, useMemo, useEffect, type ReactNode } from 'react';
import styles from '../styles/PanelConfiguraciones.module.css';
import obtenerConfiguraciones from '../utils/obtenerConfiguraciones';
import { useEscenario } from '../../../common/contexts';
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext';
import ShieldCheckIcon from '../../../common/icons/ShieldCheckIcon';
import SistemaOpIcon from '../../../common/icons/SistemaOpIcon';
import KeyIcon from '../../../common/icons/KeyIcon';
import ComputadoraIcon from '../../../common/icons/ComputadoraIcon';

/* ── Iconos inline ── */

function StorageIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="10" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="11" cy="4" r="0.75" fill="currentColor" />
            <circle cx="11" cy="12" r="0.75" fill="currentColor" />
        </svg>
    );
}

function PolicyIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 2.5H12C12.5523 2.5 13 2.94772 13 3.5V12.5C13 13.0523 12.5523 13.5 12 13.5H4C3.44772 13.5 3 13.0523 3 12.5V3.5C3 2.94772 3.44772 2.5 4 2.5Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 5.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5.5 8H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5.5 10.5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

/* ── Definición de categorías ── */

interface Categoria {
    titulo: string;
    icono: ReactNode;
    configs: string[];
}

const CATEGORIAS: Categoria[] = [
    {
        titulo: 'Antivirus',
        icono: <ShieldCheckIcon size={15} />,
        configs: [
            'Actualizaciones automáticas de antivirus',
            'Antivirus gestionado',
        ],
    },
    {
        titulo: 'Parches y actualizaciones',
        icono: <SistemaOpIcon size={15} />,
        configs: [
            'Usuario aplica parches',
            'Actualización automática de parches',
            'Actualizar parches al publicarse',
            'Actualización regular de parches',
        ],
    },
    {
        titulo: 'Contraseñas y autenticación',
        icono: <KeyIcon size={15} />,
        configs: [
            'Aplicar política de contraseñas',
            'Usar contraseña única',
        ],
    },
    {
        titulo: 'Seguridad de sesión',
        icono: <ComputadoraIcon size={15} />,
        configs: [
            'Bloqueo automático por inactividad',
            'Bloquear o cerrar sesión por inactividad',
        ],
    },
    {
        titulo: 'Almacenamiento y medios',
        icono: <StorageIcon size={15} />,
        configs: [
            'Bloquear medios extraíbles',
            'Bloquear almacenamiento local',
        ],
    },
    {
        titulo: 'Políticas adicionales',
        icono: <PolicyIcon size={15} />,
        configs: [
            'Cuidado con adjuntos de email',
            'Sin software externo',
        ],
    },
];

/* ── Componente principal ── */

export default function PanelConfiguraciones() {
    const baseConfiguraciones = useMemo(() => obtenerConfiguraciones(), []);
    const [checkedItems, setCheckedItems] = useState<boolean[]>(
        new Array(baseConfiguraciones.length).fill(false)
    );
    const [searchQuery, setSearchQuery] = useState('');

    const { toggleConfigWorkstation } = useECSSceneContext();
    const { dispositivoSeleccionado } = useEscenario();

    // Sync checks cuando cambia el dispositivo seleccionado
    useEffect(() => {
        if (!dispositivoSeleccionado || !dispositivoSeleccionado.configuraciones) {
            setCheckedItems(new Array(baseConfiguraciones.length).fill(false));
            return;
        }

        const newChecked = baseConfiguraciones.map((cfg) => {
            const confs = dispositivoSeleccionado.configuraciones as unknown;
            const arr = Array.isArray(confs) ? (confs as unknown[]) : [];
            const found = arr.find((c) => ((c as unknown as Record<string, unknown>)?.nombreConfig as string | undefined) === cfg.configuracion);
            return found ? !!((found as unknown as Record<string, unknown>).activado as boolean | undefined) : false;
        });

        setCheckedItems(newChecked);
    }, [dispositivoSeleccionado, baseConfiguraciones]);

    const handleToggle = (index: number, configuracion: string) => {
        const entidadId = (dispositivoSeleccionado as unknown as { entidadId?: number })?.entidadId;
        if (typeof entidadId !== 'number') {
            console.warn('No hay entidad seleccionada para aplicar la configuración:', configuracion);
            return;
        }

        toggleConfigWorkstation(entidadId, configuracion);
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = !newCheckedItems[index];
        setCheckedItems(newCheckedItems);
    };

    // Índice rápido: nombre → posición en baseConfiguraciones
    const configIndex = useMemo(() => {
        const map = new Map<string, number>();
        baseConfiguraciones.forEach((cfg, i) => map.set(cfg.configuracion, i));
        return map;
    }, [baseConfiguraciones]);

    // Filtrar categorías por búsqueda
    const query = searchQuery.toLowerCase();
    const categoriasVisibles = CATEGORIAS.map((cat) => {
        const items = cat.configs
            .map((nombre) => {
                const idx = configIndex.get(nombre);
                if (idx === undefined) return null;
                return { nombre, idx };
            })
            .filter((item): item is NonNullable<typeof item> =>
                item !== null && (!query || item.nombre.toLowerCase().includes(query))
            );
        return { ...cat, items };
    }).filter((cat) => cat.items.length > 0);

    return (
        <div className={styles.contenedor}>
            {/* Search bar */}
            <div className={styles.searchBar}>
                <span className={styles.searchIcon}>
                    <SearchIcon size={14} />
                </span>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar configuración..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {categoriasVisibles.length === 0 ? (
                <div className={styles.emptyState}>
                    No se encontraron configuraciones
                </div>
            ) : (
                categoriasVisibles.map((cat) => (
                    <div key={cat.titulo} className={styles.seccion}>
                        <div className={styles.seccionHeader}>
                            <span className={styles.seccionIcono}>{cat.icono}</span>
                            <h3 className={styles.seccionTitulo}>{cat.titulo}</h3>
                        </div>
                        <div className={styles.seccionCard}>
                            {cat.items.map(({ nombre, idx }) => (
                                <div
                                    key={idx}
                                    className={styles.configRow}
                                    onClick={() => handleToggle(idx, nombre)}
                                    data-context={nombre.toLowerCase()}
                                    data-object-name={`Configuración: ${nombre}`}
                                >
                                    <span className={styles.configNombre}>{nombre}</span>
                                    <label className={styles.toggle} onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className={styles.toggleInput}
                                            checked={checkedItems[idx]}
                                            onChange={() => handleToggle(idx, nombre)}
                                        />
                                        <span className={styles.toggleTrack} />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
