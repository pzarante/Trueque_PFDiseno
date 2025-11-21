import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, getEmail } from './storeToken.js';

export const semanticSearch = async (req, res) => {
  try {
    const { query, category, ubicacion, estado, n = 20 } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({
        error: "El parámetro 'query' es obligatorio"
      });
    }
    
    let token = getAccessToken();
    let refreshToken = getRefreshToken();
    const email = getEmail();
    
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: `${refreshToken}`
    });
    
    token = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;
    setAccessToken(token);
    setRefreshToken(refreshToken);
    
    const nlpModelUrl = process.env.NLP_MODEL_URL || 'http://localhost:5000';
    
    let nlpResults = [];
    try {
      const nlpResponse = await axios.get(`${nlpModelUrl}/nlp/search`, {
        params: {
          query: query.trim(),
          category: category && category !== "Todos" ? category.toLowerCase() : "",
          n: parseInt(n)
        }
      });
      
      nlpResults = nlpResponse.data.results || [];
    } catch (nlpError) {
      console.error("Error en búsqueda semántica NLP:", nlpError.response?.data || nlpError.message);
    }
    
    const productsRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tableName: "productos",
          estado: estado && estado !== "Todos" ? estado : "publicado"
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
    
    let allProducts = productsRes.data.map((p) => ({
      ...p,
      usuario: usersMap.get(p.oferenteID)
    }));
    
    const offerIdsFromNLP = new Set(nlpResults.map(r => r.offer_id));
    
    const productsWithScores = allProducts.map(product => {
      const nlpResult = nlpResults.find(r => r.offer_id === product._id);
      let similarityScore = 0;
      
      if (nlpResult) {
        similarityScore = Math.round(nlpResult.score * 100);
      } else {
        const queryLower = query.toLowerCase();
        const productText = `${product.nombre} ${product.comentarioNLP || product.descripcion || ""}`.toLowerCase();
        
        if (productText.includes(queryLower)) {
          similarityScore = 30;
        } else {
          const words = queryLower.split(/\s+/).filter(w => w.length > 2);
          const matches = words.filter(word => productText.includes(word)).length;
          if (matches > 0) {
            similarityScore = Math.round((matches / words.length) * 20);
          }
        }
      }
      
      return {
        ...product,
        similarityScore
      };
    });
    
    let filteredProducts = productsWithScores.filter(product => {
      if (product.estado !== "publicado") return false;
      
      if (category && category !== "Todos") {
        const productCategory = product.categoria?.toLowerCase() || "";
        const filterCategory = category.toLowerCase();
        if (!productCategory.includes(filterCategory) && !filterCategory.includes(productCategory)) {
          return false;
        }
      }
      
      if (ubicacion && ubicacion !== "Todas") {
        const productLocation = product.ubicacion?.toLowerCase() || "";
        const filterLocation = ubicacion.toLowerCase();
        if (!productLocation.includes(filterLocation) && !filterLocation.includes(productLocation)) {
          return false;
        }
      }
      
      if (estado && estado !== "Todos" && estado !== "publicado") {
        if (product.estado !== estado.toLowerCase()) {
          return false;
        }
      }
      
      return true;
    });
    
    filteredProducts.sort((a, b) => b.similarityScore - a.similarityScore);
    
    res.status(200).json({
      message: "Búsqueda semántica completada con éxito.",
      data: filteredProducts
    });
  } catch (error) {
    console.error("Error en búsqueda semántica:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error en búsqueda semántica",
      detalles: error.response?.data || error.message,
    });
  }
};

