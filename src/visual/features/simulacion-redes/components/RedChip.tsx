import styles from "../styles/RedChip.module.css";
export default function RedChip({ nombre, color }: { nombre: string; color: string }) {
    return (
        <div className={styles.redChipContainer}>
            <div className={styles.colorDot} style={{ backgroundColor: color }}></div>
            <span className={styles.redNombre}>{nombre}</span>
        </div>
    );
}