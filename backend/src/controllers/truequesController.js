import axios from "axios";
import { getAccessToken, getRefreshToken, getEmail, setAccessToken, setRefreshToken } from "./storeToken.js";

// Proponer un trueque
export const proponerTrueque = async (req, res) => {
  try {
    console.log('🔍 DEBUG - Iniciando proponerTrueque...');
    const { id_productDestinatario, id_porductOferente } = req.body;
    console.log('📦 DEBUG - Body recibido:', { id_productDestinatario, id_porductOferente });
    
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    console.log('🔑 DEBUG - Tokens iniciales:', { 
      accessToken: accessToken ? '✅' : '❌', 
      refreshToken: refreshToken ? '✅' : '❌',
      email: email || '❌'
    });

    // 1. Refresh token
    console.log('🔄 DEBUG - Intentando refresh token...');
    const ref = await axios.post(
      `${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/refresh-token`, 
      {
        refreshToken: refreshToken
      }
    );
    console.log('✅ DEBUG - Refresh token exitoso');
    
    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    // 2. Obtener info del usuario
    console.log('👤 DEBUG - Obteniendo info usuario...');
    const userRes = await axios.get(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, 
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "usuarios", email: email }
      }
    );
    console.log('✅ DEBUG - Info usuario obtenida');
    
    const destinatario = userRes.data[0];
    const id_destinatario = destinatario._id;
    console.log('👤 DEBUG - Destinatario ID:', id_destinatario);

    // 3. Obtener info del producto solicitado
    console.log('📦 DEBUG - Obteniendo producto solicitado...');
    const productoSolicitadoRes = await axios.get(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, 
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "productos", _id: id_productDestinatario }
      }
    );
    console.log('✅ DEBUG - Producto solicitado obtenido');

    const productoSolicitado = productoSolicitadoRes.data[0];
    const id_oferente = productoSolicitado.oferenteID;
    console.log('👤 DEBUG - Oferente ID:', id_oferente);

    // 4. Crear trueque
    console.log('🤝 DEBUG - Creando trueque...');
    const truequeData = {
      id_oferente: id_oferente,
      id_destinatario: id_destinatario,
      id_porductOferente: id_porductOferente,
      id_productDestinatario: id_productDestinatario,
      status: 'pendiente',
      confirmacion_oferente: 'pendiente',
      confirmacion_destinatario: 'pendiente',
      fecha_creacion: new Date().toISOString().split('T')[0]
    };
    console.log('📝 DEBUG - Datos del trueque:', truequeData);

    const truequeRes = await axios.post(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/insert`, 
      {
        tableName: 'trueques',
        records: [truequeData]
      }, 
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    console.log('✅ DEBUG - Trueque creado exitosamente');

    res.status(201).json({
      success: true,
      message: 'Propuesta de trueque enviada exitosamente',
      trueque_id: truequeRes.data.insertedIds ? truequeRes.data.insertedIds[0] : 'unknown'
    });

  } catch (error) {
    console.error('❌ ERROR DETALLADO - Proponer Trueque:');
    console.error('   📍 Paso donde falló: Ver logs anteriores');
    console.error('   🔗 URL intentada:', error.config?.url);
    console.error('   📋 Método:', error.config?.method);
    console.error('   📦 Data enviada:', error.config?.data);
    console.error('   🚨 Status:', error.response?.status);
    console.error('   📝 Mensaje:', error.response?.data?.message || error.message);
    console.error('   🔍 Response data:', error.response?.data);
    
    // Debug de variables de entorno
    console.log('🔧 DEBUG - Variables .env:');
    console.log('   ROBLE_AUTH_URL:', process.env.ROBLE_AUTH_URL);
    console.log('   ROBLE_DB_URL:', process.env.ROBLE_DB_URL);
    console.log('   DB_NAME:', process.env.DB_NAME);
    
    res.status(500).json({
      error: "Error al proponer trueque",
      detalles: error.response?.data?.message || error.message,
    });
  }
};
// Obtener trueques del usuario
export const getTruequesUsuario = async (req, res) => {
  try {
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post(`${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/refresh-token`, {
      refreshToken: `${refreshToken}`
    });
    
    accessToken = ref.data.accessToken;
    setAccessToken(accessToken);

    // Obtener ID del usuario
    const userRes = await axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { tableName: "usuarios", email: email }
    });
    
    const usuario = userRes.data[0];
    const usuario_id = usuario._id;

    // Obtener trueques donde el usuario es oferente O destinatario
    const truequesRes = await axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { tableName: "trueques" }
    });

    const truequesFiltrados = truequesRes.data.filter(trueque => 
      trueque.id_destinatario === usuario_id || trueque.id_oferente === usuario_id
    );

    // Enriquecer con información de productos y usuarios
    const truequesEnriquecidos = await Promise.all(
      truequesFiltrados.map(async (trueque) => {
        try {
          const [productoOferente, productoDestinatario, oferente, destinatario] = await Promise.all([
            axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "productos", _id: trueque.id_porductOferente }
            }),
            axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "productos", _id: trueque.id_productDestinatario }
            }),
            axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "usuarios", _id: trueque.id_oferente }
            }),
            axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "usuarios", _id: trueque.id_destinatario }
            })
          ]);

          return {
            ...trueque,
            productoOferente: productoOferente.data[0] || {},
            productoDestinatario: productoDestinatario.data[0] || {},
            oferente: oferente.data[0] || {},
            destinatario: destinatario.data[0] || {},
            esOferente: trueque.id_oferente === usuario_id,
            esDestinatario: trueque.id_destinatario === usuario_id
          };
        } catch (error) {
          console.error('Error enriqueciendo trueque:', error.message);
          return trueque;
        }
      })
    );

    res.json({
      success: true,
      trueques: truequesEnriquecidos
    });

  } catch (error) {
    console.error("❌ Error obteniendo trueques:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener trueques",
      detalles: error.response?.data || error.message,
    });
  }
};

// Oferente confirma el trueque (primera confirmación)
export const confirmarTruequeOferente = async (req, res) => {
  try {
    const { trueque_id } = req.body;
    
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post(`${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/refresh-token`, {
      refreshToken: `${refreshToken}`
    });
    
    accessToken = ref.data.accessToken;
    setAccessToken(accessToken);

    // Verificar que el usuario es el oferente del trueque
    const truequeRes = await axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { tableName: "trueques", _id: trueque_id }
    });

    const trueque = truequeRes.data[0];
    if (!trueque) {
      return res.status(404).json({ error: "Trueque no encontrado" });
    }

    const userRes = await axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { tableName: "usuarios", email: email }
    });
    
    const usuario = userRes.data[0];
    
    if (trueque.id_oferente !== usuario._id) {
      return res.status(403).json({ error: "Solo el oferente puede confirmar esta parte del trueque" });
    }

    if (trueque.status !== 'pendiente') {
      return res.status(400).json({ error: "Este trueque ya fue procesado" });
    }

    // Oferente confirma
    await axios.put(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/update`, {
      tableName: 'trueques',
      idColumn: '_id',
      idValue: trueque_id,
      updates: {
        confirmacion_oferente: 'confirmado'
      }
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json({
      success: true,
      message: 'Confirmación registrada. Esperando confirmación del destinatario.'
    });

  } catch (error) {
    console.error("❌ Error confirmando trueque (oferente):", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al confirmar trueque",
      detalles: error.response?.data || error.message,
    });
  }
};

// Destinatario confirma el trueque (segunda confirmación - bilateral completa)
export const confirmarTruequeDestinatario = async (req, res) => {
  try {
    const { trueque_id } = req.body;
    
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post(`${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/refresh-token`, {
      refreshToken: `${refreshToken}`
    });
    
    accessToken = ref.data.accessToken;
    setAccessToken(accessToken);

    // Verificar que el usuario es el destinatario del trueque
    const truequeRes = await axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { tableName: "trueques", _id: trueque_id }
    });

    const trueque = truequeRes.data[0];
    if (!trueque) {
      return res.status(404).json({ error: "Trueque no encontrado" });
    }

    const userRes = await axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { tableName: "usuarios", email: email }
    });
    
    const usuario = userRes.data[0];
    
    if (trueque.id_destinatario !== usuario._id) {
      return res.status(403).json({ error: "Solo el destinatario puede confirmar esta parte del trueque" });
    }

    if (trueque.confirmacion_oferente !== 'confirmado') {
      return res.status(400).json({ error: "El oferente debe confirmar primero el trueque" });
    }

    // Destinatario confirma (CONFIRMACIÓN BILATERAL COMPLETA)
    await axios.put(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/update`, {
      tableName: 'trueques',
      idColumn: '_id',
      idValue: trueque_id,
      updates: {
        confirmacion_destinatario: 'confirmado',
        status: 'completado',
        fecha_confirmacion: new Date().toISOString().split('T')[0]
      }
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Marcar productos como intercambiados
    await Promise.all([
      axios.put(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/update`, {
        tableName: 'productos',
        idColumn: '_id',
        idValue: trueque.id_productDestinatario,
        updates: { estado: 'intercambiado' }
      }, { headers: { Authorization: `Bearer ${accessToken}` } }),
      
      axios.put(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/update`, {
        tableName: 'productos',
        idColumn: '_id',
        idValue: trueque.id_porductOferente,
        updates: { estado: 'intercambiado' }
      }, { headers: { Authorization: `Bearer ${accessToken}` } })
    ]);

    res.json({
      success: true,
      message: '¡Trueque completado exitosamente! Confirmación bilateral registrada.'
    });

  } catch (error) {
    console.error("❌ Error confirmando trueque (destinatario):", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al confirmar trueque",
      detalles: error.response?.data || error.message,
    });
  }
};

// Rechazar trueque (cualquiera de las partes puede rechazar)
export const rechazarTrueque = async (req, res) => {
  try {
    const { trueque_id } = req.body;
    
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post(`${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/refresh-token`, {
      refreshToken: `${refreshToken}`
    });
    
    accessToken = ref.data.accessToken;
    setAccessToken(accessToken);

    // Verificar que el usuario es parte del trueque
    const truequeRes = await axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { tableName: "trueques", _id: trueque_id }
    });

    const trueque = truequeRes.data[0];
    const userRes = await axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { tableName: "usuarios", email: email }
    });
    
    const usuario = userRes.data[0];
    
    if (trueque.id_oferente !== usuario._id && trueque.id_destinatario !== usuario._id) {
      return res.status(403).json({ error: "No eres parte de este trueque" });
    }

    // Marcar como rechazado
    await axios.put(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/update`, {
      tableName: 'trueques',
      idColumn: '_id',
      idValue: trueque_id,
      updates: {
        status: 'rechazado'
      }
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json({
      success: true,
      message: 'Trueque rechazado'
    });

  } catch (error) {
    console.error("❌ Error rechazando trueque:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al rechazar trueque",
      detalles: error.response?.data || error.message,
    });
  }
};
export const registrarCierreTrueque = async (req, res) => {
  try {
    const { trueque_id } = req.body;
    
    console.log('📝 Iniciando registro de cierre para trueque:', trueque_id);

    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post(
      `${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/refresh-token`,
      { refreshToken: refreshToken }
    );
    
    accessToken = ref.data.accessToken;
    setAccessToken(accessToken);

    // 1. Verificar que el trueque existe y está listo para cerrar
    const truequeRes = await axios.get(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "trueques", _id: trueque_id }
      }
    );

    if (!truequeRes.data || truequeRes.data.length === 0) {
      return res.status(404).json({ error: "Trueque no encontrado" });
    }

    const trueque = truequeRes.data[0];
    console.log('🔍 Estado del trueque:', {
      status: trueque.status,
      confirmacion_oferente: trueque.confirmacion_oferente,
      confirmacion_destinatario: trueque.confirmacion_destinatario
    });

    // 2. Validar que está listo para cierre (ambas partes confirmaron)
    if (trueque.confirmacion_oferente !== 'confirmado' || 
        trueque.confirmacion_destinatario !== 'confirmado') {
      return res.status(400).json({ 
        error: "El trueque no está listo para cierre",
        detalles: {
          oferente_confirmo: trueque.confirmacion_oferente,
          destinatario_confirmo: trueque.confirmacion_destinatario,
          mensaje: "Ambas partes deben confirmar antes del cierre"
        }
      });
    }

    if (trueque.status === 'completado') {
      return res.status(400).json({ 
        error: "Este trueque ya fue completado anteriormente" 
      });
    }

    // 3. Obtener información detallada para auditoría
    const [productoOferente, productoDestinatario, oferente, destinatario] = await Promise.all([
      axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "productos", _id: trueque.id_porductOferente }
      }),
      axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "productos", _id: trueque.id_productDestinatario }
      }),
      axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "usuarios", _id: trueque.id_oferente }
      }),
      axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "usuarios", _id: trueque.id_destinatario }
      })
    ]);

    // 4. Actualizar el trueque existente con información de cierre
    const updatesCierre = {
      status: 'completado',
      fecha_confirmacion: new Date().toISOString().split('T')[0],
      // Campos de auditoría que podemos agregar
      productos_intercambiados: {
        ofrecido: {
          id: trueque.id_porductOferente,
          nombre: productoOferente.data[0]?.nombre,
          categoria: productoOferente.data[0]?.categoria
        },
        solicitado: {
          id: trueque.id_productDestinatario,
          nombre: productoDestinatario.data[0]?.nombre,
          categoria: productoDestinatario.data[0]?.categoria
        }
      },
      usuarios_involucrados: {
        oferente: {
          id: trueque.id_oferente,
          nombre: oferente.data[0]?.name
        },
        destinatario: {
          id: trueque.id_destinatario,
          nombre: destinatario.data[0]?.name
        }
      }
    };

    console.log('🔄 Actualizando trueque con datos de cierre...');

    await axios.put(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/update`,
      {
        tableName: 'trueques',
        idColumn: '_id',
        idValue: trueque_id,
        updates: updatesCierre
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // 5. Marcar productos como intercambiados
    console.log('🏷️ Marcando productos como intercambiados...');
    
    await Promise.all([
      axios.put(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/update`, {
        tableName: 'productos',
        idColumn: '_id',
        idValue: trueque.id_porductOferente,
        updates: { estado: 'intercambiado' }
      }, { headers: { Authorization: `Bearer ${accessToken}` } }),
      
      axios.put(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/update`, {
        tableName: 'productos',
        idColumn: '_id',
        idValue: trueque.id_productDestinatario,
        updates: { estado: 'intercambiado' }
      }, { headers: { Authorization: `Bearer ${accessToken}` } })
    ]);

    console.log('✅ Cierre de trueque registrado exitosamente');

    res.json({
      success: true,
      message: 'Trueque cerrado y registrado exitosamente',
      trueque_id: trueque_id,
      datos: {
        fecha_cierre: new Date().toISOString().split('T')[0],
        productos: {
          ofrecido: productoOferente.data[0]?.nombre,
          solicitado: productoDestinatario.data[0]?.nombre
        },
        usuarios: {
          oferente: oferente.data[0]?.name,
          destinatario: destinatario.data[0]?.name
        },
        estado_final: 'completado'
      }
    });

  } catch (error) {
    console.error('❌ Error en registro de cierre:', error.response?.data || error.message);
    res.status(500).json({
      error: "Error al registrar cierre del trueque",
      detalles: error.response?.data?.message || error.message,
    });
  }
};

// Obtener trueques completados (para historial)
export const getTruequesCompletados = async (req, res) => {
  try {
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post(
      `${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/refresh-token`,
      { refreshToken: refreshToken }
    );
    
    accessToken = ref.data.accessToken;
    setAccessToken(accessToken);

    // Obtener ID del usuario
    const userRes = await axios.get(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "usuarios", email: email }
      }
    );
    
    const usuario = userRes.data[0];
    const usuario_id = usuario._id;

    // Obtener trueques completados del usuario
    const truequesRes = await axios.get(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "trueques" }
      }
    );

    const truequesCompletados = truequesRes.data.filter(trueque => 
      (trueque.id_oferente === usuario_id || trueque.id_destinatario === usuario_id) &&
      trueque.status === 'completado'
    );

    // Enriquecer con información
    const truequesEnriquecidos = await Promise.all(
      truequesCompletados.map(async (trueque) => {
        try {
          const [productoOferente, productoDestinatario] = await Promise.all([
            axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "productos", _id: trueque.id_porductOferente }
            }),
            axios.get(`${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "productos", _id: trueque.id_productDestinatario }
            })
          ]);

          return {
            id: trueque._id,
            fecha_confirmacion: trueque.fecha_confirmacion,
            producto_ofrecido: productoOferente.data[0] || {},
            producto_solicitado: productoDestinatario.data[0] || {},
            es_oferente: trueque.id_oferente === usuario_id,
            es_destinatario: trueque.id_destinatario === usuario_id,
            estado: trueque.status
          };
        } catch (error) {
          console.error('Error enriqueciendo trueque completado:', error.message);
          return trueque;
        }
      })
    );

    // Ordenar por fecha (más reciente primero)
    truequesEnriquecidos.sort((a, b) => 
      new Date(b.fecha_confirmacion) - new Date(a.fecha_confirmacion)
    );

    res.json({
      success: true,
      total: truequesEnriquecidos.length,
      trueques: truequesEnriquecidos
    });

  } catch (error) {
    console.error("❌ Error obteniendo trueques completados:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener trueques completados",
      detalles: error.response?.data || error.message,
    });
  }
};