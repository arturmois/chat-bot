import { v4 as uuidv4 } from 'uuid';
import { Customer } from './Customer';
import { Order } from './Order';

export enum ChatState {
  WELCOME = 'WELCOME',
  MAIN_MENU = 'MAIN_MENU',
  BROWSING_MENU = 'BROWSING_MENU',
  ADDING_ITEMS = 'ADDING_ITEMS',
  COLLECTING_CUSTOMER_DATA = 'COLLECTING_CUSTOMER_DATA',
  COLLECTING_ADDRESS = 'COLLECTING_ADDRESS',
  SELECTING_PAYMENT = 'SELECTING_PAYMENT',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ChatContext {
  currentCategory?: string;
  selectedItems?: string[];
  customerData?: Partial<Customer>;
  awaitingField?: string;
  lastMessageTime: Date;
}

export class ChatSession {
  private constructor(
    public readonly id: string,
    public readonly phoneNumber: string,
    public readonly state: ChatState,
    public readonly context: ChatContext,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly customer?: Customer,
    public readonly currentOrder?: Order,
    public readonly completedOrders: Order[] = []
  ) { }

  static create(phoneNumber: string): ChatSession {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new Error('Número de telefone é obrigatório');
    }

    const now = new Date();
    return new ChatSession(
      uuidv4(),
      phoneNumber.trim(),
      ChatState.WELCOME,
      { lastMessageTime: now },
      now,
      now
    );
  }

  updateState(newState: ChatState): ChatSession {
    return new ChatSession(
      this.id,
      this.phoneNumber,
      newState,
      { ...this.context, lastMessageTime: new Date() },
      this.createdAt,
      new Date(),
      this.customer,
      this.currentOrder,
      this.completedOrders
    );
  }

  updateContext(newContext: Partial<ChatContext>): ChatSession {
    return new ChatSession(
      this.id,
      this.phoneNumber,
      this.state,
      { ...this.context, ...newContext, lastMessageTime: new Date() },
      this.createdAt,
      new Date(),
      this.customer,
      this.currentOrder,
      this.completedOrders
    );
  }

  setCustomer(customer: Customer): ChatSession {
    return new ChatSession(
      this.id,
      this.phoneNumber,
      this.state,
      { ...this.context, lastMessageTime: new Date() },
      this.createdAt,
      new Date(),
      customer,
      this.currentOrder,
      this.completedOrders
    );
  }

  setCurrentOrder(order: Order): ChatSession {
    return new ChatSession(
      this.id,
      this.phoneNumber,
      this.state,
      { ...this.context, lastMessageTime: new Date() },
      this.createdAt,
      new Date(),
      this.customer,
      order,
      this.completedOrders
    );
  }

  completeOrder(): ChatSession {
    if (!this.currentOrder) {
      throw new Error('Nenhum pedido ativo para completar');
    }

    const completedOrder = this.currentOrder.confirm();
    const newCompletedOrders = [...this.completedOrders, completedOrder];

    return new ChatSession(
      this.id,
      this.phoneNumber,
      ChatState.ORDER_COMPLETED,
      { lastMessageTime: new Date() },
      this.createdAt,
      new Date(),
      this.customer,
      undefined,
      newCompletedOrders
    );
  }

  cancel(): ChatSession {
    return new ChatSession(
      this.id,
      this.phoneNumber,
      ChatState.CANCELLED,
      { ...this.context, lastMessageTime: new Date() },
      this.createdAt,
      new Date(),
      this.customer,
      this.currentOrder,
      this.completedOrders
    );
  }

  isExpired(timeoutMs: number): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - this.context.lastMessageTime.getTime();
    return timeDiff > timeoutMs;
  }

  hasActiveOrder(): boolean {
    return !!this.currentOrder;
  }

  canStartNewOrder(): boolean {
    return this.state === ChatState.MAIN_MENU ||
      this.state === ChatState.ORDER_COMPLETED ||
      this.state === ChatState.WELCOME;
  }

  getOrdersCount(): number {
    return this.completedOrders.length;
  }

  getTotalSpent(): number {
    return this.completedOrders.reduce((total, order) => total + order.totalAmount, 0);
  }
} 