import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import UserMenu from "../../admin-docente-y-estudiante/components/UserMenu";
import styles from "../styles/VistaSeleccionNiveles.module.css";

export default function VistaSeleccionNiveles() {

    return <div className={styles.container}>
        <div className={styles.header}>
            <h1>Selección de Escenarios</h1>
            <UserMenu />
        </div>
        <LevelSelectionMenuList />
    </div>
}