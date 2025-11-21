# Guía de Despliegue en Vercel

Esta guía explica cómo desplegar el proyecto Trueque en Vercel.

## Arquitectura de Despliegue

Para desplegar en producción, necesitarás:

1. **Frontend**: Vercel (servicio estático)
2. **Backend**: Railway, Render, o AWS (API Node.js)
3. **Modelo NLP**: Railway, Render, o AWS (API Python Flask)

## Paso 1: Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a tu proyecto y configura las siguientes variables de entorno:

### Variables de Entorno del Frontend

```
VITE_API_BASE_URL=https://your-backend-url.com
```

Donde `your-backend-url.com` es la URL donde desplegaste el backend.

## Paso 2: Desplegar el Frontend en Vercel

### Opción A: Usando la CLI de Vercel

```bash
cd frontend
vercel
```

### Opción B: Conectar con GitHub

1. Conecta tu repositorio de GitHub con Vercel
2. Selecciona el directorio `frontend/` como raíz
3. Configura el Build Command: `npm run build`
4. Configura el Output Directory: `build`
5. Agrega las variables de entorno

### Configuración del Build

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm ci`

## Paso 3: Desplegar el Backend

### Opción A: Railway

1. Crea una cuenta en Railway.app
2. Conecta tu repositorio
3. Selecciona el directorio `backend/`
4. Railway detectará automáticamente el Dockerfile
5. Configura las variables de entorno necesarias

### Variables de Entorno del Backend

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-vercel-app.vercel.app
NLP_MODEL_URL=https://your-nlp-model-url.com
# ROBLE Configuration
ROBLE_API_URL=https://roble-api.openlab.uninorte.edu.co
ROBLE_PROJECT_ID=trueque_pfdiseno_b28d4fbe65
ROBLE_ADMIN_EMAIL=admin@swaply.com
ROBLE_ADMIN_PASSWORD=your_admin_password
# Otras configuraciones
JWT_SECRET=your_jwt_secret_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

**Nota**: El backend se conecta directamente a ROBLE mediante su API REST. No requiere configuración de base de datos tradicional.

### Opción B: Render

1. Crea una cuenta en Render.com
2. Crea un nuevo "Web Service"
3. Conecta tu repositorio
4. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci`
   - **Start Command**: `node src/index.js`
   - **Environment**: Node

## Paso 4: Desplegar el Modelo NLP

### Opción A: Railway

1. Crea otro servicio en Railway
2. Selecciona el directorio `modelo_NLP/`
3. Railway detectará el Dockerfile
4. Configura las variables de entorno

### Variables de Entorno del Modelo NLP

```env
FLASK_ENV=production
# Supabase credentials (ROBLE usa Supabase como backend)
# Obtén estas credenciales de tu configuración de ROBLE
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**Nota**: El modelo NLP usa el cliente de Supabase directamente porque ROBLE utiliza Supabase como backend interno. Necesitas las credenciales de Supabase de tu proyecto ROBLE.

### Opción B: Render

1. Crea un nuevo "Web Service" en Render
2. Selecciona el directorio `modelo_NLP/`
3. Configura:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Environment**: Python 3

## Paso 5: Actualizar URLs

Después de desplegar todos los servicios:

1. Actualiza `VITE_API_BASE_URL` en Vercel con la URL del backend
2. Actualiza `NLP_MODEL_URL` en el backend con la URL del modelo NLP
3. Actualiza `FRONTEND_URL` en el backend con la URL de Vercel

## Configuración de CORS

Asegúrate de que el backend tenga configurado el CORS correctamente para permitir requests desde tu dominio de Vercel:

```javascript
origin: ['https://your-vercel-app.vercel.app', 'https://your-vercel-app.vercel.app/*']
```

## Estructura de archivos vercel.json

El archivo `vercel.json` en la raíz está configurado para:

- Servir la aplicación React como SPA
- Redirigir todas las rutas a `/index.html`
- Proxy de API (opcional) hacia el backend

## Troubleshooting

### Build falla en Vercel

1. Verifica que `package.json` tenga el script `build`
2. Verifica que el `Output Directory` sea `build` (no `dist`)
3. Revisa los logs de build en Vercel

### Error de CORS

1. Verifica que `FRONTEND_URL` en el backend incluya tu dominio de Vercel
2. Verifica que no haya trailing slashes en las URLs
3. Revisa la configuración de CORS en el backend

### Variables de entorno no funcionan

1. Las variables de Vite deben comenzar con `VITE_`
2. Reinicia el build después de agregar variables de entorno
3. Verifica que los valores estén correctamente configurados

## URLs de Producción

Después del despliegue, tendrás:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend-url.railway.app` (o similar)
- **NLP Model**: `https://your-nlp-url.railway.app` (o similar)

## Monitoreo

- Usa Vercel Analytics para el frontend
- Usa los logs de Railway/Render para backend y NLP
- Configura alertas para errores críticos

