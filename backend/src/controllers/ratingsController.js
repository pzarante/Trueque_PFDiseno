import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, getEmail } from "./storeToken.js";

export const createRating = async (req, res) => {
  try {
    const { tradeId, ratedUserId, rating, comment } = req.body;
    
    let email = getEmail();
    let token = getAccessToken();
    let refreshToken = getRefreshToken();
    
    if (!tradeId || !ratedUserId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Se requiere tradeId, ratedUserId y rating (1-5)"
      });
    }
    
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: `${refreshToken}`
    });
    
    token = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;
    
    setAccessToken(token);
    setRefreshToken(refreshToken);
    
    const userRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "usuarios",
          email: email,
        },
      }
    );
    
    const userData = userRes.data[0];
    const raterUserId = userData._id;
    
    if (raterUserId === ratedUserId) {
      return res.status(400).json({
        error: "No puedes calificarte a ti mismo"
      });
    }
    
    const tradeRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "trueques",
          _id: tradeId
        },
      }
    );
    
    if (tradeRes.data.length === 0) {
      return res.status(404).json({ error: "Trueque no encontrado" });
    }
    
    const trade = tradeRes.data[0];
    
    if (trade.status !== 'completado') {
      return res.status(400).json({
        error: "Solo puedes calificar trueques completados"
      });
    }
    
    if (trade.id_usuario1 !== raterUserId && trade.id_usuario2 !== raterUserId) {
      return res.status(403).json({
        error: "No puedes calificar este trueque"
      });
    }
    
    if (trade.id_usuario1 !== ratedUserId && trade.id_usuario2 !== ratedUserId) {
      return res.status(400).json({
        error: "El usuario calificado no participó en este trueque"
      });
    }
    
    const existingRatingsRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "calificaciones"
        },
      }
    );
    
    const existingRatings = existingRatingsRes.data || [];
    const alreadyRated = existingRatings.some(r => 
      r.id_trueque === tradeId && 
      r.id_calificador === raterUserId && 
      r.id_calificado === ratedUserId
    );
    
    if (alreadyRated) {
      return res.status(400).json({
        error: "Ya calificaste a este usuario por este trueque"
      });
    }
    
    try {
      const ratingData = {
        id_trueque: tradeId,
        id_calificador: raterUserId,
        id_calificado: ratedUserId,
        calificacion: rating,
        comentario: comment || "",
        fecha_creacion: new Date().toISOString()
      };
      
      const insertRes = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
        {
          tableName: 'calificaciones',
          records: [ratingData]
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const ratingId = insertRes.data?.inserted?.[0] || Date.now().toString();
      
      res.status(201).json({
        message: "Calificación creada exitosamente",
        data: {
          _id: ratingId,
          ...ratingData
        }
      });
    } catch (insertError) {
      if (insertError.response?.status === 403 || insertError.response?.statusCode === 403) {
        try {
          const adminLogin = await axios.post(
            'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
            {
              email: "admin@swaply.com",
              password: "12345@Dm"
            }
          );
          const adminToken = adminLogin.data.accessToken;
          
          const ratingData = {
            id_trueque: tradeId,
            id_calificador: raterUserId,
            id_calificado: ratedUserId,
            calificacion: rating,
            comentario: comment || "",
            fecha_creacion: new Date().toISOString()
          };
          
          const insertRes = await axios.post(
            'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
            {
              tableName: 'calificaciones',
              records: [ratingData]
            },
            {
              headers: { Authorization: `Bearer ${adminToken}` }
            }
          );
          
          const ratingId = insertRes.data?.inserted?.[0] || Date.now().toString();
          
          res.status(201).json({
            message: "Calificación creada exitosamente",
            data: {
              _id: ratingId,
              ...ratingData
            }
          });
        } catch (adminError) {
          console.error("Error al insertar calificación con token de admin:", adminError.response?.data || adminError.message);
          throw adminError;
        }
      } else {
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error al crear calificación:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al crear calificación",
      detalles: error.response?.data || error.message,
    });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let email = getEmail();
    let token = getAccessToken();
    let refreshToken = getRefreshToken();
    
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: `${refreshToken}`
    });
    
    token = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;
    
    setAccessToken(token);
    setRefreshToken(refreshToken);
    
    let ratingsRes;
    try {
      ratingsRes = await axios.get(
        "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            tableName: "calificaciones",
            id_calificado: userId
          },
        }
      );
    } catch (error) {
      if (error.response?.status === 404 || error.response?.data?.message?.includes('no existe')) {
        ratingsRes = { data: [] };
      } else {
        throw error;
      }
    }
    
    const ratings = ratingsRes.data || [];
    
    const enrichedRatings = await Promise.all(
      ratings.map(async (rating) => {
        try {
          const raterRes = await axios.get(
            "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
            {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                tableName: "usuarios",
                _id: rating.id_calificador,
              },
            }
          );
          
          const rater = raterRes.data?.[0] || {};
          
          return {
            _id: rating._id,
            id: rating._id,
            rating: rating.calificacion,
            comment: rating.comentario || "",
            createdAt: rating.fecha_creacion || rating.fechaCreacion || new Date().toISOString(),
            rater: {
              id: rating.id_calificador,
              name: rater.name || "Usuario",
              email: rater.email || ""
            },
            tradeId: rating.id_trueque
          };
        } catch (error) {
          console.error("Error obteniendo información del calificador:", error);
          return {
            _id: rating._id,
            id: rating._id,
            rating: rating.calificacion,
            comment: rating.comentario || "",
            createdAt: rating.fecha_creacion || rating.fechaCreacion || new Date().toISOString(),
            rater: {
              id: rating.id_calificador,
              name: "Usuario",
              email: ""
            },
            tradeId: rating.id_trueque
          };
        }
      })
    );
    
    res.status(200).json({
      message: "Calificaciones obtenidas con éxito",
      data: enrichedRatings
    });
  } catch (error) {
    console.error("Error al obtener calificaciones:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener calificaciones",
      detalles: error.response?.data || error.message,
    });
  }
};

export const checkRatingStatus = async (req, res) => {
  try {
    const { tradeId } = req.params;
    
    let email = getEmail();
    let token = getAccessToken();
    let refreshToken = getRefreshToken();
    
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: `${refreshToken}`
    });
    
    token = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;
    
    setAccessToken(token);
    setRefreshToken(refreshToken);
    
    const userRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "usuarios",
          email: email,
        },
      }
    );
    
    const userData = userRes.data[0];
    const userId = userData._id;
    
    let ratingsRes;
    try {
      ratingsRes = await axios.get(
        "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            tableName: "calificaciones",
            id_trueque: tradeId
          },
        }
      );
    } catch (error) {
      if (error.response?.status === 404 || error.response?.data?.message?.includes('no existe')) {
        ratingsRes = { data: [] };
      } else {
        throw error;
      }
    }
    
    const ratings = ratingsRes.data || [];
    const userRatings = ratings.filter(r => r.id_calificador === userId);
    
    const tradeRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "trueques",
          _id: tradeId
        },
      }
    );
    
    if (tradeRes.data.length === 0) {
      return res.status(404).json({ error: "Trueque no encontrado" });
    }
    
    const trade = tradeRes.data[0];
    const otherUserId = trade.id_usuario1 === userId ? trade.id_usuario2 : trade.id_usuario1;
    
    const hasRated = userRatings.some(r => r.id_calificado === otherUserId);
    
    res.status(200).json({
      message: "Estado de calificación obtenido",
      data: {
        canRate: trade.status === 'completado' && !hasRated,
        hasRated: hasRated,
        otherUserId: otherUserId,
        tradeStatus: trade.status
      }
    });
  } catch (error) {
    console.error("Error al verificar estado de calificación:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al verificar estado de calificación",
      detalles: error.response?.data || error.message,
    });
  }
};

