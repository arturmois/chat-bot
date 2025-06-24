import { ChatSessionRepository } from '../../domain/repositories/ChatSessionRepository';
import { ChatSession } from '../../domain/entities/ChatSession';

export default class InMemoryChatSessionRepository implements ChatSessionRepository {
  private sessions: Map<string, ChatSession> = new Map();

  async save(session: ChatSession): Promise<void> {
    this.sessions.set(session.phoneNumber, session);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<ChatSession | null> {
    return this.sessions.get(phoneNumber) || null;
  }

  async delete(phoneNumber: string): Promise<void> {
    this.sessions.delete(phoneNumber);
  }

  async findExpiredSessions(timeoutMs: number): Promise<ChatSession[]> {
    const expiredSessions: ChatSession[] = [];

    for (const session of this.sessions.values()) {
      if (session.isExpired(timeoutMs)) {
        expiredSessions.push(session);
      }
    }

    return expiredSessions;
  }

  async deleteExpiredSessions(timeoutMs: number): Promise<void> {
    const expiredSessions = await this.findExpiredSessions(timeoutMs);

    for (const session of expiredSessions) {
      this.sessions.delete(session.phoneNumber);
    }
  }

  // Método utilitário para desenvolvimento/debug
  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  // Método utilitário para limpar todas as sessões
  clear(): void {
    this.sessions.clear();
  }
} 