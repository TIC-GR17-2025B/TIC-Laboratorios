/**
 * Usar el webhook de n8n
 */

import type {
  IChatRepository,
  ChatMessagePayload,
  ChatResponse,
} from "../../domain/repositories/IChatRepository";

export class N8nChatRepository implements IChatRepository {
  constructor(private readonly webhookUrl: string) {}

  async sendMessage(payload: ChatMessagePayload): Promise<ChatResponse> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error comunicándose con n8n:", error);
      throw new Error(
        "No se pudo enviar el mensaje. Por favor, intenta de nuevo."
      );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
