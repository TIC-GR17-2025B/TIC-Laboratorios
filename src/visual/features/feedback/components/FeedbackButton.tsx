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
    idEscenario: number;
    disabled?: boolean;
    onFeedbackGenerated?: (feedback: FeedbackData) => void;
}

export function FeedbackButton({ idEstudiante, idEscenario, disabled, onFeedbackGenerated }: FeedbackButtonProps) {
    const { generateFeedback, loading } = useGenerateFeedback();
    const { habilitado, loading: checkingStatus, refetch } = useFeedback(idEstudiante, idEscenario);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const response = await generateFeedback(idEstudiante, idEscenario);

        if (response && response.feedback) {
            // Consultar backend para obtener estado actualizado
            await refetch();

            // Llamar al callback con el feedback
            if (onFeedbackGenerated) {
                onFeedbackGenerated(response.feedback);
            }
        }
    };

    const isDisabled = loading || disabled || !habilitado || checkingStatus;

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
