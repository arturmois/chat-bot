import { ProcessMessageUseCase } from '../src/application/usecases/ProcessMessage';
import { HttpTwilioService } from '../src/infrastructure/services/HttpTwilioService';
import InMemoryChatSessionRepository from '../src/infrastructure/repositories/InMemoryChatSessionRepository';
import InMemoryMenuRepository from '../src/infrastructure/repositories/InMemoryMenuRepository';
import dotenv from 'dotenv';
import { NodemailerEmailService } from '../src/infrastructure/services/NodemailerEmailService';
import { ChatState } from '../src/domain/entities/ChatSession';

let processMessageUseCase: ProcessMessageUseCase;
let chatSessionRepository: InMemoryChatSessionRepository;

beforeAll(() => {
  dotenv.config();
  const twilioConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER!
  };
  const emailConfig = {
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT!),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER!,
    password: process.env.EMAIL_PASSWORD!,
    from: process.env.EMAIL_FROM!
  };
  chatSessionRepository = new InMemoryChatSessionRepository();
  processMessageUseCase = new ProcessMessageUseCase(
    chatSessionRepository,
    new InMemoryMenuRepository(),
    new HttpTwilioService(twilioConfig),
    new NodemailerEmailService(emailConfig),
    30 * 60 * 1000
  );
});

test('should process a new chat session', async () => {
  const input = {
    phoneNumber: '+558381974276',
    message: 'Hello, world!'
  };
  await processMessageUseCase.execute(input);
  const chatSession = await chatSessionRepository.findByPhoneNumber(input.phoneNumber);
  expect(chatSession?.id).toBeDefined();
  expect(chatSession?.phoneNumber).toEqual(input.phoneNumber);
  expect(chatSession?.state).toEqual(ChatState.MAIN_MENU);
  expect(chatSession?.createdAt).toBeInstanceOf(Date);
});

test.only('should process a new chat session', async () => {
  const input = {
    phoneNumber: '+558381974276',
    message: 'Hello, world!'
  };
  await processMessageUseCase.execute(input);
  const chatSession = await chatSessionRepository.findByPhoneNumber(input.phoneNumber);
  expect(chatSession?.id).toBeDefined();
  const input2 = {
    phoneNumber: '+558381974276',
    message: '1'
  };
  await processMessageUseCase.execute(input2);
  const chatSession2 = await chatSessionRepository.findByPhoneNumber(input2.phoneNumber);
  expect(chatSession2?.state).toBe(ChatState.BROWSING_MENU);
  const input3 = {
    phoneNumber: '+558381974276',
    message: '1'
  };
  await processMessageUseCase.execute(input3);
  const chatSession3 = await chatSessionRepository.findByPhoneNumber(input3.phoneNumber);
  expect(chatSession3?.state).toBe(ChatState.ADDING_ITEMS);
  const input4 = {
    phoneNumber: '+558381974276',
    message: '1'
  };
  await processMessageUseCase.execute(input4);
  const chatSession4 = await chatSessionRepository.findByPhoneNumber(input4.phoneNumber);
  expect(chatSession4?.state).toBe(ChatState.ADDING_ITEMS);
});