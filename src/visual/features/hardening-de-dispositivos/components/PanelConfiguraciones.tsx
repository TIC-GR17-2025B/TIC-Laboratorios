import { useState, useMemo } from 'react';
import styles from '../styles/PanelConfiguraciones.module.css';
import CheckableItem from '../../../common/components/CheckableItem';
import obtenerConfiguraciones from '../utils/obtenerConfiguraciones';

export default function PanelConfiguraciones() {
    const configuraciones = useMemo(() => obtenerConfiguraciones(), []);

    const [checkedItems, setCheckedItems] = useState<boolean[]>(
        new Array(configuraciones.length).fill(false)
    );

    const handleCheckChange = (index: number, checked: boolean) => {
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
                    onChange={(checked) => handleCheckChange(index, checked)}
                />
            ))}
        </div>
    </div>;
}