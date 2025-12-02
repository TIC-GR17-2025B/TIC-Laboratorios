import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import styles from "../styles/VistaSeleccionNiveles.module.css";

export default function VistaSeleccionNiveles() {
    return <div className={styles.container}>
        <h1>Selección de Escenarios</h1>
        <LevelSelectionMenuList />
    </div>
    }