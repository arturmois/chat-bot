import express, { Request, Response } from "express";
import HandleWebhook from "./HandleWebhook";
import Mediator from "./Mediator";
import Chat from "./Chat";
import { ChatRepositoryDatabase } from "./ChatRepository";
import { WhatsappAdapter } from "./WhatsappService";
const app = express();
app.use(express.json());

const whatsappService = new WhatsappAdapter();
Mediator.getInstance().register("chat", (event: any) => {
  whatsappService.sendTextMessage(event.phoneNumber, event.message, event.instanceKey);
});

app.post("/", async (req: Request, res: Response) => {
  const chatRepository = new ChatRepositoryDatabase();
  const handleWebhook = new HandleWebhook(chatRepository);
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