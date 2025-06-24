import * as nodemailer from 'nodemailer';
import { EmailService } from '../../domain/services/EmailService';
import { Order } from '../../domain/entities/Order';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      }
    });
  }

  async sendOrderConfirmation(order: Order): Promise<void> {
    if (!order.customer.email) {
      throw new Error('Cliente não possui email cadastrado');
    }

    const subject = `Pedido Confirmado #${order.id.substring(0, 8)}`;

    const html = this.generateOrderConfirmationHtml(order);
    const text = this.generateOrderConfirmationText(order);

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: order.customer.email,
        subject,
        html,
        text
      });
    } catch (error) {
      throw new Error(`Erro ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async sendOrderStatusUpdate(order: Order, newStatus: string): Promise<void> {
    if (!order.customer.email) {
      throw new Error('Cliente não possui email cadastrado');
    }

    const subject = `Atualização do Pedido #${order.id.substring(0, 8)} - ${newStatus}`;

    const html = this.generateStatusUpdateHtml(order, newStatus);
    const text = this.generateStatusUpdateText(order, newStatus);

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: order.customer.email,
        subject,
        html,
        text
      });
    } catch (error) {
      throw new Error(`Erro ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private generateOrderConfirmationHtml(order: Order): string {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td>${item.quantity}x</td>
        <td>${item.menuItem.name}</td>
        <td>${item.menuItem.formatPrice()}</td>
        <td>${(item.menuItem.price * item.quantity).toFixed(2).replace('.', ',')}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pedido Confirmado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 1.2em; color: #4CAF50; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Pedido Confirmado!</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${order.customer.name}</strong>,</p>
            
            <p>Seu pedido foi confirmado com sucesso! Estamos preparando tudo com muito carinho.</p>
            
            <div class="order-details">
              <h3>Detalhes do Pedido #${order.id.substring(0, 8)}</h3>
              
              <table>
                <thead>
                  <tr>
                    <th>Qtd</th>
                    <th>Item</th>
                    <th>Preço Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  ${order.deliveryFee > 0 ? `
                  <tr>
                    <td></td>
                    <td><strong>Taxa de Entrega</strong></td>
                    <td></td>
                    <td>R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}</td>
                  </tr>
                  ` : ''}
                  <tr class="total">
                    <td></td>
                    <td><strong>TOTAL</strong></td>
                    <td></td>
                    <td><strong>R$ ${order.totalAmount.toFixed(2).replace('.', ',')}</strong></td>
                  </tr>
                </tbody>
              </table>
              
              <p><strong>Endereço de Entrega:</strong></p>
              <p>
                ${order.customer.address?.street}, ${order.customer.address?.number}<br>
                ${order.customer.address?.neighborhood}<br>
                ${order.customer.address?.city} - ${order.customer.address?.state}
              </p>
              
              <p><strong>Forma de Pagamento:</strong> ${this.getPaymentMethodDescription(order.paymentMethod)}</p>
            </div>
            
            <p><strong>⏰ Tempo estimado:</strong> 30-45 minutos</p>
            <p><strong>📱 Acompanhe:</strong> Você receberá atualizações do status do seu pedido</p>
            
            <p>Obrigado pela preferência!</p>
          </div>
          
          <div class="footer">
            <p>Em caso de dúvidas, entre em contato conosco pelo WhatsApp</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderConfirmationText(order: Order): string {
    const itemsText = order.items.map(item =>
      `${item.quantity}x ${item.menuItem.name} - R$ ${(item.menuItem.price * item.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n');

    return `
PEDIDO CONFIRMADO!

Olá ${order.customer.name},

Seu pedido foi confirmado com sucesso!

Pedido #${order.id.substring(0, 8)}

ITENS:
${itemsText}
${order.deliveryFee > 0 ? `Taxa de Entrega: R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}` : ''}

TOTAL: R$ ${order.totalAmount.toFixed(2).replace('.', ',')}

ENDEREÇO:
${order.customer.address?.street}, ${order.customer.address?.number}
${order.customer.address?.neighborhood}
${order.customer.address?.city} - ${order.customer.address?.state}

PAGAMENTO: ${this.getPaymentMethodDescription(order.paymentMethod)}

Tempo estimado: 30-45 minutos
Você receberá atualizações do status do seu pedido.

Obrigado pela preferência!
    `;
  }

  private generateStatusUpdateHtml(order: Order, newStatus: string): string {
    const statusMessage = this.getStatusMessage(newStatus);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Atualização do Pedido</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .status-update { background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-left: 4px solid #2196F3; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📱 Atualização do Pedido</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${order.customer.name}</strong>,</p>
            
            <div class="status-update">
              <h3>Pedido #${order.id.substring(0, 8)}</h3>
              <p><strong>Status:</strong> ${newStatus}</p>
              <p>${statusMessage}</p>
            </div>
            
            <p>Obrigado pela preferência!</p>
          </div>
          
          <div class="footer">
            <p>Em caso de dúvidas, entre em contato conosco pelo WhatsApp</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateStatusUpdateText(order: Order, newStatus: string): string {
    const statusMessage = this.getStatusMessage(newStatus);

    return `
ATUALIZAÇÃO DO PEDIDO

Olá ${order.customer.name},

Pedido #${order.id.substring(0, 8)}
Status: ${newStatus}

${statusMessage}

Obrigado pela preferência!
    `;
  }

  private getPaymentMethodDescription(method: string): string {
    switch (method) {
      case 'CASH': return 'Dinheiro';
      case 'CARD': return 'Cartão (na entrega)';
      case 'PIX': return 'PIX';
      default: return method;
    }
  }

  private getStatusMessage(status: string): string {
    switch (status.toUpperCase()) {
      case 'CONFIRMED': return 'Seu pedido foi confirmado e está sendo preparado.';
      case 'PREPARING': return 'Estamos preparando seu pedido com muito carinho.';
      case 'READY': return 'Seu pedido está pronto! O entregador já saiu para a entrega.';
      case 'DELIVERED': return 'Pedido entregue com sucesso! Esperamos que tenha gostado.';
      case 'CANCELLED': return 'Seu pedido foi cancelado. Em caso de dúvidas, entre em contato conosco.';
      default: return `Status do pedido: ${status}`;
    }
  }
} 