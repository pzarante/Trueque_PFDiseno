import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { User } from '../App';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar token y obtener usuario al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Intentar obtener información del usuario autenticado
        let userData;
        try {
          userData = await authAPI.getMe();
        } catch (meError) {
          // Si /api/auth/me no existe, intentar con /api/users/profile
          const { userAPI } = await import('../services/api');
          userData = await userAPI.getProfile();
          // El perfil puede venir en formato { data: [...] } o directamente
          if (userData && typeof userData === 'object' && 'data' in userData) {
            userData = userData.data;
          }
        }
        
        // El backend puede devolver los datos en diferentes formatos
        const userInfo = Array.isArray(userData) ? userData[0] : userData;
        
        if (userInfo) {
          const authenticatedUser: User = {
            id: userInfo._id || userInfo.id || Date.now().toString(),
            name: userInfo.name || 'Usuario',
            email: userInfo.email || '',
            role: userInfo.role || 'user',
            city: userInfo.ciudad || userInfo.city || 'Bogotá',
            joinedDate: userInfo.fecha_creacion || userInfo.joinedDate || new Date().toISOString(),
            favorites: userInfo.favorites || [],
            activities: userInfo.activities || [],
            isActive: userInfo.active !== false && userInfo.isActive !== false,
          };

          if (authenticatedUser.isActive) {
            setUser(authenticatedUser);
            setIsAuthenticated(true);
          } else {
            // Si la cuenta está desactivada, limpiar token
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        // Si hay error (token inválido, expirado, etc.), limpiar token
        console.error('Error verificando autenticación:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, captchaToken?: string) => {
    try {
      const response = await authAPI.login(email, password, captchaToken);
      
      // Obtener información del usuario después del login
      let userData;
      try {
        userData = await authAPI.getMe();
      } catch (meError) {
        // Si /api/auth/me no existe, intentar con /api/users/profile
        const { userAPI } = await import('../services/api');
        userData = await userAPI.getProfile();
        // El perfil puede venir en formato { data: [...] } o directamente
        if (userData && typeof userData === 'object' && 'data' in userData) {
          userData = userData.data;
        }
      }
      
      const userInfo = Array.isArray(userData) ? userData[0] : userData;
      
      if (userInfo) {
        const loggedUser: User = {
          id: userInfo._id || userInfo.id || Date.now().toString(),
          name: userInfo.name || 'Usuario',
          email: userInfo.email || email,
          role: userInfo.role || 'user',
          city: userInfo.ciudad || userInfo.city || 'Bogotá',
          joinedDate: userInfo.fecha_creacion || userInfo.joinedDate || new Date().toISOString(),
          favorites: userInfo.favorites || [],
          activities: userInfo.activities || [],
          isActive: userInfo.active !== false && userInfo.isActive !== false,
        };

        if (!loggedUser.isActive) {
          authAPI.logout();
          throw new Error('Esta cuenta ha sido desactivada. Contacta al administrador.');
        }

        setUser(loggedUser);
        setIsAuthenticated(true);
        return { success: true, user: loggedUser };
      }
      
      throw new Error('No se pudo obtener la información del usuario');
    } catch (error: any) {
      // Preservar información del error para el componente
      // El error puede venir de authAPI.login o de getMe
      const errorData = error.errorData || {};
      const status = error.status;
      
      // Si el error es de verificación, no limpiar el token aún
      if (!errorData.requiresVerification && status !== 403) {
        authAPI.logout();
      }
      
      // Asegurar que el error tenga la información necesaria
      (error as any).errorData = errorData;
      (error as any).status = status;
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    setUser, // Para permitir actualizaciones externas si es necesario
  };
}

