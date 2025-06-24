import { HttpTwilioService } from '../src/infrastructure/services/HttpTwilioService';
import dotenv from 'dotenv';

test('should send a message to a phone number', async () => {
  dotenv.config();
  const twilioService = new HttpTwilioService({
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER!
  });
  const message = {
    chatNumber: '+558381974276',
    text: 'Hello, world!'
  };
  const result = await twilioService.sendMessage(message);
  expect(result.messageId).toBeDefined();
  expect(result.code).toBe(200);
  expect(result.result).toBe('success');
  expect(result.description).toBe('Mensagem enviada com sucesso');
});