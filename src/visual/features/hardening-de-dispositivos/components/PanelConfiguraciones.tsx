import { useState, useMemo, useEffect } from 'react';
import styles from '../styles/PanelConfiguraciones.module.css';
import CheckableItem from '../../../common/components/CheckableItem';
import obtenerConfiguraciones from '../utils/obtenerConfiguraciones';
import { useEscenario } from '../../../common/contexts';
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext';

export default function PanelConfiguraciones() {
    const baseConfiguraciones = useMemo(() => obtenerConfiguraciones(), []);
    const [checkedItems, setCheckedItems] = useState<boolean[]>(
        new Array(baseConfiguraciones.length).fill(false)
    );

    const { toggleConfigWorkstation } = useECSSceneContext();
    const { dispositivoSeleccionado } = useEscenario();

    // Cuando cambia el dispositivo seleccionado, inicializamos los checks desde sus configuraciones
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

    const handleCheckChange = (index: number, checked: boolean, configuracion: string) => {
        const entidadId = (dispositivoSeleccionado as unknown as { entidadId?: number })?.entidadId;
        if (typeof entidadId !== 'number') {
            console.warn('No hay entidad seleccionada para aplicar la configuración:', configuracion);
            return;
        }

        toggleConfigWorkstation(entidadId, configuracion);
        console.log(`Toggle configuración: ${configuracion}, Nuevo estado: ${checked} para entidad: ${entidadId}`);
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = checked;
        setCheckedItems(newCheckedItems);
    };

    return <div className={styles.contenedor}>
        <div className={styles.header}>
            <h2> Configuraciones</h2>
        </div>
        <div className={styles.listaConfiguraciones}>
            {baseConfiguraciones.map((configuracion, index) => (
                <CheckableItem
                    key={index}
                    label={configuracion.configuracion}
                    price={configuracion.precio}
                    checked={checkedItems[index]}
                    onChange={(checked) => handleCheckChange(index, checked, configuracion.configuracion)}
                />
            ))}
        </div>
    </div>;
}
