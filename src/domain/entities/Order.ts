import { v4 as uuidv4 } from 'uuid';
import { Customer } from './Customer';
import { MenuItem } from './MenuItem';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  observations?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  PIX = 'PIX'
}

export class Order {
  private constructor(
    public readonly id: string,
    public readonly customer: Customer,
    public readonly items: OrderItem[],
    public readonly status: OrderStatus,
    public readonly paymentMethod: PaymentMethod,
    public readonly createdAt: Date,
    public readonly totalAmount: number,
    public readonly observations?: string,
    public readonly deliveryFee: number = 0
  ) { }

  static create(
    customer: Customer,
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    observations?: string,
    deliveryFee: number = 0
  ): Order {
    if (!customer) {
      throw new Error('Cliente é obrigatório');
    }

    if (!items || items.length === 0) {
      throw new Error('Pedido deve ter pelo menos um item');
    }

    if (!customer.hasCompleteData()) {
      throw new Error('Dados do cliente incompletos');
    }

    const totalAmount = this.calculateTotalAmount(items) + deliveryFee;

    return new Order(
      uuidv4(),
      customer,
      items,
      OrderStatus.PENDING,
      paymentMethod,
      new Date(),
      totalAmount,
      observations,
      deliveryFee
    );
  }

  private static calculateTotalAmount(items: OrderItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  }

  addItem(menuItem: MenuItem, quantity: number, observations?: string): Order {
    if (!menuItem.isAvailable()) {
      throw new Error('Item não está disponível');
    }

    if (quantity <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    const newItems = [...this.items, { menuItem, quantity, observations }];
    const newTotalAmount = Order.calculateTotalAmount(newItems) + this.deliveryFee;

    return new Order(
      this.id,
      this.customer,
      newItems,
      this.status,
      this.paymentMethod,
      this.createdAt,
      newTotalAmount,
      this.observations,
      this.deliveryFee
    );
  }

  removeItem(menuItemId: string): Order {
    const newItems = this.items.filter(item => item.menuItem.id !== menuItemId);

    if (newItems.length === 0) {
      throw new Error('Pedido deve ter pelo menos um item');
    }

    const newTotalAmount = Order.calculateTotalAmount(newItems) + this.deliveryFee;

    return new Order(
      this.id,
      this.customer,
      newItems,
      this.status,
      this.paymentMethod,
      this.createdAt,
      newTotalAmount,
      this.observations,
      this.deliveryFee
    );
  }

  updateStatus(status: OrderStatus): Order {
    return new Order(
      this.id,
      this.customer,
      this.items,
      status,
      this.paymentMethod,
      this.createdAt,
      this.totalAmount,
      this.observations,
      this.deliveryFee
    );
  }

  confirm(): Order {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Apenas pedidos pendentes podem ser confirmados');
    }
    return this.updateStatus(OrderStatus.CONFIRMED);
  }

  cancel(): Order {
    if (this.status === OrderStatus.DELIVERED) {
      throw new Error('Pedidos entregues não podem ser cancelados');
    }
    return this.updateStatus(OrderStatus.CANCELLED);
  }

  formatTotalAmount(): string {
    return `R$ ${this.totalAmount.toFixed(2).replace('.', ',')}`;
  }

  getItemsCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  getSummaryText(): string {
    const itemsText = this.items.map(item =>
      `${item.quantity}x ${item.menuItem.name} - ${item.menuItem.formatPrice()}`
    ).join('\n');

    const deliveryText = this.deliveryFee > 0
      ? `\nTaxa de entrega: R$ ${this.deliveryFee.toFixed(2).replace('.', ',')}`
      : '';

    return `*RESUMO DO PEDIDO*\n\n${itemsText}${deliveryText}\n\n*Total: ${this.formatTotalAmount()}*`;
  }
} 