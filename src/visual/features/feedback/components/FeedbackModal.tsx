import { useEffect } from 'react';
import styles from './FeedbackModal.module.css';

interface FeedbackData {
    analisis: string;
    fortaleza: string;
    area_mejora: string;
    consejo: string;
}

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: FeedbackData | null;
    escenarioNombre?: string;
}

export function FeedbackModal({ isOpen, onClose, feedback, escenarioNombre }: FeedbackModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !feedback) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.icon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                <path d="M8 10h.01M12 10h.01M16 10h.01" />
                            </svg>
                        </div>
                        <div>
                            <h2>Retroalimentación Generada</h2>
                            {escenarioNombre && <p className={styles.subtitle}>{escenarioNombre}</p>}
                        </div>
                    </div>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                            </svg>
                            <h3>Análisis General</h3>
                        </div>
                        <p className={styles.text}>{feedback.analisis}</p>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <h3>Fortalezas</h3>
                        </div>
                        <p className={styles.text}>{feedback.fortaleza}</p>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <h3>Áreas de Mejora</h3>
                        </div>
                        <p className={styles.text}>{feedback.area_mejora}</p>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <h3>Consejo</h3>
                        </div>
                        <p className={styles.text}>{feedback.consejo}</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.primaryButton} onClick={onClose}>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
