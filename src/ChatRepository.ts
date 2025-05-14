import { MessageStep, PrismaClient } from "../generated/prisma";
import Chat from "./Chat";

export default interface ChatRepository {
  save(chat: Chat): Promise<Chat>;
  findByNumber(number: string): Promise<Chat | null>;
  update(chat: Chat): Promise<void>;
}

export class ChatRepositoryDatabase implements ChatRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async save(chat: Chat): Promise<Chat> {
    const chatCreated = await this.prisma.chat.create({
      data: {
        phone_number: chat.phoneNumber,
        instance_key: chat.instanceKey,
        message_step: chat.getStep() as MessageStep,
      },
    });
    return new Chat(chatCreated.id, chatCreated.phone_number, chatCreated.instance_key, chatCreated.message_step as MessageStep);
  }
  async findByNumber(number: string): Promise<Chat | null> {
    const chat = await this.prisma.chat.findUnique({
      where: {
        phone_number: number,
      },
    });
    if (!chat) {
      return null;
    }
    return new Chat(chat.id, chat.phone_number, chat.instance_key, chat.message_step as MessageStep);
  }

  async update(chat: Chat): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chat.getId() },
      data: {
        phone_number: chat.phoneNumber,
        instance_key: chat.instanceKey,
        message_step: chat.getStep() as MessageStep,
      },
    });
  }
}