import Chat from "./Chat";
import Mediator from "./Mediator";

export default class HandleWebhook {

    execute(input: any) {
        if (input.type !== "message") {
            return;
        }
        const remoteJid = input.body.key.remoteJid.split("@");
        const number = remoteJid[0];
        const message = input.body.conversation;
        const chat = Chat.create(number);
        Mediator.getInstance().notify("chat", chat);
    }
}