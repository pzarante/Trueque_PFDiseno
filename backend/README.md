## Project setup

```bash
$ npm install
$ npm install axios
$ npm install --save-dev @types/axios
$ npm install dotenv
$ npm install @nestjs/config
```
Para ejecutar:
cd backend;

crear la imagen: cd backend; docker build -t backend-auditoria . 

correr el Dockerfile: 
docker run --env-file .env -p 3000:3000 backend-auditoria

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
