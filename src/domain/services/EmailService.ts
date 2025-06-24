import { Order } from '../entities/Order';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailService {
  sendOrderConfirmation(order: Order): Promise<void>;
  sendOrderStatusUpdate(order: Order, newStatus: string): Promise<void>;
} 