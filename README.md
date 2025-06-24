# ChatGuru API - Sistema de Pedidos por WhatsApp

API completa para integração com ChatGuru, permitindo que clientes façam pedidos através do WhatsApp com fluxo conversacional inteligente.

## 🚀 Características

- **Integração ChatGuru**: Comunicação bidirecional via webhooks
- **Fluxo Conversacional**: Interface intuitiva por mensagens
- **Clean Architecture**: Estrutura modular e testável
- **DDD (Domain Driven Design)**: Modelagem rica do domínio
- **Banco Firebird**: Integração com sistema legado
- **Sessões em Memória**: Gerenciamento temporário de conversas
- **Rate Limiting**: Proteção contra abuso
- **Email Automático**: Confirmações e atualizações de pedidos
- **Logs Estruturados**: Monitoramento completo
- **Docker Ready**: Containerização simplificada

## 🏗️ Arquitetura

```
src/
├── domain/                 # Regras de negócio
│   ├── entities/          # Entidades do domínio
│   ├── repositories/      # Interfaces dos repositórios
│   └── services/          # Interfaces dos serviços
├── application/           # Casos de uso
│   └── usecases/         # Lógica de aplicação
└── infrastructure/        # Implementações
    ├── repositories/      # Repositórios concretos
    ├── services/         # Serviços concretos
    ├── web/              # Controllers e middlewares
    └── logging/          # Sistema de logs
```

## 📋 Fluxo de Pedidos

1. **Boas-vindas**: Mensagem inicial com opções
2. **Menu Principal**: Navegação por categorias
3. **Seleção de Itens**: Adição ao carrinho
4. **Dados do Cliente**: Coleta de informações
5. **Endereço**: Dados para entrega
6. **Pagamento**: Seleção da forma de pagamento
7. **Confirmação**: Revisão final do pedido
8. **Email**: Confirmação automática por email

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- Banco Firebird
- Conta ChatGuru com API ativada
- Servidor SMTP para emails

### 1. Clone o repositório

```bash
git clone <repository-url>
cd chatguru-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Servidor
PORT=3000
NODE_ENV=development

# ChatGuru
CHATGURU_API_URL=https://app.zap.guru/api/v1
CHATGURU_API_KEY=sua_chave_api
CHATGURU_ACCOUNT_ID=seu_account_id
CHATGURU_PHONE_ID=seu_phone_id

# Firebird
FIREBIRD_HOST=localhost
FIREBIRD_PORT=3050
FIREBIRD_DATABASE=/caminho/para/database.fdb
FIREBIRD_USER=sysdba
FIREBIRD_PASSWORD=masterkey

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app
EMAIL_FROM=seu_email@gmail.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Sessões
SESSION_TIMEOUT_MS=1800000
```

### 4. Configure o banco de dados

Execute o script SQL no seu banco Firebird:

```bash
# Conecte ao seu banco Firebird e execute:
# database/schema.sql
```

### 5. Compile e execute

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🐳 Docker

### Build da imagem

```bash
npm run docker:build
```

### Executar container

```bash
npm run docker:run
```

### Docker Compose (opcional)

```yaml
version: '3.8'
services:
  chatguru-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      # ... outras variáveis do .env
    restart: unless-stopped
```

## 📡 Configuração do ChatGuru

### 1. Ative a API no ChatGuru

- Acesse sua conta ChatGuru
- Vá em Configurações > API
- Solicite ativação da API
- Anote as credenciais fornecidas

### 2. Configure o Webhook

No ChatGuru, configure o webhook para:
```
URL: https://seu-dominio.com/webhook
Método: POST
```

### 3. Formato do Webhook

O ChatGuru enviará dados no formato:

```json
{
  "phone": "5511999999999",
  "message": "Texto da mensagem",
  "from": "nome_do_contato",
  "type": "text"
}
```

## 🔧 API Endpoints

### GET /health
Verificação de saúde da aplicação

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600
}
```

### POST /webhook
Recebe mensagens do ChatGuru

**Payload:**
```json
{
  "phone": "5511999999999",
  "message": "Olá"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Mensagem processada com sucesso"
}
```

## 📊 Monitoramento

### Logs

Os logs são estruturados em JSON e incluem:

- Requisições HTTP
- Erros de aplicação
- Processos de negócio
- Métricas de performance

### Health Check

```bash
curl http://localhost:3000/health
```

### Rate Limiting

- Limite padrão: 100 requisições por 15 minutos
- Headers de controle incluídos na resposta
- Mensagens de erro personalizadas

## 🔒 Segurança

- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origem
- **Rate Limiting**: Proteção contra abuso
- **Validação**: Sanitização de entrada
- **Logs**: Auditoria completa

## 📝 Desenvolvimento

### Estrutura de Camadas

**Domain (Domínio)**
- Entidades com regras de negócio
- Interfaces de repositórios e serviços
- Zero dependências externas

**Application (Aplicação)**
- Casos de uso (Use Cases)
- Orquestração de processos
- Lógica de aplicação

**Infrastructure (Infraestrutura)**
- Implementações concretas
- Integrações externas
- Detalhes técnicos

### Testes

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch
```

### Padrões de Código

- TypeScript strict mode
- ESLint para qualidade
- Prettier para formatação
- Conventional Commits

## 🚀 Melhorias Sugeridas

### Funcionalidades Básicas

1. **Sistema de Cupons**
   - Desconto por código
   - Promoções especiais
   - Fidelidade do cliente

2. **Rastreamento de Pedidos**
   - Status em tempo real
   - Integração com entregadores
   - Notificações automáticas

3. **Avaliações**
   - Feedback pós-entrega
   - Sistema de notas
   - Comentários dos clientes

4. **Programa de Fidelidade**
   - Pontos por compra
   - Recompensas
   - Níveis de cliente

### Funcionalidades Avançadas

5. **Analytics Avançado**
   - Dashboard de métricas
   - Relatórios de vendas
   - Análise de comportamento

6. **Integrações**
   - Sistemas de pagamento (PIX, cartão)
   - ERPs existentes
   - Sistemas de delivery

7. **IA e Automação**
   - Chatbot mais inteligente
   - Recomendações personalizadas
   - Processamento de linguagem natural

8. **Multi-tenant**
   - Suporte a múltiplos restaurantes
   - Configurações independentes
   - Dashboard centralizado

### Melhorias Técnicas

9. **Cache Inteligente**
   - Redis para sessões
   - Cache de menu
   - Invalidação automática

10. **Base de Dados**
    - Migração para PostgreSQL
    - Backup automático
    - Réplicas de leitura

11. **Observabilidade**
    - Métricas Prometheus
    - Traces distribuídos
    - Alertas automatizados

12. **Escalabilidade**
    - Load balancer
    - Horizontal scaling
    - Message queues

## 📞 Suporte

Para dúvidas sobre:

- **API**: Consulte a documentação do ChatGuru
- **Banco Firebird**: Documentação oficial Firebird
- **Configuração**: Verifique os logs da aplicação
- **Desenvolvimento**: Issues no repositório

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ para automatizar pedidos via WhatsApp** 