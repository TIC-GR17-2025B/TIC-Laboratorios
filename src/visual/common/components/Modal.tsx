import { useModal } from '../contexts/ModalContext';
import style from '../styles/Modal.module.css';
/**
 * Componente contenedor del modal
 * Se renderiza en el root de la aplicación y muestra el contenido dinámico
 */
export default function Modal() {
    const { isOpen, modalContent, modalTitle, closeModal } = useModal();

    if (!isOpen) return null;

    return (
        <>
            <div className={style.modalOverlay} onClick={closeModal} />
            <div className={style.modalContainer}>
                <div className={style.modalHeader}>
                    {modalTitle && <h2 className={style.modalTitle}>{modalTitle}</h2>}
                    <button className={style.modalCloseButton} onClick={closeModal} aria-label="Cerrar modal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <div className={style.modalContent}>
                    {modalContent}
                </div>
            </div>
        </>
    );
}
