import React from 'react';
import EstrellasIcon from '../../../../common/icons/EstrellasIcon';
import styles from '../../styles/ChatToggleButton.module.css';

interface ChatToggleButtonProps {
  isOpen: boolean;
  isContextModeActive: boolean;
  onToggle: () => void;
}

const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({ 
  isOpen, 
  isContextModeActive,
  onToggle, 
}) => {
  // El botón está "activo" (azul) si el chat está abierto O si el modo contexto está activo
  const isActive = isOpen || isContextModeActive;
  
  return (
        <button 
            onClick={onToggle}
            aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
            data-chat-toggle="true"
            className={isActive ? styles.buttonActive : ''}
        >
            Chatbot <EstrellasIcon />
        </button>
    );
};

export default ChatToggleButton;
