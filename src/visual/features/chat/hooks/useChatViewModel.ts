/**
 * Este hook es el ÚNICO puente entre React y la lógica de negocio del chat.
 * Todos los componentes deben usar este hook, no acceder directamente a la lógica.
 */

import { useState, useCallback, useEffect, useMemo } from "react";

// mira que importa y sincroniza el estado del ViewModel (backend)
// con el Contexto de React (frontend)
import { useChatContext } from "../context/ChatContext";
import {
  ChatFacade,
  N8nChatRepository,
  ContextModeManager,
  type Message,
  type GameContext,
} from "../../../../chat";

export interface ChatViewModel {
  messages: readonly Message[];
  isTyping: boolean;
  isContextMode: boolean;

  sendMessage: (text: string) => Promise<void>;
  toggleContextMode: () => void;
  clearMessages: () => void;
}

/**
 * Hook que expone el ViewModel del chat
 */
export const useChatViewModel = (webhookUrl: string): ChatViewModel => {
  const { openChat, closeChat, setContextModeActive } = useChatContext();

  const chatFacade = useMemo(() => {
    const repository = new N8nChatRepository(webhookUrl);
    const contextManager = new ContextModeManager();
    return new ChatFacade(repository, contextManager);
  }, [webhookUrl]);

  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isContextMode, setIsContextMode] = useState(false);

  const syncState = useCallback(() => {
    setMessages(chatFacade.getMessages());
    setIsTyping(chatFacade.isTyping());
    setIsContextMode(chatFacade.isContextModeActive());
  }, [chatFacade]); // cada vez que chatFacade notifica un cambio, sincroniza el estado local

  /* Maneja la selección de contexto desde el DOM */
  const handleContextSelected = useCallback(
    async (context: GameContext) => {
      try {
        openChat();
        await chatFacade.sendContext(context);
      } catch (error) {
        console.error("Error al enviar contexto:", error);
        syncState();
      }
    },
    [chatFacade, syncState, openChat]
  );

  /**
   * Envía un mensaje de texto
   */
  const sendMessage = useCallback(
    async (text: string) => {
      try {
        // La facade notificará cambios automáticamente durante la ejecución
        await chatFacade.sendMessage(text);
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        syncState();
      }
    },
    [chatFacade, syncState]
  );

  /**
   * Alterna el modo de selección de contexto
   */
  const toggleContextMode = useCallback(() => {
    const wasActive = chatFacade.isContextModeActive();

    // Toggle con callback
    chatFacade.toggleContextMode(handleContextSelected);

    // Sincronizar estado
    const isNowActive = chatFacade.isContextModeActive();
    setIsContextMode(isNowActive);
    setContextModeActive(isNowActive);

    // Si se activó, cerrar el chat
    if (!wasActive && isNowActive) {
      closeChat();
    }
  }, [chatFacade, handleContextSelected, closeChat, setContextModeActive]);

  /**
   * Limpia todos los mensajes
   */
  const clearMessages = useCallback(() => {
    chatFacade.clearMessages();
    syncState();
  }, [chatFacade, syncState]);

  // Sincronización inicial y suscripción a cambios
  useEffect(() => {
    syncState();

    // Suscribirse a cambios en el facade
    const unsubscribe = chatFacade.subscribe(() => {
      syncState();
    });

    return unsubscribe;
  }, [syncState, chatFacade]);

  return {
    messages,
    isTyping,
    isContextMode,
    sendMessage,
    toggleContextMode,
    clearMessages,
  };
};
