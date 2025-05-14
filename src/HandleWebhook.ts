import Chat from "./Chat";
import ChatRepository from "./ChatRepository";

export default class HandleWebhook {
  private chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  async execute(input: Input) {
    let chat = await this.chatRepository.findByNumber(input.number);
    if (!chat) {
      chat = Chat.create(input.number, input.instanceKey);
      const chatUpdated = await this.chatRepository.save(chat);
      await this.handleMessage(chatUpdated, input);
      return;
    }
    await this.handleMessage(chat, input);
    await this.chatRepository.update(chat);
  }

  private async handleMessage(chat: Chat, input: Input) {
    const menuList = ["1 - Fazer pedido", "2 - Ver meus pedidos", "3 - Sair"];
    const productList = ["Produto 1", "Produto 2", "Produto 3"];

    console.log(chat.getStep());
    if (chat.getStep() === "STEP_0") {
      chat.sendWelcomeMessage();
      await new Promise(resolve => setTimeout(resolve, 1000));
      chat.sendMenuMessage(menuList);
      await this.chatRepository.update(chat);
      return;
    }
    if (chat.getStep() === "STEP_2") {
      if (input.message === "1") {
        chat.sendProductListMessage(productList);
      }
      await this.chatRepository.update(chat);
      return;
    }
    if (chat.getStep() === "STEP_3") {
      if (input.message === "1") {
        chat.sendProductConfirmationMessage();
      }
      await this.chatRepository.update(chat);
      return;
    }
    if (chat.getStep() === "STEP_4") {
      if (input.message === "1") {
        chat.sendNewProductQuestionMessage();
      }
      if (input.message === "2") {
        chat.sendCartSummary();
      }
      await this.chatRepository.update(chat);
      return;
    }
    if (chat.getStep() === "STEP_5") {
      if (input.message === "1") {
        chat.sendProductListMessage(productList);
      }
      if (input.message === "2") {
        chat.sendCartSummary();
      }
      await this.chatRepository.update(chat);
      return;
    }
  }
}

type Input = {
  number: string;
  pushName: string;
  message: string;
  instanceKey: string;
}
