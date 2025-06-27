import { ChatSession, ChatState } from '../../domain/entities/ChatSession';
import { Customer, Address } from '../../domain/entities/Customer';
import { Order, PaymentMethod } from '../../domain/entities/Order';
import { ChatSessionRepository } from '../../domain/repositories/ChatSessionRepository';
import { MenuRepository } from '../../domain/repositories/MenuRepository';
import type { ChatWhatsAppService } from '../../domain/services/ChatWhatsAppService';
import { EmailService } from '../../domain/services/EmailService';

export interface ProcessMessageRequest {
  phoneNumber: string;
  message: string;
}

export interface ProcessMessageResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export class ProcessMessageUseCase {
  constructor(
    private chatSessionRepository: ChatSessionRepository,
    private menuRepository: MenuRepository,
    private chatWhatsAppService: ChatWhatsAppService,
    private emailService: EmailService,
    private sessionTimeoutMs: number = 30 * 60 * 1000 // 30 minutos
  ) { }

  async execute(request: ProcessMessageRequest): Promise<ProcessMessageResponse> {
    try {
      let session = await this.chatSessionRepository.findByPhoneNumber(request.phoneNumber);
      if (session && session.isExpired(this.sessionTimeoutMs)) {
        await this.chatSessionRepository.delete(request.phoneNumber);
        session = null;
      }
      if (!session) {
        session = ChatSession.create(request.phoneNumber);
      }
      const response = await this.processMessage(session, request.message);
      await this.chatSessionRepository.save(response.session);
      if (response.message) {
        await this.chatWhatsAppService.sendMessage({
          chatNumber: request.phoneNumber,
          text: response.message
        });
      }
      return {
        success: true,
        response: response.message ?? ''
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno'
      };
    }
  }

  private async processMessage(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message?: string;
  }> {
    const normalizedMessage = message.trim().toLowerCase();

    switch (session.state) {
      case ChatState.WELCOME:
        return this.handleWelcome(session);

      case ChatState.MAIN_MENU:
        return this.handleMainMenu(session, normalizedMessage);

      case ChatState.BROWSING_MENU:
        return this.handleBrowsingMenu(session, normalizedMessage);

      case ChatState.ADDING_ITEMS:
        return this.handleAddingItems(session, normalizedMessage);

      case ChatState.ASK_TO_ADD_MORE_ITEMS:
        return this.handleAskToAddMoreItems(session, normalizedMessage);

      case ChatState.COLLECTING_CUSTOMER_DATA:
        return this.handleCollectingCustomerData(session, message);

      case ChatState.COLLECTING_ADDRESS:
        return this.handleCollectingAddress(session, message);

      case ChatState.SELECTING_PAYMENT:
        return this.handleSelectingPayment(session, normalizedMessage);

      case ChatState.ORDER_CONFIRMATION:
        return this.handleOrderConfirmation(session, normalizedMessage);

      default:
        return this.handleWelcome(session);
    }
  }

  private async handleWelcome(session: ChatSession): Promise<{
    session: ChatSession;
    message: string;
  }> {
    const welcomeMessage = `🍕 *Bem-vindo ao nosso restaurante!*

Olá! Que bom ter você aqui! 😊

Como posso ajudá-lo hoje?

*1* - 🛒 Fazer um pedido
*2* - 📋 Ver cardápio completo
*3* - 🕐 Horário de funcionamento
*4* - 📞 Falar com atendente

Digite o número da opção desejada:`;

    return {
      session: session.updateState(ChatState.MAIN_MENU),
      message: welcomeMessage
    };
  }

  private async handleMainMenu(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message: string;
  }> {
    switch (message) {
      case '1':
        return this.startNewOrder(session);
      case '2':
        return this.showFullMenu(session);
      case '3':
        return this.showBusinessHours(session);
      case '4':
        return this.transferToAgent(session);
      default:
        return {
          session,
          message: 'Opção inválida. Por favor, digite um número de 1 a 4.'
        };
    }
  }

  private async startNewOrder(session: ChatSession): Promise<{
    session: ChatSession;
    message: string;
  }> {
    const categories = await this.menuRepository.getCategories();

    let menuMessage = '🍽️ *NOSSO CARDÁPIO*\n\nEscolha uma categoria:\n\n';

    categories.forEach((category, index) => {
      menuMessage += `*${index + 1}* - ${category}\n`;
    });

    menuMessage += '\n*0* - Voltar ao menu principal';

    return {
      session: session
        .updateState(ChatState.BROWSING_MENU)
        .updateContext({ selectedItems: [] }),
      message: menuMessage
    };
  }

  private async showFullMenu(session: ChatSession): Promise<{
    session: ChatSession;
    message: string;
  }> {
    const items = await this.menuRepository.findAvailableItems();

    let menuMessage = '📋 *CARDÁPIO COMPLETO*\n\n';

    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
      menuMessage += `*${category.toUpperCase()}*\n`;
      categoryItems.forEach(item => {
        menuMessage += `${item.getDisplayText()}\n\n`;
      });
    });

    menuMessage += '*1* - Fazer pedido\n*0* - Voltar';

    return {
      session,
      message: menuMessage
    };
  }

  private async showBusinessHours(session: ChatSession): Promise<{
    session: ChatSession;
    message: string;
  }> {
    const hoursMessage = `🕐 *HORÁRIO DE FUNCIONAMENTO*

Segunda a Quinta: 18:00 - 23:00
Sexta e Sábado: 18:00 - 00:00
Domingo: 18:00 - 22:00

🚚 *Delivery disponível em todo o horário!*

*1* - Fazer pedido
*0* - Voltar ao menu principal`;

    return {
      session,
      message: hoursMessage
    };
  }

  private async transferToAgent(session: ChatSession): Promise<{
    session: ChatSession;
    message: string;
  }> {
    const transferMessage = `👤 *Transferindo para atendente...*

Em breve um de nossos atendentes entrará em contato com você.

Enquanto isso, você pode:
*1* - Fazer pedido
*0* - Voltar ao menu principal`;

    return {
      session,
      message: transferMessage
    };
  }

  private async handleBrowsingMenu(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message: string;
  }> {
    if (message === '0') {
      return this.handleWelcome(session);
    }

    const categories = await this.menuRepository.getCategories();
    const categoryIndex = parseInt(message) - 1;

    if (categoryIndex >= 0 && categoryIndex < categories.length) {
      const category = categories[categoryIndex];
      const items = await this.menuRepository.findItemsByCategory(category);

      let itemsMessage = `🍽️ *${category.toUpperCase()}*\n\n`;

      items.forEach((item, index) => {
        itemsMessage += `*${index + 1}* - ${item.getDisplayText()}\n\n`;
      });

      itemsMessage += '*0* - Voltar às categorias';

      return {
        session: session
          .updateState(ChatState.ADDING_ITEMS)
          .updateContext({ currentCategory: category }),
        message: itemsMessage
      };
    }

    return {
      session,
      message: 'Categoria inválida. Por favor, escolha um número válido.'
    };
  }

  private async handleAddingItems(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message: string;
  }> {
    if (message === '0') {
      return this.startNewOrder(session);
    }

    if (!session.context.currentCategory) {
      return this.startNewOrder(session);
    }

    const items = await this.menuRepository.findItemsByCategory(session.context.currentCategory);
    const itemIndex = parseInt(message) - 1;

    if (itemIndex >= 0 && itemIndex < items.length) {
      const selectedItem = items[itemIndex];
      const currentItems = session.context.selectedItems || [];
      const updatedItems = [...currentItems, selectedItem.id];

      const confirmMessage = `✅ *${selectedItem.name}* adicionado ao pedido!

${selectedItem.getDisplayText()}

*1* - Adicionar mais itens desta categoria
*2* - Escolher outra categoria  
*3* - Finalizar pedido
*0* - Cancelar pedido`;

      return {
        session: session
          .updateState(ChatState.ASK_TO_ADD_MORE_ITEMS)
          .updateContext({
            selectedItems: updatedItems,
            currentCategory: session.context.currentCategory // Manter a categoria atual
          }),
        message: confirmMessage
      };
    }

    return {
      session,
      message: 'Item inválido. Por favor, escolha um número válido.'
    };
  }

  private async handleAskToAddMoreItems(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message: string;
  }> {
    switch (message) {
      case '1':
        // Continue adding items from same category
        if (!session.context.currentCategory) {
          return this.startNewOrder(session);
        }

        const items = await this.menuRepository.findItemsByCategory(session.context.currentCategory);
        let itemsMessage = `🍽️ *${session.context.currentCategory.toUpperCase()}*\n\n`;

        items.forEach((item, index) => {
          itemsMessage += `*${index + 1}* - ${item.getDisplayText()}\n\n`;
        });

        itemsMessage += '*0* - Voltar às categorias';

        return {
          session: session.updateState(ChatState.ADDING_ITEMS),
          message: itemsMessage
        };

      case '2':
        // Choose another category
        return this.startNewOrder(session);

      case '3':
        // Finalize order - start collecting customer data
        const selectedItems = session.context.selectedItems || [];
        if (selectedItems.length === 0) {
          return this.startNewOrder(session);
        }

        return {
          session: session.updateState(ChatState.COLLECTING_CUSTOMER_DATA),
          message: '👤 *Dados do cliente*\n\nPor favor, informe seu nome completo:'
        };

      case '0':
        // Cancel order
        return this.startNewOrder(session);

      default:
        return {
          session,
          message: 'Opção inválida. Por favor, escolha:\n*1* - Adicionar mais itens desta categoria\n*2* - Escolher outra categoria\n*3* - Finalizar pedido\n*0* - Cancelar pedido'
        };
    }
  }

  private async handleCollectingCustomerData(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message: string;
  }> {
    const context = session.context;
    const customerData = context.customerData || {};

    if (!context.awaitingField) {
      // Primeiro campo - nome
      return {
        session: session.updateContext({
          awaitingField: 'name',
          customerData: { ...customerData }
        }),
        message: '👤 *Dados do cliente*\n\nPor favor, informe seu nome completo:'
      };
    }

    switch (context.awaitingField) {
      case 'name':
        return {
          session: session.updateContext({
            awaitingField: 'email',
            customerData: { ...customerData, name: message }
          }),
          message: '📧 Agora informe seu email:'
        };

      case 'email':
        return {
          session: session
            .updateContext({
              awaitingField: 'address',
              customerData: { ...customerData, email: message }
            })
            .updateState(ChatState.COLLECTING_ADDRESS),
          message: '📍 *Endereço de entrega*\n\nInforme seu endereço completo (rua, número, bairro, cidade):'
        };

      default:
        // Reset the customer data collection process
        return {
          session: session.updateContext({
            awaitingField: 'name',
            customerData: {}
          }),
          message: '👤 *Dados do cliente*\n\nPor favor, informe seu nome completo:'
        };
    }
  }

  private async handleCollectingAddress(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message: string;
  }> {
    // Aqui você pode implementar parsing mais sofisticado do endereço
    // Por simplicidade, vamos assumir que o endereço vem completo
    const addressParts = message.split(',').map(part => part.trim());

    if (addressParts.length < 3) {
      return {
        session,
        message: 'Por favor, informe o endereço completo: Rua, Número, Bairro, Cidade'
      };
    }

    const address: Address = {
      street: addressParts[0],
      number: addressParts[1],
      neighborhood: addressParts[2],
      city: addressParts[3] || 'Cidade',
      state: 'Estado',
      zipCode: '00000-000'
    };

    const customerData = session.context.customerData!;
    const customer = Customer.create(
      customerData.name!,
      session.phoneNumber,
      customerData.email,
      address
    );

    return {
      session: session
        .setCustomer(customer)
        .updateState(ChatState.SELECTING_PAYMENT),
      message: this.getPaymentSelectionMessage()
    };
  }

  private getPaymentSelectionMessage(): string {
    return `💳 *Forma de pagamento*

Escolha a forma de pagamento:

*1* - 💰 Dinheiro
*2* - 💳 Cartão (na entrega)
*3* - 📱 PIX

Digite o número da opção:`;
  }

  private async handleSelectingPayment(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message: string;
  }> {
    let paymentMethod: PaymentMethod;

    switch (message) {
      case '1':
        paymentMethod = PaymentMethod.CASH;
        break;
      case '2':
        paymentMethod = PaymentMethod.CARD;
        break;
      case '3':
        paymentMethod = PaymentMethod.PIX;
        break;
      default:
        return {
          session,
          message: 'Opção inválida. Por favor, escolha 1, 2 ou 3.'
        };
    }

    // Criar pedido com os itens selecionados
    const selectedItemIds = session.context.selectedItems || [];
    const orderItems = [];

    for (const itemId of selectedItemIds) {
      const menuItem = await this.menuRepository.findItemById(itemId);
      if (menuItem) {
        orderItems.push({
          menuItem,
          quantity: 1, // Por simplicidade, assumindo quantidade 1
          observations: ''
        });
      }
    }

    if (orderItems.length === 0) {
      return this.startNewOrder(session);
    }

    const order = Order.create(
      session.customer!,
      orderItems,
      paymentMethod,
      undefined,
      5.00 // Taxa de entrega fixa
    );

    const confirmationMessage = `📋 *CONFIRMAÇÃO DO PEDIDO*

${order.getSummaryText()}

*Dados do cliente:*
Nome: ${order.customer.name}
Telefone: ${order.customer.phone}
Email: ${order.customer.email}

*Endereço:*
${order.customer.address?.street}, ${order.customer.address?.number}
${order.customer.address?.neighborhood}, ${order.customer.address?.city}

*Pagamento:* ${this.getPaymentMethodName(paymentMethod)}

*1* - ✅ Confirmar pedido
*2* - ❌ Cancelar pedido`;

    return {
      session: session
        .setCurrentOrder(order)
        .updateState(ChatState.ORDER_CONFIRMATION),
      message: confirmationMessage
    };
  }

  private async handleOrderConfirmation(session: ChatSession, message: string): Promise<{
    session: ChatSession;
    message: string;
  }> {
    switch (message) {
      case '1':
        // Confirmar pedido
        const completedSession = session.completeOrder();

        // Enviar email de confirmação
        if (completedSession.completedOrders.length > 0) {
          const lastOrder = completedSession.completedOrders[completedSession.completedOrders.length - 1];
          await this.emailService.sendOrderConfirmation(lastOrder);
        }

        const successMessage = `🎉 *PEDIDO CONFIRMADO!*

Seu pedido foi recebido e está sendo preparado!

📧 Enviamos uma confirmação por email
⏰ Tempo estimado: 30-45 minutos
📱 Você receberá atualizações do status

Obrigado pela preferência! 😊`;

        return {
          session: completedSession.updateState(ChatState.ORDER_COMPLETED),
          message: successMessage
        };

      case '2':
        // Cancelar pedido
        return {
          session: session.updateState(ChatState.MAIN_MENU),
          message: '❌ Pedido cancelado.\n\nComo posso ajudá-lo?'
        };

      default:
        return {
          session,
          message: 'Por favor, digite 1 para confirmar ou 2 para cancelar.'
        };
    }
  }

  private getPaymentMethodName(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Dinheiro';
      case PaymentMethod.CARD:
        return 'Cartão';
      case PaymentMethod.PIX:
        return 'PIX';
      default:
        return 'Não informado';
    }
  }
} 