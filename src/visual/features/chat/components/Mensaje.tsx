import React from 'react';
import styles from '../styles/MessageBubble.module.css';
import type { Message } from '../../../../chat';

interface MessageBubbleProps {
  message: Message;
}

const Mensaje: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${styles.messageBubble} ${styles[message.sender]}`}>
      <div className={styles.messageContent}>
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

export default Mensaje;
