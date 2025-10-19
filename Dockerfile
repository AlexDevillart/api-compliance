# Build de runtime simples (Node 20 Alpine)
FROM node:20-alpine

WORKDIR /app

# Apenas package* para otimizar cache
COPY package*.json ./

# Instalação de dependências (sem dev)
RUN npm ci --omit=dev

# Copia o restante do projeto
COPY . .

# Porta exposta
EXPOSE 3001

# Comando de inicialização
CMD ["node", "server.js"]

