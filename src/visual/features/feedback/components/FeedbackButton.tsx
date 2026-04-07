import { useGenerateFeedback } from '../hooks/useGenerateFeedback';
import { useFeedback } from '../hooks/useFeedback';
import styles from './FeedbackButton.module.css';

interface FeedbackData {
    analisis: string;
    fortaleza: string;
    area_mejora: string;
    consejo: string;
}

interface FeedbackButtonProps {
    idEstudiante: number;
    slugEscenario: string;
    disabled?: boolean;
    onFeedbackGenerated?: (feedback: FeedbackData) => void;
}

export function FeedbackButton({ idEstudiante, slugEscenario, disabled, onFeedbackGenerated }: FeedbackButtonProps) {
    const { generateFeedback, loading } = useGenerateFeedback();
    const { habilitado, loading: checkingStatus, refetch } = useFeedback(idEstudiante, slugEscenario);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (import.meta.env.DEV) {
            const mockFeedback: FeedbackData = {
                analisis: 'El estudiante muestra un patron recurrente de intentos fallidos en la fase de reconocimiento del escenario. Los logs indican que no se ejecutaron comandos de escaneo de puertos antes de intentar explotar vulnerabilidades, lo que sugiere una falta de metodologia estructurada en la fase inicial del pentesting.',
                fortaleza: 'Se observa persistencia en los intentos y una mejora progresiva en los tiempos de respuesta entre cada intento. El estudiante demuestra familiaridad con las herramientas basicas de linea de comandos y logra identificar servicios activos en el sistema objetivo.',
                area_mejora: 'Es necesario reforzar la fase de enumeracion antes de proceder con la explotacion. Se recomienda seguir una metodologia como OWASP o PTES para estructurar cada intento de forma sistematica, asegurando que no se omitan pasos criticos.',
                consejo: 'Antes de cada intento, dedica al menos 2 minutos a la fase de reconocimiento. Utiliza herramientas como nmap para escaneo de puertos y servicios. Documenta los hallazgos antes de proceder con cualquier vector de ataque.',
            };
            onFeedbackGenerated?.(mockFeedback);
            return;
        }

        const response = await generateFeedback(idEstudiante, slugEscenario);

        if (response && response.feedback) {
            await refetch();

            if (onFeedbackGenerated) {
                onFeedbackGenerated(response.feedback);
            }
        }
    };

    const isDisabled = import.meta.env.DEV ? (loading || disabled) : (loading || disabled || !habilitado || checkingStatus);

    return (
        <button
            className={styles.feedbackButton}
            onClick={handleClick}
            disabled={isDisabled}
            title={
                !habilitado
                    ? "Ya generaste retroalimentación para estos intentos. Realiza uno nuevo para generar otra."
                    : "Generar retroalimentación con IA"
            }
        >
            {loading ? (
                <>
                    <span className={styles.spinner}></span>
                </>
            ) : (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <path d="M8 10h.01M12 10h.01M16 10h.01" />
                    </svg>
                </>
            )}
        </button>
    );
}
