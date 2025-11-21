FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

# Exponer puerto 3000 (Vite mapeado a 3000 en docker-compose)
EXPOSE 3000

# Para desarrollo: usar vite dev server
# Para producción: hacer build y servir con nginx (ver Dockerfile.prod)
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]