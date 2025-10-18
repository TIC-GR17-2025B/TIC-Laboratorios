import { useState } from 'react';
import styles from '../styles/PanelConfiguraciones.module.css';
import { configuracionesMock } from '../../../mocks/ConfiguracionesMock';
import CheckableItem from '../../../common/components/CheckableItem';
import Toggle from '../../../common/components/Toggle';

export default function PanelConfiguraciones() {
    const [checkedItems, setCheckedItems] = useState<boolean[]>(
        new Array(configuracionesMock.procedimiento.length).fill(false)
    );
    const [vistaSeleccionada, setVistaSeleccionada] = useState<string>("procedimiento");

    const handleCheckChange = (index: number, checked: boolean) => {
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = checked;
        setCheckedItems(newCheckedItems);
    };

    return <div className={styles.contenedor}>
        <div className={styles.header}>
            <h2> Configuraciones</h2>
            <Toggle
                options={[
                    { value: "procedimiento", label: "Procedimiento" },
                    { value: "ajustes", label: "Ajustes" },
                ]}
                value={vistaSeleccionada}
                onChange={(value) => setVistaSeleccionada(value)}
            />
        </div>
        <div className={styles.listaConfiguraciones}>
            {configuracionesMock[vistaSeleccionada as keyof typeof configuracionesMock].map((configuracion, index) => (
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