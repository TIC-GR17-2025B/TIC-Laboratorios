import { useState, useMemo } from 'react';
import styles from '../styles/PanelConfiguraciones.module.css';
import CheckableItem from '../../../common/components/CheckableItem';
import obtenerConfiguraciones from '../utils/obtenerConfiguraciones';
import { useEscenario } from '../../../common/contexts';
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext';

export default function PanelConfiguraciones() {
    const configuraciones = useMemo(() => obtenerConfiguraciones(), []);
    const [checkedItems, setCheckedItems] = useState<boolean[]>(
        new Array(configuraciones.length).fill(false)
    );

    const { toggleConfigWorkstation } = useECSSceneContext();
    const { dispositivoSeleccionado } = useEscenario();

    const handleCheckChange = (index: number, checked: boolean, configuracion: string) => {
        toggleConfigWorkstation((dispositivoSeleccionado as any).entidadId, configuracion);
        console.log(`Toggle configuración: ${configuracion}, Nuevo estado: ${checked} para entidad: ${(dispositivoSeleccionado as any).entidadId} `);
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = checked;
        setCheckedItems(newCheckedItems);
    };

    return <div className={styles.contenedor}>
        <div className={styles.header}>
            <h2> Configuraciones</h2>
        </div>
        <div className={styles.listaConfiguraciones}>
            {configuraciones.map((configuracion, index) => (
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
