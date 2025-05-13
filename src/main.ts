import express, { Request, Response } from "express";
import HandleWebhook from "./HandleWebhook";
import Mediator from "./Mediator";
import Chat from "./Chat";

const app = express();
app.use(express.json());

Mediator.getInstance().register("chat", (chat: Chat) => {
    console.log(chat);
});

app.post("/", (req: Request, res: Response) => {
    const input = req.body;
    const handleWebhook = new HandleWebhook();
    const output = handleWebhook.execute(input);
    res.send(output);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});