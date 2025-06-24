import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Infrastructure
import { InMemoryMenuRepository } from '../repositories/InMemoryMenuRepository';
import { InMemoryChatSessionRepository } from '../repositories/InMemoryChatSessionRepository';
import { HttpChatGuruService, ChatGuruConfig } from '../services/HttpChatGuruService';
import { NodemailerEmailService, EmailConfig } from '../services/NodemailerEmailService';
import { Logger, LoggerConfig } from '../logging/Logger';
import { createRateLimitMiddleware, RateLimitConfig } from './middlewares/rateLimitMiddleware';

// Application
import { ProcessMessageUseCase } from '../../application/usecases/ProcessMessageUseCase';

// Web
import { WebhookController } from './controllers/WebhookController';

// Load environment variables
dotenv.config();

export class Server {
  private app: express.Application;
  private logger!: Logger;
  private webhookController!: WebhookController;

  constructor() {
    this.app = express();
    this.setupLogger();
    this.setupDependencies();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupLogger(): void {
    const loggerConfig: LoggerConfig = {
      level: process.env.LOG_LEVEL || 'info',
      filename: process.env.LOG_FILE || '',
      enableConsole: process.env.NODE_ENV !== 'production'
    };

    this.logger = new Logger(loggerConfig);
  }

  private setupDependencies(): void {
    // Firebird configuration
    // const firebirdConfig: FirebirdConfig = {
    //   host: process.env.FIREBIRD_HOST || 'localhost',
    //   port: parseInt(process.env.FIREBIRD_PORT || '3050'),
    //   database: process.env.FIREBIRD_DATABASE || '',
    //   user: process.env.FIREBIRD_USER || 'sysdba',
    //   password: process.env.FIREBIRD_PASSWORD || 'masterkey'
    // };

    // ChatGuru configuration
    const chatGuruConfig: ChatGuruConfig = {
      apiUrl: process.env.CHATGURU_API_URL || '',
      apiKey: process.env.CHATGURU_API_KEY || '',
      accountId: process.env.CHATGURU_ACCOUNT_ID || '',
      phoneId: process.env.CHATGURU_PHONE_ID || ''
    };

    // Email configuration
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      from: process.env.EMAIL_FROM || ''
    };

    // Repositories
    const menuRepository = new InMemoryMenuRepository();
    const sessionRepository = new InMemoryChatSessionRepository();

    // Services
    const chatGuruService = new HttpChatGuruService(chatGuruConfig);
    const emailService = new NodemailerEmailService(emailConfig);

    // Use Cases
    const processMessageUseCase = new ProcessMessageUseCase(
      sessionRepository,
      menuRepository,
      chatGuruService,
      emailService,
      parseInt(process.env.SESSION_TIMEOUT_MS || '1800000') // 30 minutos
    );

    // Controllers
    this.webhookController = new WebhookController(processMessageUseCase);

    // Setup session cleanup
    this.setupSessionCleanup(sessionRepository);
  }

  private setupSessionCleanup(sessionRepository: InMemoryChatSessionRepository): void {
    const timeoutMs = parseInt(process.env.SESSION_TIMEOUT_MS || '1800000'); // 30 minutos
    const cleanupIntervalMs = 5 * 60 * 1000; // 5 minutos

    setInterval(async () => {
      try {
        await sessionRepository.deleteExpiredSessions(timeoutMs);
        this.logger.debug('Sessões expiradas removidas');
      } catch (error) {
        this.logger.error('Erro ao limpar sessões expiradas', error);
      }
    }, cleanupIntervalMs);
  }

  private setupMiddlewares(): void {
    // Security
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
      credentials: true
    }));

    // Rate limiting
    const rateLimitConfig: RateLimitConfig = {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    };
    this.app.use('/webhook', createRateLimitMiddleware(rateLimitConfig));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(this.logger.expressMiddleware());
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Webhook route
    this.app.post('/webhook', (req, res) => {
      this.webhookController.handleWebhook(req, res);
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado'
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Erro não tratado', error);

      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Erro interno do servidor'
          : error.message
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      this.logger.info('SIGTERM recebido, iniciando graceful shutdown');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      this.logger.info('SIGINT recebido, iniciando graceful shutdown');
      process.exit(0);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', error);
      process.exit(1);
    });
  }

  public start(): void {
    const port = parseInt(process.env.PORT || '3000');

    this.app.listen(port, () => {
      this.logger.info(`🚀 Servidor iniciado na porta ${port}`);
      this.logger.info(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      this.logger.info(`🔗 Health check: http://localhost:${port}/health`);
      this.logger.info(`📞 Webhook: http://localhost:${port}/webhook`);
    });
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start();
} 