import { PrismaClient } from "../generated/prisma";
import { CustomerRepositoryDatabase } from "../src/CustomerRepository";
import { ProductRepositoryDatabase } from "../src/ProductRepository";
import HandleWebhook from "../src/HandleWebhook";
import { WhatsappAdapter } from "../src/WhatsappService";
import { OrderRepositoryDatabase } from "../src/OrderRepository";

let customerRepository: CustomerRepositoryDatabase;
let productRepository: ProductRepositoryDatabase;
let orderRepository: OrderRepositoryDatabase;

beforeEach(async () => {
  const prisma = new PrismaClient();
  await prisma.customer.deleteMany();
  customerRepository = new CustomerRepositoryDatabase();
  productRepository = new ProductRepositoryDatabase();
  orderRepository = new OrderRepositoryDatabase();
});

test("Should handle webhook", async () => {
  const whatsappService = new WhatsappAdapter();
  const handleWebhook = new HandleWebhook(customerRepository, productRepository, orderRepository, whatsappService);
  const input = {
    number: "558391244225",
    pushName: "Artur M.",
    message: "Oi",
    instanceKey: "B000"
  };
  await handleWebhook.execute(input);
  const customer = await customerRepository.findByNumber("558391244225");
  expect(customer).toBeDefined();
  expect(customer?.getMessageStep()).toBe("STEP_0");
  const input2 = {
    number: "558381974276",
    pushName: "Artur M.",
    message: "1",
    instanceKey: "B000"
  };
  await handleWebhook.execute(input2);
  const customer2 = await customerRepository.findByNumber("558381974276");
  expect(customer2).toBeDefined();
  expect(customer2?.getMessageStep()).toBe("STEP_0");
});
