import styles from "../styles/Escena3D.module.css";

export default function Controles3D() {
    return (
        <aside className={styles.controles3D} aria-label="Controles de vista 3D">
            <button type="button" aria-label="Control A">A</button>
            <button type="button" aria-label="Control B">B</button>
            <button type="button" aria-label="Control C">C</button>
        </aside>
    );
}