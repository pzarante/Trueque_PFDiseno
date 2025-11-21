const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3000';

// Helper para obtener el token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper para hacer requests
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      // El backend puede devolver error, detalles, o message
      const errorMessage = errorData.detalles 
        ? (typeof errorData.detalles === 'string' ? errorData.detalles : JSON.stringify(errorData.detalles))
        : (errorData.message || errorData.error || `Error: ${response.status}`);
      const error = new Error(errorMessage);
      // Guardar toda la información del error para acceso posterior
      (error as any).errorData = errorData;
      (error as any).status = response.status;
      (error as any).response = response;
      throw error;
    }

    return response.json();
  } catch (error: any) {
    // Si es un error de red, proporcionar un mensaje más claro
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000');
    }
    throw error;
  }
};

const requestFormData = async <T>(
  endpoint: string,
  formData: FormData
): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || error.error || `Error: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000');
    }
    throw error;
  }
};

// ==================== AUTENTICACIÓN ====================
export const authAPI = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    ciudad: string;
    captchaToken?: string;
  }) => {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        captchaToken: data.captchaToken,
      }),
    });
  },

  login: async (email: string, password: string, captchaToken?: string) => {
    try {
      const response = await request<{ token?: string; message?: string; accessToken?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, captchaToken }),
      });
      
      // Si el backend devuelve un token o accessToken, guardarlo
      if (response.token) {
        localStorage.setItem('token', response.token);
      } else if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);
      }
      
      return response;
    } catch (error: any) {
      // Preservar información del error para que el hook pueda detectar verificación
      throw error;
    }
  },

  verify: async (email: string, code: string) => {
    return request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  resendVerificationCode: async (email: string, password?: string) => {
    return request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  forgotPassword: async (email: string) => {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return request(`/api/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  getMe: async () => {
    return request('/api/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// ==================== USUARIOS ====================
export const userAPI = {
  getProfile: async () => {
    // El backend usa el email del storeToken, así que solo necesitamos el token
    return request('/api/users/profile');
  },

  updateProfile: async (data: {
    name?: string;
    ciudad?: string;
    descripcion?: string;
  }) => {
    return request('/api/users/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deactivate: async () => {
    return request('/api/users/deactivate', {
      method: 'POST',
    });
  },

  getReputation: async () => {
    return request('/api/users/reputation');
  },

  toggleUserStatus: async (userEmail: string, active: boolean) => {
    return request('/api/users/admin/toggle-status', {
      method: 'PUT',
      body: JSON.stringify({ userEmail, active }),
    });
  },

  getProducts: async () => {
    return request('/api/users/productos');
  },

  getAllPublishedProducts: async () => {
    return request('/api/users/all-published');
  },

  getProfileById: async (userId: string) => {
    return request(`/api/users/profile/${userId}`);
  },

  getConversations: async () => {
    return request('/api/users/conversations');
  },

  sendMessage: async (data: {
    receiverId: string;
    message: string;
    tradeId?: string;
  }) => {
    return request('/api/users/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMessages: async (userId: string) => {
    return request(`/api/users/messages/${userId}`);
  },

  search: async (filters?: {
    categoria?: string;
    ubicacion?: string;
    estado?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.categoria) params.append('categoria', filters.categoria);
    if (filters?.ubicacion) params.append('ubicacion', filters.ubicacion);
    if (filters?.estado) params.append('estado', filters.estado);
    
    const query = params.toString();
    return request(`/api/users/search${query ? `?${query}` : ''}`);
  },

  semanticSearch: async (query: string, filters?: {
    categoria?: string;
    ubicacion?: string;
    estado?: string;
    n?: number;
  }) => {
    const params = new URLSearchParams();
    params.append('query', query);
    if (filters?.categoria) params.append('category', filters.categoria);
    if (filters?.ubicacion) params.append('ubicacion', filters.ubicacion);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.n) params.append('n', filters.n.toString());
    
    return request(`/api/users/semantic-search?${params.toString()}`);
  },
};

// ==================== CALIFICACIONES ====================
export const ratingsAPI = {
  create: async (data: {
    tradeId: string;
    ratedUserId: string;
    rating: number;
  }) => {
    return request('/api/ratings', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        comment: "", // Siempre cadena vacía, solo se guardan estrellas
      }),
    });
  },
  
  getUserRatings: async (userId: string) => {
    return request(`/api/ratings/${userId}`);
  },
  
  checkRatingStatus: async (tradeId: string) => {
    return request(`/api/ratings/trade/${tradeId}/status`);
  },
};

// ==================== PRODUCTOS ====================
export const productAPI = {
  create: async (data: {
    nombre: string;
    categoria: string;
    condicionesTrueque: string;
    comentarioNLP: string;
    ubicacion: string;
    imagenes?: File[];
    estado: string;
  }) => {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('categoria', data.categoria);
    formData.append('condicionesTrueque', data.condicionesTrueque);
    formData.append('comentarioNLP', data.comentarioNLP);
    formData.append('ubicacion', data.ubicacion);
    formData.append('estado', data.estado);

    if (data.imagenes) {
      data.imagenes.forEach((image) => {
        formData.append('imagenes', image);
      });
    }

    return requestFormData('/api/products/OffertCreate', formData);
  },

  update: async (data: {
    nombre: string;
    categoria?: string;
    condicionesTrueque?: string;
    comentarioNLP?: string;
    ubicacion?: string;
  }) => {
    return request('/api/products/OffertUpdate', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (nombre: string, estado: string) => {
    return request('/api/products/EditEstado', {
      method: 'PUT',
      body: JSON.stringify({ nombre, estado }),
    });
  },

  delete: async (nombre: string) => {
    return request('/api/products/DelateOffert', {
      method: 'DELETE',
      body: JSON.stringify({ nombre }),
    });
  },

  getImage: (filename: string) => {
    return `${API_BASE_URL}/api/products/images/${filename}`;
  },
};

// ==================== TRUEQUES ====================
export const truequesAPI = {
  propose: async (data: {
    id_producto_oferente: string;
    id_producto_destinatario: string;
  }) => {
    return request('/api/trueques/propose', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  confirm: async (tradeId: string, accion: 'aceptar' | 'rechazar') => {
    return request(`/api/trueques/${tradeId}/confirm`, {
      method: 'PUT',
      body: JSON.stringify({ accion }),
    });
  },

  getMyTrades: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request(`/api/trueques/my-trades${query}`);
  },
};

