import axios from "axios";
import { getAccessToken, getRefreshToken,setAccessToken, setRefreshToken,getEmail } from "./storeToken.js";

export const getProfile = async (req, res) => {
  try {
    let email = getEmail(); 
    let token = getAccessToken();
    let refreshToken = getRefreshToken()
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
         refreshToken: `${refreshToken}` 
        }
    );
    
    token = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(token);
    setRefreshToken(refreshToken);

    const user = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "usuarios",
          email: email,
        },
      }
    );

    res.status(200).json({
      message: "Información del usuario obtenida con éxito.",
      data: user.data,
    });
  } catch (error) {
    console.error("Error al buscar usuario:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al buscar usuario",
      detalles: error.response?.data || error.message,
    });
  }
};

export const updateProfile = async(req, res) =>{
    try{
        let email = getEmail();
        const {name, ciudad,descripcion } = req.body;
        let token = getAccessToken();
        let refreshToken = getRefreshToken()
        const ref =await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
            refreshToken: `${refreshToken}` 
            }
        );

        token = ref.data.accessToken;
        refreshToken = ref.data.refreshToken;

        setAccessToken(token);
        setRefreshToken(refreshToken);

        const userRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
            headers: { Authorization: `Bearer ${token}` },
            params: {
            tableName: "usuarios",
            email: email,
            },
        }
        );
        const userData = userRes.data[0];
        const userId = userData._id;

        const respon =await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
        {
            tableName:'usuarios',
            idColumn:'_id',
            idValue:userId,
            updates: {name:name, ciudad:ciudad, descripcion:descripcion, fecha_actualizacion:new Date().toISOString().slice(0, 10)}
        },
        {
            headers:{
            Authorization:`Bearer ${token}`
            }
        }
        );
        res.status(200).json({
        message: "Información del usuario actualizada con éxito."
        });
    }catch(error){
        console.error("Error al buscar usuario:", error.response?.data || error.message);
        res.status(500).json({
        error: "Error al buscar usuario",
        detalles: error.response?.data || error.message,
        });  
    }
};

export const deactivateAccount = async(req, res) =>{
    try{
        let email = getEmail();
        let token = getAccessToken();
        let refreshToken = getRefreshToken()
        const ref =await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
            refreshToken: `${refreshToken}` 
            }
        );

        token = ref.data.accessToken;
        refreshToken = ref.data.refreshToken;

        setAccessToken(token);
        setRefreshToken(refreshToken);

        const userRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
            headers: { Authorization: `Bearer ${token}` },
            params: {
            tableName: "usuarios",
            email: email,
            },
        }
        );
        const userData = userRes.data[0];
        const userId = userData._id;

        const respon =await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
        {
            tableName:'usuarios',
            idColumn:'_id',
            idValue:userId,
            updates: {active:false}
        },
        {
            headers:{
            Authorization:`Bearer ${token}`
            }
        }
        );
        res.status(200).json({
        message: "Cuenta desactivada exitosamente."
        });
    }catch(error){
        console.error("Error al desactivar cuenta:", error.response?.data || error.message);
        res.status(500).json({
        error: "Error al desactivar cuenta",
        detalles: error.response?.data || error.message,
        });  
    }
};

export const getProducts = async (req, res) =>{
  try{
    let email = getEmail(); 
    let token = getAccessToken();
    let refreshToken = getRefreshToken()
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
         refreshToken: `${refreshToken}` 
        }
    );
    
    token = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(token);
    setRefreshToken(refreshToken);

    const user = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "usuarios",
          email: email,
        },
      }
    );

    const userData = user.data[0];
    const userId = userData._id;

    const products = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "productos",
          oferenteID: userId,
        },
      }
    );

     const productIds = products.data.map(product => product._id);
    res.status(200).json({
      message: "Productos del usuario obtenidos con éxito.",
      data: products.data,
    });
    
  }catch(error){
    console.error("Error al buscar productos:", error.response?.data || error.message);
        res.status(500).json({
        error: "Error al buscar productos",
        detalles: error.response?.data || error.message,
        });  
  }
};

export const filters = async (req,res)=>{
  try{
    const {categoria, ubicacion, estado} = req.query;
    let token = getAccessToken();
    let refreshToken = getRefreshToken()
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
         refreshToken: `${refreshToken}` 
        }
    );
    
    token = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(token);
    setRefreshToken(refreshToken);


    const products = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "productos",
          categoria: categoria,
          ubicacion: ubicacion,
          estado: estado
        },
      }
    );

    res.status(200).json({
      message: "Productos obtenidos con éxito.",
      data: products.data,
    });
  }catch(error){
    console.error("Error al buscar productos:", error.response?.data || error.message);
    res.status(500).json({
    error: "Error al buscar productos",
    detalles: error.response?.data || error.message,
    });  
  }
}

export const getAllPublishedProducts = async (req, res) => {
  try {
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
    
    const products = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "productos",
          estado: "publicado"
        },
      }
    );
    
    const usersRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "usuarios"
        },
      }
    );
    
    const usersMap = new Map(usersRes.data.map((u) => [u._id, u]));
    
    const enrichedProducts = products.data.map((p) => ({
      ...p,
      usuario: usersMap.get(p.oferenteID)
    }));
    
    res.status(200).json({
      message: "Productos publicados obtenidos con éxito.",
      data: enrichedProducts,
    });
  } catch (error) {
    console.error("Error al obtener productos publicados:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener productos publicados",
      detalles: error.response?.data || error.message,
    });
  }
};

export const getReputation = async (req, res) => {
  try {
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
    
    const tradesRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "trueques"
        },
      }
    );
    
    const userTrades = tradesRes.data.filter(trade => 
      (trade.id_usuario1 === userId || trade.id_usuario2 === userId) && 
      trade.status === 'completado'
    );
    
    const completedTradesCount = userTrades.length;
    
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
    const averageScore = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.calificacion || r.rating || 0), 0) / ratings.length
      : 0;
    
    res.status(200).json({
      message: "Reputación obtenida con éxito.",
      data: {
        averageScore: parseFloat(averageScore.toFixed(1)),
        completedTrades: completedTradesCount,
        totalRatings: ratings.length
      }
    });
  } catch (error) {
    console.error("Error al obtener reputación:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener reputación",
      detalles: error.response?.data || error.message,
    });
  }
};

// Función para admin: activar/desactivar usuario por email
export const toggleUserStatus = async (req, res) => {
  try {
    const { userEmail, active } = req.body;
    
    if (!userEmail || typeof active !== 'boolean') {
      return res.status(400).json({
        error: "Se requiere userEmail y active (boolean)"
      });
    }
    
    let adminToken;
    try {
      const adminLogin = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
        {
          email: "admin@swaply.com",
          password: "12345@Dm"
        }
      );
      adminToken = adminLogin.data.accessToken;
    } catch (loginError) {
      console.error("Error al obtener token de admin:", loginError.response?.data || loginError.message);
      return res.status(500).json({
        error: "Error al autenticar como administrador",
        detalles: loginError.response?.data || loginError.message,
      });
    }
    
    const userRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: {
          tableName: "usuarios",
          email: userEmail,
        },
      }
    );
    
    if (!userRes.data || userRes.data.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }
    
    const userData = userRes.data[0];
    const userId = userData._id;
    
    const updateRes = await axios.put(
      'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
      {
        tableName: 'usuarios',
        idColumn: '_id',
        idValue: userId,
        updates: { active: active }
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    res.status(200).json({
      message: active ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente",
      data: {
        email: userEmail,
        active: active
      }
    });
  } catch (error) {
    console.error("Error al cambiar estado de usuario:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al cambiar estado de usuario",
      detalles: error.response?.data || error.message,
    });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        error: "Se requiere userId"
      });
    }
    
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
          _id: userId,
        },
      }
    );
    
    if (!userRes.data || userRes.data.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: `No se encontró un usuario con ID: ${userId}`
      });
    }
    
    const userData = userRes.data[0];
    
    const productsRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "productos",
          oferenteID: userId,
        },
      }
    );
    
    const tradesRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "trueques"
        },
      }
    );
    
    const completedTrades = tradesRes.data.filter(trade => 
      (trade.id_usuario1 === userId || trade.id_usuario2 === userId) && 
      trade.status === 'completado'
    );
    
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
        ratingsRes = { data: [] };
      }
    }
    
    const ratings = ratingsRes.data || [];
    const averageScore = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.calificacion || r.rating || 0), 0) / ratings.length
      : 0;
    
    const reputation = {
      averageScore: parseFloat(averageScore.toFixed(1)),
      completedTrades: completedTrades.length,
      totalRatings: ratings.length
    };
    
    res.status(200).json({
      message: "Perfil obtenido con éxito.",
      data: {
        ...userData,
        products: productsRes.data || [],
        reputation: reputation
      }
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener perfil",
      detalles: error.response?.data || error.message,
    });
  }
};

export const getConversations = async (req, res) => {
  try {
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
    
    let allMessages = [];
    const userMessageUserIds = new Set();
    try {
      const messagesRes = await axios.get(
        "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            tableName: "mensajes"
          },
        }
      );
      allMessages = messagesRes.data || [];
      allMessages.forEach(msg => {
        if (msg.id_remitente === userId) {
          userMessageUserIds.add(msg.id_destinatario);
        } else if (msg.id_destinatario === userId) {
          userMessageUserIds.add(msg.id_remitente);
        }
      });
    } catch (msgError) {
      console.log("No hay mensajes aún o tabla no existe:", msgError.response?.data?.message || msgError.message);
      allMessages = [];
    }
    
    let userTrades = [];
    try {
      const tradesRes = await axios.get(
        "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            tableName: "trueques"
          },
        }
      );
      userTrades = tradesRes.data.filter(trade => 
        trade.id_usuario1 === userId || trade.id_usuario2 === userId
      );
    } catch (tradeError) {
      console.log("No hay trueques aún:", tradeError.response?.data?.message || tradeError.message);
      userTrades = [];
    }
    
    const otherUserIds = new Set();
    userTrades.forEach(trade => {
      if (trade.id_usuario1 === userId) {
        otherUserIds.add(trade.id_usuario2);
      } else {
        otherUserIds.add(trade.id_usuario1);
      }
    });
    
    Array.from(userMessageUserIds).forEach(uid => otherUserIds.add(uid));
    
    const conversations = await Promise.all(
      Array.from(otherUserIds).map(async (otherUserId) => {
        const otherUserRes = await axios.get(
          "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              tableName: "usuarios",
              _id: otherUserId,
            },
          }
        );
        
        if (!otherUserRes.data || otherUserRes.data.length === 0) {
          return null;
        }
        
        const otherUser = otherUserRes.data[0];
        
        const tradeWithUser = userTrades.find(t => 
          (t.id_usuario1 === userId && t.id_usuario2 === otherUserId) ||
          (t.id_usuario2 === userId && t.id_usuario1 === otherUserId)
        );
        
        let allMessages = [];
        try {
          const messagesRes = await axios.get(
            "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
            {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                tableName: "mensajes"
              },
            }
          );
          allMessages = messagesRes.data || [];
        } catch (msgError) {
          console.log("No hay mensajes aún o tabla no existe:", msgError.message);
          allMessages = [];
        }
        
        const conversationMessages = allMessages.filter(msg => 
          (msg.id_remitente === userId && msg.id_destinatario === otherUserId) ||
          (msg.id_remitente === otherUserId && msg.id_destinatario === userId)
        ).sort((a, b) => {
          const dateA = new Date(a.fecha_envio || a.fechaEnvio || 0);
          const dateB = new Date(b.fecha_envio || b.fechaEnvio || 0);
          return dateB - dateA;
        });
        
        const lastMessage = conversationMessages.length > 0 
          ? conversationMessages[0].mensaje || conversationMessages[0].message 
          : "Iniciar conversación sobre el trueque";
        
        const unreadCount = conversationMessages.filter(msg => 
          msg.id_destinatario === userId && !msg.leido
        ).length;
        
        const lastMessageTime = conversationMessages.length > 0 
          ? conversationMessages[0].fecha_envio || conversationMessages[0].fechaEnvio || tradeWithUser?.fecha_creacion 
          : tradeWithUser?.fecha_creacion || new Date().toISOString();
        
        return {
          id: otherUserId,
          userId: otherUserId,
          userName: otherUser.name || "Usuario",
          userEmail: otherUser.email || "",
          userLocation: otherUser.ciudad || "",
          tradeId: tradeWithUser?._id || null,
          lastMessage: lastMessage,
          time: lastMessageTime,
          unread: unreadCount,
          online: false
        };
      })
    );
    
    const validConversations = conversations.filter(c => c !== null);
    
    res.status(200).json({
      message: "Conversaciones obtenidas con éxito.",
      data: validConversations
    });
  } catch (error) {
    console.error("Error al obtener conversaciones:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener conversaciones",
      detalles: error.response?.data || error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, tradeId } = req.body;
    let email = getEmail();
    let token = getAccessToken();
    let refreshToken = getRefreshToken();
    
    if (!receiverId || !message) {
      return res.status(400).json({
        error: "Se requiere receiverId y message"
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
    const senderId = userData._id;
    
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
        console.log("Token de usuario sin permisos, usando token de admin para insertar mensaje");
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
          console.error("Error al insertar mensaje con token de admin:", adminError.response?.data || adminError.message);
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
      console.error("Error procesando mensaje con NLP:", nlpError.message);
    }
    
    res.status(201).json({
      message: "Mensaje enviado con éxito.",
      data: {
        _id: messageId,
        id: messageId,
        ...messageData
      }
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al enviar mensaje",
      detalles: error.response?.data || error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    let email = getEmail();
    let token = getAccessToken();
    let refreshToken = getRefreshToken();
    
    if (!userId) {
      return res.status(400).json({
        error: "Se requiere userId"
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
    const currentUserId = userData._id;
    
    let allMessages = [];
    try {
      const messagesRes = await axios.get(
        "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            tableName: "mensajes"
          },
        }
      );
      allMessages = messagesRes.data || [];
    } catch (msgError) {
      console.log("No hay mensajes aún o tabla no existe:", msgError.response?.data?.message || msgError.message);
      allMessages = [];
    }
    
    const conversationMessages = allMessages.filter(msg => {
      const remitenteId = msg.id_remitente || msg.remitente_id || msg.senderId;
      const destinatarioId = msg.id_destinatario || msg.destinatario_id || msg.receiverId;
      return (remitenteId === currentUserId && destinatarioId === userId) ||
             (remitenteId === userId && destinatarioId === currentUserId);
    }).sort((a, b) => {
      const dateA = new Date(a.fecha_envio || a.fechaEnvio || a.timestamp || 0);
      const dateB = new Date(b.fecha_envio || b.fechaEnvio || b.timestamp || 0);
      return dateA - dateB;
    });
    
    const messagesResEnriched = await Promise.all(
      conversationMessages.map(async (msg) => {
        try {
          const senderRes = await axios.get(
            "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
            {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                tableName: "usuarios",
                _id: msg.id_remitente,
              },
            }
          );
          
          const sender = senderRes.data?.[0] || {};
          
          return {
            ...msg,
            senderName: sender.name || "Usuario",
            id: msg._id || msg.id || Date.now().toString(),
          };
        } catch (error) {
          console.error("Error obteniendo información del remitente:", error);
          return {
            ...msg,
            senderName: "Usuario",
            id: msg._id || msg.id || Date.now().toString(),
          };
        }
      })
    );
    
    res.status(200).json({
      message: "Mensajes obtenidos con éxito.",
      data: messagesResEnriched
    });
  } catch (error) {
    console.error("Error al obtener mensajes:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener mensajes",
      detalles: error.response?.data || error.message,
    });
  }
};