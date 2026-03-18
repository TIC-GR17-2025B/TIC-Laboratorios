import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import styles from "../styles/VistaSeleccionNiveles.module.css";

export default function VistaSeleccionNiveles() {
    return (
        <div className={styles.main}>
            <LevelSelectionMenuList />
        </div>
    );
}
