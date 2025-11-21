# Configuración Docker para Trueque

Este documento describe cómo usar Docker para ejecutar todos los servicios del proyecto.

## Prerequisitos

- Docker Desktop instalado
- Docker Compose instalado

## Estructura de Servicios

El proyecto consta de tres servicios principales:

1. **modelo-nlp**: Servicio de Python Flask para procesamiento NLP (puerto 5000)
2. **backend**: Servicio Node.js Express API (puerto 3000)
3. **frontend**: Servicio React + Vite (puerto 5173)

## Configuración de Variables de Entorno

Antes de iniciar los servicios, debes crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Frontend
VITE_API_BASE_URL=http://localhost:3000

# Backend - Configuración ROBLE
FRONTEND_URL=http://localhost:5173
NLP_MODEL_URL=http://modelo-nlp:5000
ROBLE_API_URL=https://roble-api.openlab.uninorte.edu.co
ROBLE_PROJECT_ID=trueque_pfdiseno_b28d4fbe65
ROBLE_ADMIN_EMAIL=admin@swaply.com
ROBLE_ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Modelo NLP - Usa Supabase (ROBLE usa Supabase como backend)
# Obtén estas credenciales de tu configuración de ROBLE
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**Nota**: 
- El **backend** se conecta a ROBLE mediante la API REST de ROBLE (`https://roble-api.openlab.uninorte.edu.co`)
- El **modelo NLP** usa el cliente de Supabase directamente, ya que ROBLE utiliza Supabase como backend interno
- Las credenciales de Supabase se obtienen de tu proyecto ROBLE

## Comandos Docker

### Iniciar todos los servicios

```bash
docker-compose up -d
```

### Ver logs de todos los servicios

```bash
docker-compose logs -f
```

### Ver logs de un servicio específico

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f modelo-nlp
```

### Detener todos los servicios

```bash
docker-compose down
```

### Reconstruir los servicios (después de cambios en código)

```bash
docker-compose up -d --build
```

### Detener y eliminar volúmenes

```bash
docker-compose down -v
```

## URLs de los Servicios

Una vez iniciados los servicios, estarán disponibles en:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Backend API Docs**: http://localhost:3000/api-docs
- **Modelo NLP**: http://localhost:5000
- **Health Check Backend**: http://localhost:3000/health
- **Health Check NLP**: http://localhost:5000/health

## Troubleshooting

### Los servicios no inician

1. Verifica que los puertos 3000, 5000 y 5173 estén disponibles
2. Revisa los logs con `docker-compose logs`
3. Verifica que el archivo `.env` esté configurado correctamente

### Problemas de conexión entre servicios

1. Verifica que todos los servicios estén en la misma red Docker (`trueque-network`)
2. Usa los nombres de servicio como hostnames (ej: `modelo-nlp:5000`)
3. Revisa las variables de entorno de cada servicio

### Reconstruir un servicio específico

```bash
docker-compose up -d --build modelo-nlp
```

## Volúmenes

Los siguientes volúmenes son creados automáticamente:

- `nlp_chroma_db`: Almacena la base de datos ChromaDB para el modelo NLP
- `backend_uploads`: Almacena las imágenes subidas en el backend

Para limpiar los volúmenes:

```bash
docker-compose down -v
```

## Desarrollo vs Producción

- **Desarrollo**: Usa los Dockerfiles sin optimización para desarrollo rápido
- **Producción**: Usa `Dockerfile.prod` para builds optimizados

Para usar la versión de producción del frontend:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

(Nota: Necesitarías crear `docker-compose.prod.yml` si lo deseas)

