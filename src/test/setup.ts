// Setup global para testes
import dotenv from 'dotenv';

// Carrega variáveis de ambiente de teste
dotenv.config({ path: '.env.test' });

// Mock console.log em testes se necessário
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.warn = jest.fn();
} 