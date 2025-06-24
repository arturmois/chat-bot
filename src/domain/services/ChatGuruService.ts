export interface ChatGuruMessage {
  chatNumber: string;
  text: string;
  sendDate?: string;
}

export interface ChatGuruResponse {
  code: number;
  result: string;
  description: string;
  messageId?: string;
  messageStatus?: string;
}

export interface ChatGuruService {
  sendMessage(message: ChatGuruMessage): Promise<ChatGuruResponse>;
  getMessageStatus(messageId: string): Promise<ChatGuruResponse>;
} 