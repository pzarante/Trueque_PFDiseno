import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/offertsRoutes.js';
import truequesRoutes from './routes/truequesRoutes.js';
import ratingsRoutes from './routes/ratingsRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURACIÓN COMPLETA DE SWAGGER - TODAS LAS FUNCIONES
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Trueque - Swaply',
    version: '1.0.0',
    description: 'API completa para sistema de trueques entre usuarios',
    contact: {
      name: 'Equipo Swaply',
      email: 'support@swaply.com'
    }
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Servidor de desarrollo'
    }
  ],
  tags: [
    { name: 'Autenticación', description: 'Endpoints de registro y login' },
    { name: 'Usuarios', description: 'Gestión de perfiles de usuario' },
    { name: 'Productos', description: 'Gestión de productos para trueque' }
  ],
  paths: {
    // ==================== AUTENTICACIÓN ====================
    '/api/auth/register': {
      post: {
        summary: 'Registrar nuevo usuario',
        description: 'Crea un nuevo usuario en el sistema de trueques',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'ciudad'],
                properties: {
                  name: { 
                    type: 'string', 
                    example: 'Juan Pérez',
                    description: 'Nombre completo del usuario'
                  },
                  email: { 
                    type: 'string', 
                    format: 'email',
                    example: 'juan@example.com',
                    description: 'Email válido del usuario'
                  },
                  password: { 
                    type: 'string', 
                    format: 'password',
                    example: 'miContraseña123',
                    description: 'Contraseña segura'
                  },
                  ciudad: { 
                    type: 'string', 
                    example: 'Barranquilla',
                    description: 'Ciudad de residencia'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': { 
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Usuario registrado exitosamente en ROBLE y en la base de datos personalizada.'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/auth/login': {
      post: {
        summary: 'Iniciar sesión de usuario',
        description: 'Autentica al usuario y devuelve tokens de acceso',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { 
                    type: 'string', 
                    format: 'email',
                    example: 'juan@example.com'
                  },
                  password: { 
                    type: 'string', 
                    format: 'password',
                    example: 'miContraseña123'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': { 
            description: 'Credenciales correctas. Iniciando Sesion',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Credenciales correctas. Iniciando Sesion'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/auth/verify': {
      post: {
        summary: 'Verificar email de usuario',
        description: 'Valida el código de verificación enviado al email',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { 
                    type: 'string', 
                    format: 'email',
                    example: 'juan@example.com'
                  },
                  code: { 
                    type: 'string',
                    example: '123456',
                    description: 'Código de verificación recibido por email'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': { 
            description: 'Usuario Verificado. Puede iniciar sesion',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Usuario Verificado. Puede iniciar sesion'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/auth/forgot-password': {
      post: {
        summary: 'Solicitar recuperación de contraseña',
        description: 'Envía un email con instrucciones para recuperar contraseña',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { 
                    type: 'string', 
                    format: 'email',
                    example: 'juan@example.com'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { 
            description: 'Se ha enviado información a tu correo',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                  example: 'Se ha enviado información a tu correo'
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/auth/reset-password/{token}': {
      post: {
        summary: 'Restablecer contraseña',
        description: 'Cambia la contraseña usando el token de recuperación',
        tags: ['Autenticación'],
        parameters: [
          {
            name: 'token',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Token de recuperación recibido por email'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newPassword'],
                properties: {
                  newPassword: { 
                    type: 'string', 
                    format: 'password',
                    example: 'nuevaContraseña123',
                    description: 'Nueva contraseña segura'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { 
            description: 'Contraseña restablecida exitosamente'
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    // ==================== USUARIOS ====================
    '/api/users/profile': {
      get: {
        summary: 'Obtener perfil del usuario actual',
        description: 'Devuelve la información del perfil del usuario autenticado',
        tags: ['Usuarios'],
        responses: {
          '200': { 
            description: 'Información del usuario obtenida con éxito.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Información del usuario obtenida con éxito.'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' },
                          ciudad: { type: 'string' },
                          descripcion: { type: 'string' },
                          fecha_creacion: { type: 'string' },
                          active: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/users/update': {
      put: {
        summary: 'Actualizar perfil de usuario',
        description: 'Modifica la información del perfil del usuario',
        tags: ['Usuarios'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { 
                    type: 'string',
                    example: 'Juan Carlos Pérez',
                    description: 'Nuevo nombre del usuario'
                  },
                  ciudad: { 
                    type: 'string',
                    example: 'Cartagena',
                    description: 'Nueva ciudad de residencia'
                  },
                  descripcion: { 
                    type: 'string',
                    example: 'Amante de los trueques de tecnología',
                    description: 'Descripción personal del usuario'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { 
            description: 'Información del usuario actualizada con éxito.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Información del usuario actualizada con éxito.'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/users/deactivate': {
      post: {
        summary: 'Desactivar cuenta de usuario',
        description: 'Desactiva la cuenta del usuario actual (soft delete)',
        tags: ['Usuarios'],
        responses: {
          '200': { 
            description: 'Información del usuario actualizada con éxito.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Información del usuario actualizada con éxito.'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/users/productos': {
      get: {
        summary: 'Obtener productos del usuario actual',
        description: 'Devuelve todos los productos creados por el usuario autenticado',
        tags: ['Usuarios'],
        responses: {
          '200': { 
            description: 'Productos del usuario obtenidos con éxito.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Productos del usuario obtenidos con éxito.'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          nombre: { type: 'string' },
                          categoria: { type: 'string' },
                          estado: { type: 'string' },
                          ubicacion: { type: 'string' },
                          fechaCreacion: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/users/search': {
      get: {
        summary: 'Buscar productos con filtros',
        description: 'Busca productos aplicando filtros de categoría, ubicación y estado',
        tags: ['Usuarios'],
        parameters: [
          {
            name: 'categoria',
            in: 'query',
            required: false,
            schema: {
              type: 'string'
            },
            description: 'Filtrar por categoría específica'
          },
          {
            name: 'ubicacion',
            in: 'query',
            required: false,
            schema: {
              type: 'string'
            },
            description: 'Filtrar por ubicación específica'
          },
          {
            name: 'estado',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['borrador', 'publicado', 'pausado', 'completado']
            },
            description: 'Filtrar por estado del producto'
          }
        ],
        responses: {
          '200': { 
            description: 'Productos obtenidos con éxito.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Productos obtenidos con éxito.'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object'
                      }
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    // ==================== PRODUCTOS ====================
    '/api/products/OffertCreate': {
      post: {
        summary: 'Crear nuevo producto para trueque',
        description: 'Crea un nuevo producto con hasta 3 imágenes. Valida que no exista un producto con el mismo nombre para el usuario',
        tags: ['Productos'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['nombre', 'categoria', 'condicionesTrueque', 'comentarioNLP', 'ubicacion'],
                properties: {
                  nombre: { 
                    type: 'string',
                    example: 'Asador de carne',
                    description: 'Nombre único del producto para este usuario'
                  },
                  categoria: { 
                    type: 'string',
                    example: 'cocina',
                    description: 'Categoría del producto'
                  },
                  condicionesTrueque: { 
                    type: 'string',
                    example: 'Intercambio por horno o parrilla eléctrica',
                    description: 'Qué está buscando el usuario a cambio'
                  },
                  comentarioNLP: { 
                    type: 'string',
                    example: 'Asador en buen estado con 2 años de uso',
                    description: 'Descripción detallada del producto'
                  },
                  ubicacion: { 
                    type: 'string',
                    example: 'Barranquilla, Atlántico',
                    description: 'Ubicación del producto'
                  },
                  imagenes: {
                    type: 'array',
                    maxItems: 3,
                    items: { 
                      type: 'string', 
                      format: 'binary',
                      description: 'Máximo 3 imágenes (JPG, PNG, GIF) - 5MB máximo por imagen'
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': { 
            description: 'Producto creado exitosamente en la base de datos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Producto creado exitosamente en la base de datos'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Faltan campos obligatorios, demasiadas imágenes o ya existe un producto con ese nombre'
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/products/OffertUpdate': {
      put: {
        summary: 'Actualizar producto existente',
        description: 'Modifica la información de un producto existente del usuario',
        tags: ['Productos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { 
                    type: 'string',
                    example: 'Asador de carne actualizado',
                    description: 'Nombre del producto a actualizar'
                  },
                  categoria: { 
                    type: 'string',
                    example: 'cocina'
                  },
                  condicionesTrueque: { 
                    type: 'string',
                    example: 'Intercambio por horno o microondas'
                  },
                  comentarioNLP: { 
                    type: 'string',
                    example: 'Asador en excelente estado, apenas usado'
                  },
                  ubicacion: { 
                    type: 'string',
                    example: 'Soledad, Atlántico'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { 
            description: 'Actualizacion de producto exitosa',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                  example: 'Actualizacion de producto exitosa'
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/products/EditEstado': {
      put: {
        summary: 'Cambiar estado del producto',
        description: 'Actualiza el estado de un producto (borrador, publicado, pausado, etc.)',
        tags: ['Productos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['estado', 'nombre'],
                properties: {
                  estado: { 
                    type: 'string',
                    enum: ['borrador', 'publicado', 'pausado', 'completado'],
                    example: 'publicado',
                    description: 'Nuevo estado del producto'
                  },
                  nombre: { 
                    type: 'string',
                    example: 'Asador de carne',
                    description: 'Nombre del producto a actualizar'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { 
            description: 'Actualizacion de producto exitosa',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                  example: 'Actualizacion de producto exitosa'
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/products/DelateOffert': {
      delete: {
        summary: 'Eliminar producto',
        description: 'Elimina permanentemente un producto del sistema',
        tags: ['Productos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { 
                    type: 'string',
                    example: 'Asador de carne',
                    description: 'Nombre del producto a eliminar'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { 
            description: 'Oferta eliminada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      example: 'Oferta eliminada exitosamente'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      }
    },

    '/api/products/images/{filename}': {
      get: {
        summary: 'Obtener imagen de producto',
        description: 'Devuelve la imagen del producto solicitada',
        tags: ['Productos'],
        parameters: [
          {
            name: 'filename',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Nombre del archivo de imagen'
          }
        ],
        responses: {
          '200': { 
            description: 'Imagen devuelta exitosamente',
            content: {
              'image/*': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '404': {
            description: 'Imagen no encontrada'
          }
        }
      }
    }
  }
};
// RUTA DE SWAGGER 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Middlewares
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos por ahora, ajustar en producción
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/trueques', truequesRoutes);
app.use('/api/ratings', ratingsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'backend'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Trueque funcionando',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      products: '/api/products',
      trueques: '/api/trueques' 
    }
  });
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('user:connect', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`Usuario ${userId} conectado en socket ${socket.id}`);
  });

  socket.on('message:send', async (data) => {
    try {
      const { receiverId, senderId, message, tradeId } = data;
      
      const axios = (await import('axios')).default;
      const { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } = await import('./controllers/storeToken.js');
      
      let token = getAccessToken();
      let refreshToken = getRefreshToken();
      
      try {
        const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
          refreshToken: `${refreshToken}`
        });
        
        token = ref.data.accessToken;
        refreshToken = ref.data.refreshToken;
        
        setAccessToken(token);
        setRefreshToken(refreshToken);
        
        const messageData = {
          id_remitente: senderId,
          id_destinatario: receiverId,
          mensaje: message,
          id_trueque: tradeId || null,
          fecha_envio: new Date().toISOString(),
          leido: false
        };
        
        let messageRes;
        let messageId;
        
        try {
          messageRes = await axios.post(
            'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
            {
              tableName: 'mensajes',
              records: [messageData]
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          messageId = messageRes.data?.inserted?.[0] || Date.now().toString();
        } catch (insertError) {
          if (insertError.response?.status === 403 || insertError.response?.statusCode === 403) {
            console.log("Token de usuario sin permisos, usando token de admin para insertar mensaje (socket)");
            try {
              const adminLogin = await axios.post(
                'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
                {
                  email: "admin@swaply.com",
                  password: "12345@Dm"
                }
              );
              const adminToken = adminLogin.data.accessToken;
              
              messageRes = await axios.post(
                'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
                {
                  tableName: 'mensajes',
                  records: [messageData]
                },
                {
                  headers: { Authorization: `Bearer ${adminToken}` }
                }
              );
              messageId = messageRes.data?.inserted?.[0] || Date.now().toString();
            } catch (adminError) {
              console.error("Error al insertar mensaje con token de admin (socket):", adminError.response?.data || adminError.message);
              throw adminError;
            }
          } else {
            throw insertError;
          }
        }
        
        try {
          const nlpModelUrl = process.env.NLP_MODEL_URL || 'http://localhost:5000';
          await axios.post(`${nlpModelUrl}/nlp/process_message`, {
            message_id: messageId,
            sender_id: senderId,
            receiver_id: receiverId,
            message: message,
            trade_id: tradeId || null,
            conversation_id: `${senderId}_${receiverId}`
          });
        } catch (nlpError) {
          console.error("Error procesando mensaje con NLP (socket):", nlpError.message);
        }
        
        const savedMessage = {
          id: messageId,
          _id: messageId,
          senderId,
          receiverId,
          message: message,
          mensaje: message,
          tradeId,
          timestamp: messageData.fecha_envio,
          fecha_envio: messageData.fecha_envio,
        };
        
        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', savedMessage);
        }
        
        socket.emit('message:sent', {
          ...savedMessage,
          receiverId: receiverId,
        });
      } catch (dbError) {
        console.error('Error guardando mensaje en DB:', dbError);
        socket.emit('message:error', { 
          error: 'Error al guardar mensaje en la base de datos',
          details: dbError.message 
        });
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      socket.emit('message:error', { error: 'Error al enviar mensaje' });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`Usuario ${socket.userId} desconectado`);
    }
    console.log('Usuario desconectado:', socket.id);
  });
});

async function initializeBackendToken() {
  try {
    const axios = (await import('axios')).default;
    const { setAccessToken, setRefreshToken, setEmail } = await import('./controllers/storeToken.js');
    
    const loginRes = await axios.post(
      'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
      {
        email: "admin@swaply.com",
        password: "12345@Dm"
      }
    );
    
    setAccessToken(loginRes.data.accessToken);
    setRefreshToken(loginRes.data.refreshToken);
    setEmail("admin@swaply.com");
    
    console.log('Token de admin inicializado correctamente');
  } catch (error) {
    console.error('Error inicializando token de admin:', error.message);
    console.log('El servidor seguirá funcionando, pero algunas operaciones pueden fallar hasta que un usuario inicie sesión');
  }
}

initializeBackendToken().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`Socket.IO servidor activo`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: El puerto ${PORT} ya está en uso.`);
      console.error(`Solucion: Get-NetTCPConnection -LocalPort ${PORT} -State Listen | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }`);
      process.exit(1);
    } else {
      console.error('Error al iniciar el servidor:', err);
      process.exit(1);
    }
  });
}).catch((err) => {
  console.error('Error inicializando el backend:', err);
  process.exit(1);
});