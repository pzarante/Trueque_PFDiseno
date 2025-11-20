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
            updates: {active:false}
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
    const {categoria, ubicacion, estado} = req.body;
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