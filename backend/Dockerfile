# ---- STAGE 1: BUILD ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

# Compilar TypeScript a /dist
RUN npm run build


# ---- STAGE 2: RUN ----
FROM node:20-alpine

WORKDIR /app

# Copiar dist y node_modules sin dependencias de dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Exponer puerto NestJS
EXPOSE 3000

# Ejecutar backend compilado => igual a start:prod
CMD ["node", "dist/main.js"]
