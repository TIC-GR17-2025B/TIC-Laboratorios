import React from 'react';
import type { Message } from '../../types/chat.types';
import styles from '../../styles/MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${styles.messageBubble} ${styles[message.sender]}`}>
      <div className={styles.messageContent}>
        {/* Mostrar contexto si existe */}
        {message.context && (
          <div className={styles.messageContext}>
            {message.context.imageUrl && (
              <img 
                src={message.context.imageUrl} 
                alt={message.context.displayText || message.context.contextId}
                className={styles.messageContextImage}
              />
            )}
            <div className={styles.messageContextInfo}>
              <strong>{message.context.contextId}</strong>
            </div>
          </div>
        )}
        <p>{message.text}</p>
        <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
