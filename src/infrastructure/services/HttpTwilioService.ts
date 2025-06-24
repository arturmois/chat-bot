import {
  ChatWhatsAppService,
  ChatWhatsAppMessage,
  ChatWhatsAppResponse
} from '../../domain/services/ChatWhatsAppService';
import { Twilio } from 'twilio';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export class HttpTwilioService implements ChatWhatsAppService {

  constructor(private config: TwilioConfig) { }

  async sendMessage(message: ChatWhatsAppMessage): Promise<ChatWhatsAppResponse> {
    try {
      const client = new Twilio(this.config.accountSid, this.config.authToken);
      const from = `whatsapp:${this.config.phoneNumber}`;
      const to = `whatsapp:${message.chatNumber}`;
      const response = await client.messages
        .create({
          from: from,
          to: to,
          body: message.text
        })
      return {
        code: 200,
        result: 'success',
        description: 'Mensagem enviada com sucesso',
        messageId: response.sid
      };
    } catch (error) {
      return {
        code: 500,
        result: 'error',
        description: error instanceof Error ? error.message : 'Erro interno'
      };
    }
  }

  async getMessageStatus(messageId: string): Promise<ChatWhatsAppResponse> {
    try {
      const client = new Twilio(this.config.accountSid, this.config.authToken);
      const response = await client.messages(messageId).fetch();
      return {
        code: 200,
        result: 'success',
        description: 'Mensagem enviada com sucesso',
        messageStatus: response.status
      };
    } catch (error) {
      return {
        code: 500,
        result: 'error',
        description: error instanceof Error ? error.message : 'Erro interno'
      };
    }
  }
} 