import axios from "axios";
import { getAccessToken, getRefreshToken, getEmail, setAccessToken, setRefreshToken } from "./storeToken.js";
export const createTradeProposal = async (req, res) => {
  try {
    const { id_producto_oferente, id_producto_destinatario } = req.body;
    
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    // Refresh token
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: refreshToken 
    });
    
    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    // Obtener usuario actual (quien propone el trueque)
    const userRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "usuarios", email: email }
      }
    );
    
    const userId = userRes.data[0]._id;

    // Obtener información del producto oferente (el que vio el usuario)
    const productOferenteRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "productos", _id: id_producto_oferente }
      }
    );

    const productOferente = productOferenteRes.data[0];
    const id_usuario_oferente = productOferente.oferenteID;

    // Obtener información del producto destinatario (el que ofrece el usuario)
    const productDestinatarioRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "productos", _id: id_producto_destinatario }
      }
    );

    const productDestinatario = productDestinatarioRes.data[0];
    const id_usuario_destinatario = productDestinatario.oferenteID;

    // Verificar que el usuario no esté proponiendo trueque consigo mismo
    if (id_usuario_oferente === id_usuario_destinatario) {
      return res.status(400).json({ 
        error: "No puedes proponer un trueque contigo mismo" 
      });
    }

    // Crear propuesta de trueque con status "pendiente"
    const tradeProposal = await axios.post(
      'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
      {
        tableName: 'trueques',
        records: [{
          id_usuario1: id_usuario_oferente,        // Dueño del producto que se vio
          id_usuario2: id_usuario_destinatario,    // Dueño del producto que se ofrece
          id_porductOferente: id_producto_oferente,      // Producto que se vio
          id_productDestinatario: id_producto_destinatario,  // Producto que se ofrece
          status: 'pendiente',
          confirmacion_oferente: 'pendiente',      // Dueño del producto visto
          confirmacion_destinatario: 'pendiente',  // Dueño del producto ofrecido
          fecha_creacion: new Date().toISOString(),
          fecha_cierre: null
        }]
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    // Verificar si realmente se insertó
    if (tradeProposal.data.inserted && tradeProposal.data.inserted.length > 0) {
      res.status(201).json({
        message: "Propuesta de trueque creada exitosamente",
        data: tradeProposal.data,
        tradeId: tradeProposal.data.inserted[0]._id
      });
    } else {
      console.error('Trueque no insertado. Razón:', tradeProposal.data.skipped?.[0]?.reason);
      res.status(400).json({
        error: "No se pudo guardar el trueque en la base de datos",
        detalles: tradeProposal.data.skipped?.[0]?.reason || "Error desconocido al insertar"
      });
    }
  } catch (error) {
    console.error("Error al crear propuesta de trueque:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al crear propuesta de trueque",
      detalles: error.response?.data || error.message,
    });
  }
};

export const confirmTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { accion } = req.body;
    
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    // Refresh token
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: refreshToken 
    });
    
    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    // Obtener usuario actual
    const userRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "usuarios", email: email }
      }
    );
    
    const userId = userRes.data[0]._id;


    const tradeRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "trueques", _id: tradeId }
      }
    );

    if (tradeRes.data.length === 0) {
      return res.status(404).json({ error: "Trueque no encontrado" });
    }

    const trade = tradeRes.data[0];
    

    if (trade.id_usuario1 !== userId && trade.id_usuario2 !== userId) {
      return res.status(403).json({ error: "No autorizado para confirmar este trueque" });
    }


    const esUsuario1 = trade.id_usuario1 === userId;
    const campoConfirmacion = esUsuario1 ? 'confirmacion_oferente' : 'confirmacion_destinatario';
    const valorConfirmacion = accion === 'aceptar' ? 'aceptado' : 'rechazado';


    if (trade.status === 'rechazado' || trade.status === 'completado') {
      return res.status(400).json({ error: "Este trueque ya ha sido finalizado" });
    }

    const updates = {
      [campoConfirmacion]: valorConfirmacion
    };

    let nuevoEstado = trade.status;

    const fechaActual = new Date().toISOString();
    
    if (accion === 'rechazar') {
      nuevoEstado = 'rechazado';
      updates.status = 'rechazado';
      updates.fecha_cancelacion = fechaActual;
    } else if (accion === 'aceptar') {
      const otraConfirmacion = esUsuario1 ? trade.confirmacion_destinatario : trade.confirmacion_oferente;
      
      if (otraConfirmacion === 'aceptado') {
        nuevoEstado = 'completado';
        updates.status = 'completado';
        updates.fecha_cierre = fechaActual;
        
        // Cambiar dueño de los productos cuando el trueque se completa
        // El producto que era del usuario1 pasa al usuario2
        // El producto que era del usuario2 pasa al usuario1
        try {
          await axios.put(
            'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
            {
              tableName: 'productos',
              idColumn: '_id',
              idValue: trade.id_porductOferente,
              updates: { oferenteID: trade.id_usuario2 }
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );
          
          await axios.put(
            'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
            {
              tableName: 'productos',
              idColumn: '_id',
              idValue: trade.id_productDestinatario,
              updates: { oferenteID: trade.id_usuario1 }
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );
          
          console.log('Productos transferidos exitosamente:', {
            productoOferente: trade.id_porductOferente,
            nuevoDueño: trade.id_usuario2,
            productoDestinatario: trade.id_productDestinatario,
            nuevoDueño2: trade.id_usuario1
          });
        } catch (productError) {
          console.error('Error al transferir productos:', productError.response?.data || productError.message);
          // No fallar el trueque si hay error en la transferencia, pero loguear el error
        }
      } else {
        nuevoEstado = 'pendiente';
      }
    }

    // Actualizar el trueque
    const update = await axios.put(
      'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
      {
        tableName: 'trueques',
        idColumn: '_id',
        idValue: tradeId,
        updates: updates
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    let mensaje = '';
    if (accion === 'aceptar') {
      if (nuevoEstado === 'completado') {
        mensaje = '¡Trueque completado exitosamente! Ambas partes han aceptado.';
      } else {
        mensaje = 'Has aceptado el trueque. Esperando confirmación de la otra parte.';
      }
    } else {
      mensaje = 'Has rechazado el trueque.';
    }

    const tradeUpdated = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "trueques", _id: tradeId }
      }
    );
    
    const tradeData = tradeUpdated.data[0];
    
    res.status(200).json({ 
      message: mensaje,
      tradeId: tradeId,
      status: nuevoEstado,
      data: {
        ...tradeData,
        id_producto_oferente: tradeData.id_porductOferente || trade.id_porductOferente,
        id_producto_destinatario: tradeData.id_productDestinatario || trade.id_productDestinatario,
        id_usuario1: tradeData.id_usuario1 || trade.id_usuario1,
        id_usuario2: tradeData.id_usuario2 || trade.id_usuario2,
        fecha_cancelacion: tradeData.fecha_cancelacion || null,
        fecha_cierre: tradeData.fecha_cierre || null
      }
    });
  } catch (error) {
    console.error(" Error al confirmar trueque:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al confirmar trueque",
      detalles: error.response?.data || error.message,
    });
  }
};

export const getUserTrades = async (req, res) => {
  try {
    const { status } = req.query;
    let accessToken = getAccessToken();
    let email = getEmail();

    // Refresh token
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: getRefreshToken() 
    });
    
    accessToken = ref.data.accessToken;
    setAccessToken(accessToken);
    setRefreshToken(ref.data.refreshToken);

    // Obtener usuario actual
    const userRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "usuarios", email: email }
      }
    );
    
    const userId = userRes.data[0]._id;

    // Obtener todos los trueques del usuario
    const tradesRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "trueques" }
      }
    );

    // Filtrar manualmente (ROBLE no soporta OR en consultas)
    const userTrades = tradesRes.data.filter(trade => 
      trade.id_usuario1 === userId || trade.id_usuario2 === userId
    );

    // Aplicar filtro de status si se especifica
    const filteredTrades = status ? 
      userTrades.filter(trade => trade.status === status) : 
      userTrades;

    // Enriquecer con información de productos y usuarios
    const enrichedTrades = await Promise.all(
      filteredTrades.map(async (trade) => {
        try {
          // Obtener información del producto oferente
          const productOferenteRes = await axios.get(
            "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "productos", _id: trade.id_porductOferente }
            }
          );

          // Obtener información del producto destinatario
          const productDestinatarioRes = await axios.get(
            "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "productos", _id: trade.id_productDestinatario }
            }
          );

          // Obtener información de los usuarios
          const user1Res = await axios.get(
            "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "usuarios", _id: trade.id_usuario1 }
            }
          );

          const user2Res = await axios.get(
            "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "usuarios", _id: trade.id_usuario2 }
            }
          );

          return {
            ...trade,
            producto_oferente: productOferenteRes.data[0] || {},
            producto_destinatario: productDestinatarioRes.data[0] || {},
            usuario_oferente: user1Res.data[0] || {},
            usuario_destinatario: user2Res.data[0] || {},
            es_mi_trueque: true,
            mi_confirmacion: trade.id_usuario1 === userId ? 
              trade.confirmacion_oferente : trade.confirmacion_destinatario
          };
        } catch (error) {
          console.error("Error enriqueciendo trueque:", error);
          return trade;
        }
      })
    );

    res.status(200).json({
      message: "Trueques obtenidos exitosamente",
      data: enrichedTrades
    });
  } catch (error) {
    console.error(" Error al obtener trueques:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener trueques",
      detalles: error.response?.data || error.message,
    });
  }
};