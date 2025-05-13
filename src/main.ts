import express, { Request, Response } from "express";
import HandleWebhook from "./HandleWebhook";
import Mediator from "./Mediator";
import Customer from "./Customer";
import { WhatsappAdapter } from "./WhatsappService";
import { CustomerRepositoryDatabase } from "./CustomerRepository";
import { ProductRepositoryDatabase } from "./ProductRepository";
import { OrderRepositoryDatabase } from "./OrderRepository";
const app = express();
app.use(express.json());

Mediator.getInstance().register("customer", (customer: Customer) => {

});

app.post("/", async (req: Request, res: Response) => {
  const customerRepository = new CustomerRepositoryDatabase();
  const productRepository = new ProductRepositoryDatabase();
  const orderRepository = new OrderRepositoryDatabase();
  const whatsappService = new WhatsappAdapter();
  const handleWebhook = new HandleWebhook(customerRepository, productRepository, orderRepository, whatsappService);
  const data = req.body;
  const input = {
    number: data.body.key.remoteJid.split("@")[0],
    pushName: data.body.pushName,
    message: data.body.message.conversation,
    instanceKey: data.instanceKey,
  };
  try {
    await handleWebhook.execute(input);
  } catch (error) {
    console.error(error);
  }
  res.send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});