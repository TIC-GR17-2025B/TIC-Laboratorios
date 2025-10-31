import React from 'react';
import ChatContainer from './ChatContainer';
import { useChatContext } from '../context/ChatContext';
import styles from '../styles/FloatingChat.module.css';


const FloatingChat: React.FC = () => {
  const { isChatOpen } = useChatContext();

  return (
    <div className={`${styles.floatingChatWrapper} ${!isChatOpen ? styles.hidden : ''}`}>
      <ChatContainer
        isOpen={isChatOpen}
        webhookUrl="https://pymwebhooks.pymbots.com/webhook/5b947366-065c-4f88-878b-176f8ebdf392"
      />
    </div>
  );
};

export default FloatingChat;
