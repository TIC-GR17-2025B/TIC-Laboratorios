import React from 'react';
import { useChatViewModel } from '../hooks/useChatViewModel';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import styles from '../styles/ChatContainer.module.css';

interface ChatContainerProps {
  webhookUrl: string;
  isOpen?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  webhookUrl,
  isOpen = true
}) => {
  // solo llama el hook para obtener el ViewModel
  // El ViewModel maneja TODA la lógica
  const viewModel = useChatViewModel(webhookUrl);

  return (
    <div className={`${styles.chatContainer} ${isOpen ? styles.open : styles.closed}`}>
      <MessageList
        messages={viewModel.messages}
        isTyping={viewModel.isTyping}
      />
      <MessageInput
        onSendMessage={viewModel.sendMessage}
        disabled={viewModel.isTyping}
        isContextMode={viewModel.isContextMode}
        onToggleContextMode={viewModel.toggleContextMode}
      />
    </div>
  );
};

export default ChatContainer;
