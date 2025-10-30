/**
 * Se utiliza el patrón facade para ocultar la complejidad de múltiples
 * casos de uso (enviar mensaje, enviar contexto)
 */

import { ChatSession } from "../domain/models/ChatSession";
import type { GameContext } from "../domain/models/Message";
import type { IChatRepository } from "../domain/repositories/IChatRepository";
import type { IContextModeManager } from "../domain/repositories/IContextModeManager";

import { SendMessageUseCase } from "./useCases/SendMessageUseCase";
import { SendContextUseCase } from "./useCases/SendContextUseCase";
import { ToggleContextModeUseCase } from "./useCases/ToggleContextModeUseCase";

export class ChatFacade {
  private session: ChatSession;
  private sendMessageUseCase: SendMessageUseCase;
  private sendContextUseCase: SendContextUseCase;
  private toggleContextModeUseCase: ToggleContextModeUseCase;
  private changeListeners: Set<() => void> = new Set();

  constructor(
    chatRepository: IChatRepository,
    contextModeManager: IContextModeManager
  ) {
    this.session = new ChatSession();
    this.sendMessageUseCase = new SendMessageUseCase(chatRepository);
    this.sendContextUseCase = new SendContextUseCase(chatRepository);
    this.toggleContextModeUseCase = new ToggleContextModeUseCase(
      contextModeManager
    );
  }

  subscribe(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  private notifyChange(): void {
    this.changeListeners.forEach((listener) => listener());
  }

  async sendMessage(messageText: string): Promise<void> {
    await this.sendMessageUseCase.execute(messageText, this.session, () =>
      this.notifyChange()
    );
  }

  async sendContext(context: GameContext): Promise<void> {
    await this.sendContextUseCase.execute(context, this.session, () =>
      this.notifyChange()
    );
  }

  toggleContextMode(onContextSelected: (context: GameContext) => void): void {
    this.toggleContextModeUseCase.execute({
      onContextSelected,
    });
  }

  isContextModeActive(): boolean {
    return this.toggleContextModeUseCase.isActive();
  }

  getMessages() {
    return this.session.getMessages();
  }

  isTyping(): boolean {
    return this.session.getIsTyping();
  }

  getSessionId(): string {
    return this.session.sessionId;
  }

  clearMessages(): void {
    this.session.clearMessages();
  }
}
