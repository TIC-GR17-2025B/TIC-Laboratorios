/**
 * Solo representa un mensaje del chat
 */

export type MessageSender = "user" | "bot";

export interface GameContext {
  objectName: string;
  contextId: string;
  displayText: string;
  ariaLabel?: string;
  imageUrl?: string;
}

export class Message {
  readonly id: string;
  readonly text: string;
  readonly sender: MessageSender;
  readonly timestamp: Date;
  readonly context?: GameContext;

  constructor(
    text: string,
    sender: MessageSender,
    context?: GameContext,
    id?: string,
    timestamp?: Date
  ) {
    this.id = id || `${Date.now()}-${Math.random()}`;
    this.text = text;
    this.sender = sender;
    this.timestamp = timestamp || new Date();
    this.context = context;
  }

  static createUserMessage(text: string, context?: GameContext): Message {
    return new Message(text, "user", context);
  }

  static createBotMessage(text: string): Message {
    return new Message(text, "bot");
  }

  hasContext(): boolean {
    return this.context !== undefined;
  }

  isFromUser(): boolean {
    return this.sender === "user";
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      sender: this.sender,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}
