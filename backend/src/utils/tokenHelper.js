import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, getEmail } from '../controllers/storeToken.js';

export const refreshTokenIfNeeded = async () => {
  try {
    let token = getAccessToken();
    let refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible. Por favor, vuelve a iniciar sesión.');
    }
    
    const ref = await axios.post(
      "https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",
      {
        refreshToken: `${refreshToken}`
      }
    );
    
    if (ref.data && ref.data.accessToken) {
      token = ref.data.accessToken;
      refreshToken = ref.data.refreshToken || refreshToken;
      
      setAccessToken(token);
      setRefreshToken(refreshToken);
      
      return { token, refreshToken, success: true };
    }
    
    throw new Error('No se pudo refrescar el token');
  } catch (error) {
    console.error("Error al refrescar token:", error.response?.data || error.message);
    
    if (error.response?.status === 401 || error.response?.statusCode === 401) {
      throw new Error('El refresh token expiró. Por favor, vuelve a iniciar sesión.');
    }
    
    throw error;
  }
};

export const makeRobleRequest = async (config, retries = 2) => {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      let token = getAccessToken();
      
      if (i > 0 || !token) {
        await refreshTokenIfNeeded();
        token = getAccessToken();
      }
      
      const response = await axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`
        }
      });
      
      return response;
    } catch (error) {
      lastError = error;
      
      if (error.response?.status === 401 || error.response?.statusCode === 401) {
        if (i < retries) {
          console.log(`Token expirado, intentando refrescar (intento ${i + 1}/${retries})...`);
          try {
            await refreshTokenIfNeeded();
            continue;
          } catch (refreshError) {
            throw new Error('El token expiró y no se pudo refrescar. Por favor, vuelve a iniciar sesión.');
          }
        }
      }
      
      if (i === retries) {
        throw error;
      }
    }
  }
  
  throw lastError || new Error('Error al realizar la solicitud');
};

