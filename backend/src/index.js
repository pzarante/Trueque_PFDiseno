import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/offertsRoutes.js';
import truequesRoutes from './routes/truequesRoutes.js';

dotenv.config();

const app = express();
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/trueques', truequesRoutes);

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
});