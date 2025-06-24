FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor porta
EXPOSE 3000

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Alterar ownership dos arquivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Comando para iniciar a aplicação
CMD ["npm", "start"] 