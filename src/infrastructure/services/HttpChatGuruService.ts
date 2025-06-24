import axios, { AxiosInstance } from 'axios';
import { ChatWhatsAppService, ChatWhatsAppMessage, ChatWhatsAppResponse } from '../../domain/services/ChatWhatsAppService';

export interface ChatWhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  accountId: string;
  phoneId: string;
}

export class HttpChatWhatsAppService implements ChatWhatsAppService {
  private httpClient: AxiosInstance;

  constructor(private config: ChatWhatsAppConfig) {
    this.httpClient = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  async sendMessage(message: ChatWhatsAppMessage): Promise<ChatWhatsAppResponse> {
    try {
      const params = new URLSearchParams({
        key: this.config.apiKey,
        account_id: this.config.accountId,
        phone_id: this.config.phoneId,
        action: 'message_send',
        chat_number: message.chatNumber,
        text: message.text,
        ...(message.sendDate && { send_date: message.sendDate })
      });

      const response = await this.httpClient.post('', params);

      return {
        code: response.data.code || 500,
        result: response.data.result || 'error',
        description: response.data.description || 'Erro desconhecido',
        messageId: response.data.message_id,
        messageStatus: response.data.message_status
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          code: error.response?.status || 500,
          result: 'error',
          description: error.response?.data?.description || error.message
        };
      }

      return {
        code: 500,
        result: 'error',
        description: error instanceof Error ? error.message : 'Erro interno'
      };
    }
  }

  async getMessageStatus(messageId: string): Promise<ChatWhatsAppResponse> {
    try {
      const params = new URLSearchParams({
        key: this.config.apiKey,
        account_id: this.config.accountId,
        phone_id: this.config.phoneId,
        action: 'message_status',
        message_id: messageId
      });

      const response = await this.httpClient.post('', params);

      return {
        code: response.data.code || 500,
        result: response.data.result || 'error',
        description: response.data.description || 'Erro desconhecido',
        messageStatus: response.data.message_status
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          code: error.response?.status || 500,
          result: 'error',
          description: error.response?.data?.description || error.message
        };
      }

      return {
        code: 500,
        result: 'error',
        description: error instanceof Error ? error.message : 'Erro interno'
      };
    }
  }
} 