import { ChatSession } from '../entities/ChatSession';

export interface ChatSessionRepository {
  save(session: ChatSession): Promise<void>;
  findByPhoneNumber(phoneNumber: string): Promise<ChatSession | null>;
  delete(phoneNumber: string): Promise<void>;
  findExpiredSessions(timeoutMs: number): Promise<ChatSession[]>;
  deleteExpiredSessions(timeoutMs: number): Promise<void>;
} 