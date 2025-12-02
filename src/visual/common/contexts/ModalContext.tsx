import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ModalContextType {
    isOpen: boolean;
    modalContent: ReactNode | null;
    modalTitle: string | null;
    dismissible: boolean;
    showHeader: boolean;
    openModal: (content: ReactNode, title?: string, dismissible?: boolean, showHeader?: boolean) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
    children: ReactNode;
}

/**
 * Provider que gestiona el estado global del modal
 */
export function ModalProvider({ children }: ModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const [modalTitle, setModalTitle] = useState<string | null>(null);
    const [dismissible, setDismissible] = useState(true);
    const [showHeader, setShowHeader] = useState(true);

    const openModal = (content: ReactNode, title?: string, dismissible: boolean = true, showHeader: boolean = true) => {
        setModalContent(content);
        setModalTitle(title || null);
        setDismissible(dismissible);
        setShowHeader(showHeader);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        // Pequeño delay antes de limpiar el contenido para permitir animaciones
        setTimeout(() => {
            setModalContent(null);
            setModalTitle(null);
            setDismissible(true);
            setShowHeader(true);
        }, 300);
    };

    return (
        <ModalContext.Provider value={{ isOpen, modalContent, modalTitle, dismissible, showHeader, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
}

/**
 * Hook para usar el contexto del modal
 * 
 * @example
 * const { openModal, closeModal } = useModal();
 * 
 * // Abrir modal con contenido personalizado y título
 * openModal(<ModalFirewall />, 'Configuración de Firewall');
 * 
 * // Abrir modal sin título
 * openModal(<ModalFirewall />);
 * 
 * // Cerrar modal
 * closeModal();
 */
export function useModal(): ModalContextType {
    const context = useContext(ModalContext);

    if (context === undefined) {
        throw new Error('useModal debe ser usado dentro de un ModalProvider');
    }

    return context;
}
