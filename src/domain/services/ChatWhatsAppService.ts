export interface ChatWhatsAppMessage {
  chatNumber: string;
  text: string;
  sendDate?: string;
}

export interface ChatWhatsAppResponse {
  code: number;
  result: string;
  description: string;
  messageId?: string;
  messageStatus?: string;
}

export interface ChatWhatsAppService {
  sendMessage(message: ChatWhatsAppMessage): Promise<ChatWhatsAppResponse>;
  getMessageStatus(messageId: string): Promise<ChatWhatsAppResponse>;
} 