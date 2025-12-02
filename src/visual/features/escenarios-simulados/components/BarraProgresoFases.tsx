import GreenCheckBox from '../../../common/components/GreenCheckBox';
import styles from '../styles/BarraProgresoFases.module.css';

interface BarraProgresoFasesProps {
    totalFases: number;
    faseActual: number;
    fasesCompletadas: boolean[];
    onFaseClick: (index: number) => void;
}

export default function BarraProgresoFases({ totalFases, faseActual, fasesCompletadas, onFaseClick }: BarraProgresoFasesProps) {
    return (
        <div className={styles.barraProgreso}>
            {Array.from({ length: totalFases }).map((_, index) => {
                const esCompletada = fasesCompletadas[index];
                const esActual = index === faseActual;
                const esNavegable = esCompletada || esActual || (index > 0 && fasesCompletadas[index - 1]);

                return (
                    <div key={index} className={styles.faseItem}>
                        <div
                            className={`${styles.circulo} ${
                                esCompletada
                                    ? styles.completada
                                    : esActual
                                    ? styles.actual
                                    : styles.futura
                            } ${esNavegable ? styles.navegable : styles.bloqueada}`}
                            onClick={() => esNavegable && onFaseClick(index)}
                        >
                            <GreenCheckBox checked={esCompletada} />
                        </div>
                        {index < totalFases - 1 && (
                            <div
                                className={`${styles.linea} ${
                                    esCompletada ? styles.lineaCompletada : styles.lineaIncompleta
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
