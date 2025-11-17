import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, getEmail } from "./storeToken.js";

export const createTradeProposal = async (req, res) => {
  try {
    const { productoID_oferente, productoID_destinatario, destinatarioID, mensaje } = req.body;

    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: `${refreshToken}`
    });

    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    const userRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        tableName: "usuarios",
        email: email,
      },
    });
    const userData = userRes.data[0];
    const oferenteID = userData._id;

    const tradeProposal = await axios.post(
      'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
      {
        tableName: 'trueques',
        records: [
          {
            id_productOferente: productoID_oferente,
            id_productDestinatario: productoID_destinatario,
            id_oferente: oferenteID,
            id_destinatario: destinatarioID,
            status: 'pendiente',
            confirmacion_oferente: false,
            confirmacion_destinatario: false,
            fecha_creacion: new Date().toISOString().slice(0, 10)
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.status(201).json({ message: 'Propuesta de trueque creada exitosamente.' });
  } catch (error) {
    console.error("❌ Error al crear propuesta de trueque:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al crear propuesta de trueque",
      detalles: error.response?.data || error.message,
    });
  }
};

export const confirmTradeByOferente = async (req, res) => {
  try {
    const { tradeID } = req.body;

    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: `${refreshToken}`
    });

    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    const tradeRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        tableName: "trueques",
        _id: tradeID,
      },
    });

    const trade = tradeRes.data[0];
    if (!trade) {
      return res.status(404).json({ error: "Trueque no encontrado." });
    }

    const updates = {
      confirmacion_oferente: true
    };

    if (trade.confirmacion_destinatario) {
      updates.estado = 'completado';
      updates.fecha_confirmacion = new Date().toISOString().slice(0, 10);
    }

    await axios.put(
      'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
      {
        tableName: 'trueques',
        idColumn: '_id',
        idValue: tradeID,
        updates: updates
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const message = updates.estado === 'completado' 
      ? 'Trueque confirmado por ambas partes. Intercambio finalizado.' 
      : 'Confirmación registrada. Esperando confirmación del destinatario.';

    res.status(200).json({ message });
  } catch (error) {
    console.error("❌ Error al confirmar trueque por oferente:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al confirmar trueque por oferente",
      detalles: error.response?.data || error.message,
    });
  }
};

export const confirmTradeByDestinatario = async (req, res) => {
  try {
    const { tradeID } = req.body;

    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: `${refreshToken}`
    });

    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    const tradeRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        tableName: "trueques",
        _id: tradeID,
      },
    });

    const trade = tradeRes.data[0];
    if (!trade) {
      return res.status(404).json({ error: "Trueque no encontrado." });
    }

    const updates = {
      confirmado_por_destinatario: true,
      fecha_actualizacion: new Date().toISOString().slice(0, 10)
    };

    if (trade.confirmado_por_oferente) {
      updates.estado = 'completado';
      updates.fecha_finalizacion = new Date().toISOString().slice(0, 10);
    }

    await axios.put(
      'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
      {
        tableName: 'trueques',
        idColumn: '_id',
        idValue: tradeID,
        updates: updates
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const message = updates.estado === 'completado' 
      ? 'Trueque confirmado por ambas partes. Intercambio finalizado.' 
      : 'Confirmación registrada. Esperando confirmación del oferente.';

    res.status(200).json({ message });
  } catch (error) {
    console.error("❌ Error al confirmar trueque por destinatario:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al confirmar trueque por destinatario",
      detalles: error.response?.data || error.message,
    });
  }
};

export const getTradeProposals = async (req, res) => {
  try {
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();

    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: `${refreshToken}`
    });

    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    const userRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        tableName: "usuarios",
        email: email,
      },
    });
    const userData = userRes.data[0];
    const userID = userData._id;

    const tradesAsOferente = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        tableName: "trueques",
        oferenteID: userID,
      },
    });

    const tradesAsDestinatario = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        tableName: "trueques",
        destinatarioID: userID,
      },
    });

    const allTrades = [...tradesAsOferente.data, ...tradesAsDestinatario.data];

    res.status(200).json({
      message: "Propuestas de trueque obtenidas con éxito.",
      data: allTrades,
    });
  } catch (error) {
    console.error("❌ Error al obtener propuestas de trueque:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener propuestas de trueque",
      detalles: error.response?.data || error.message,
    });
  }
};