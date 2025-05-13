import Customer from "./Customer";
import CustomerRepository from "./CustomerRepository";
import Order from "./Order";
import OrderRepository from "./OrderRepository";
import Product from "./Product";
import ProductRepository from "./ProductRepository";
import WhatsappService from "./WhatsappService";

export default class HandleWebhook {

    private customerRepository: CustomerRepository;
    private productRepository: ProductRepository;
    private orderRepository: OrderRepository;
    private whatsappService: WhatsappService;

    constructor(customerRepository: CustomerRepository, productRepository: ProductRepository, orderRepository: OrderRepository, whatsappService: WhatsappService) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.whatsappService = whatsappService;
    }

    async execute(input: Input) {
        let customer = await this.customerRepository.findByNumber(input.number);
        if (!customer) {
            customer = Customer.create(input.pushName, input.number, input.instanceKey);
            await this.customerRepository.save(customer);
            await this.handleMessage(customer, input);
            return;
        }
        await this.handleMessage(customer, input);
    }

    private async handleMessage(customer: Customer, input: Input) {
        console.log(customer.getMessageStep());
        console.log(input.message);
        if (customer.getMessageStep() === "START") {
            await this.whatsappService.sendTextMessage(input.number, "Digite o número da opção que deseja:\n1 - Fazer um pedido\n2 - Sair do menu", input.instanceKey);
            customer.updateMessageStep("LIST_PRODUCTS");
            await this.customerRepository.update(customer);
            return;
        }
        const listOfProducts = await this.productRepository.findAll();
        if (customer.getMessageStep() === "LIST_PRODUCTS") {
            if (input.message === "1") {
                await this.whatsappService.sendTextMessage(input.number, "Digite a opção do produto que deseja comprar \n" + listOfProducts.map((product: Product) => `${product.getId()} - ${product.getName()}`).join("\n"), input.instanceKey);
                customer.updateMessageStep("SELECT_PRODUCT");
                await this.customerRepository.update(customer);
                return;
            }
            await this.whatsappService.sendTextMessage(input.number, "Pedido realizado com sucesso", input.instanceKey);
            customer.updateMessageStep("START");
            await this.customerRepository.update(customer);
            return;
        }
        if (customer.getMessageStep() === "SELECT_PRODUCT") {
            const product = listOfProducts.find((product: Product) => product.getId() === parseInt(input.message));
            if (!product) {
                await this.whatsappService.sendTextMessage(input.number, "Produto não encontrado", input.instanceKey);
                return;
            }
            const order = Order.create(customer.getId(), product.getId(), 1);
            await this.orderRepository.save(order);
            await this.whatsappService.sendTextMessage(input.number, "Digite a quantidade que deseja comprar", input.instanceKey);
            customer.updateMessageStep("PRODUCT_QUANTITY");
            await this.customerRepository.update(customer);
            return;
        }
        if (customer.getMessageStep() === "PRODUCT_QUANTITY") {
            const quantity = parseInt(input.message);
            if (isNaN(quantity)) {
                await this.whatsappService.sendTextMessage(input.number, "Quantidade inválida", input.instanceKey);
                return;
            }
            await this.whatsappService.sendTextMessage(input.number, "Deseja adicionar mais algum produto? \n1 - Sim \n2 - Não", input.instanceKey);
            customer.updateMessageStep("LIST_PRODUCTS");
            await this.customerRepository.update(customer);
            return;
        }
        if (customer.getMessageStep() === "ADD_MORE_PRODUCTS") {
            if (input.message === "1") {
                customer.updateMessageStep("LIST_PRODUCTS");
                await this.customerRepository.update(customer);
                return;
            }
            if (input.message === "2") {
                await this.whatsappService.sendTextMessage(input.number, "Pedido realizado com sucesso", input.instanceKey);
                customer.updateMessageStep("START");
                await this.customerRepository.update(customer);
                return;
            }
        }
    }
}

type Input = {
    number: string;
    pushName: string;
    message: string;
    instanceKey: string;
}
