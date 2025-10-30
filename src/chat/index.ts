export { Message } from "./domain/models/Message";
export { ChatSession } from "./domain/models/ChatSession";
export type { MessageSender, GameContext } from "./domain/models/Message";

export type {
  IChatRepository,
  ChatMessagePayload,
  ChatResponse,
} from "./domain/repositories/IChatRepository";

export type {
  IContextModeManager,
  ContextModeState,
  ContextSelectedCallback,
} from "./domain/repositories/IContextModeManager";

export { ChatFacade } from "./application/ChatFacade";
export { SendMessageUseCase } from "./application/useCases/SendMessageUseCase";
export { SendContextUseCase } from "./application/useCases/SendContextUseCase";
export { ToggleContextModeUseCase } from "./application/useCases/ToggleContextModeUseCase";

export { N8nChatRepository } from "./infrastructure/repositories/N8nChatRepository";
export { ContextModeManager } from "./infrastructure/context-mode/ContextModeManager";
