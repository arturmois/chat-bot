# Multi-stage build para otimização de produção
FROM node:lts-alpine AS base

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

# Estágio de dependências de produção
FROM base AS deps
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Estágio de build
FROM base AS builder
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Remove arquivos desnecessários após build
RUN rm -rf src/ tsconfig.json

# Estágio de produção
FROM base AS runner
WORKDIR /app

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Criar grupo e usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs apiuser

# Copiar arquivos necessários do estágio de build
COPY --from=builder --chown=apiuser:nodejs /app/dist ./dist
COPY --from=deps --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --chown=apiuser:nodejs package*.json ./

# Definir usuário não-root
USER apiuser

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Usar dumb-init como PID 1 e executar a aplicação
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/infrastructure/web/server.js"] 