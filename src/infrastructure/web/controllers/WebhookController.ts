import { Request, Response } from 'express';
import { ProcessMessageUseCase } from '../../../application/usecases/ProcessMessageUseCase';

export interface WebhookPayload {
  phone: string;
  message: string;
  from?: string;
  type?: string;
}

export class WebhookController {
  constructor(private processMessageUseCase: ProcessMessageUseCase) { }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as WebhookPayload;

      // Validar payload
      if (!this.isValidPayload(payload)) {
        res.status(400).json({
          success: false,
          error: 'Payload inválido'
        });
        return;
      }

      // Processar mensagem
      const result = await this.processMessageUseCase.execute({
        phoneNumber: payload.phone,
        message: payload.message
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Mensagem processada com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Erro interno'
        });
      }
    } catch (error) {
      console.error('Erro no webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  private isValidPayload(payload: any): payload is WebhookPayload {
    return (
      payload &&
      typeof payload.phone === 'string' &&
      typeof payload.message === 'string' &&
      payload.phone.trim().length > 0 &&
      payload.message.trim().length > 0
    );
  }
} 