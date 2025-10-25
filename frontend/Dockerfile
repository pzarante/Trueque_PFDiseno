FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

# Usa npx para ejecutar vite directamente
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]