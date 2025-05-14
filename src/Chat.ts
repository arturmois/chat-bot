import Item from "./Item";
import { MessageStep } from "../generated/prisma";
import Mediator from "./Mediator";

export default class Chat {
  private id: number;
  private step: MessageStep;
  private cart: Item[];
  private productSelected: string;

  constructor(id: number, readonly phoneNumber: string, readonly instanceKey: string, messageStep: MessageStep) {
    this.id = id;
    this.step = messageStep;
    this.cart = [];
    this.productSelected = "";
  }

  static create(phoneNumber: string, instanceKey: string) {
    const step = MessageStep.STEP_0;
    return new Chat(0, phoneNumber, instanceKey, step);
  }

  getId() {
    return this.id;
  }

  getStep() {
    return this.step;
  }

  getCart() {
    return this.cart;
  }

  resetFlow() {
    this.step = "STEP_0";
    this.cart = [];
  }

  private validateStep(expectedStep: string) {
    if (this.getStep() !== expectedStep) {
      this.sendMessage("Desculpe, ocorreu um erro no fluxo. Vamos começar novamente.");
      this.resetFlow();
      return false;
    }
    return true;
  }

  sendWelcomeMessage() {
    if (!this.validateStep("STEP_0")) return;
    const message = `Olá! Bem-vindo ao nosso bot.`;
    this.sendMessage(message);
    this.step = "STEP_1";
  }

  sendMenuMessage(menuList: string[]) {
    if (!this.validateStep("STEP_1")) return;
    const message = `Escolha uma opção: \n${menuList.join("\n")}`;
    this.sendMessage(message);
    this.step = "STEP_2";
  }

  sendProductListMessage(productList: string[]) {
    if (this.step !== "STEP_2" && this.step !== "STEP_5") return;
    const message = `Lista de produtos: \n${productList.join("\n")}`;
    this.sendMessage(message);
    this.step = "STEP_3";
  }

  addToCart(productId: string) {
    this.cart.push(new Item(productId, 1, 1));
    this.sendMessage(`Produto "${productId}" adicionado ao carrinho!`);
  }

  sendProductConfirmationMessage() {
    if (!this.validateStep("STEP_3")) return;
    const message = `Você deseja comprar o produto? \n1 - Sim \n2 - Não`;
    this.sendMessage(message);
    this.step = "STEP_4";
  }

  sendNewProductQuestionMessage() {
    if (!this.validateStep("STEP_4")) return;
    const message = `Você deseja adicionar um novo produto? \n1 - Sim \n2 - Não`;
    this.sendMessage(message);
    this.step = "STEP_5";
  }

  sendCartSummary() {
    if (this.cart.length === 0) {
      this.sendMessage("Seu carrinho está vazio.");
      return;
    }
    const message = `Resumo do seu pedido:\n${this.cart.join("\n")}\n\nTotal de itens: ${this.cart.length}\n\nTotal do pedido: R$ ${this.cart.reduce((acc, curr) => acc + curr.getQuantity() * curr.getValue(), 0).toFixed(2)}`;
    this.sendMessage(message);
  }

  sendMessage(message: string) {
    Mediator.getInstance().notify("chat", {
      phoneNumber: this.phoneNumber,
      message: message,
      instanceKey: this.instanceKey,
    });
  }
}
