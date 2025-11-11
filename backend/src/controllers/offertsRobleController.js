import axios from "axios";
import { getAccessToken, getRefreshToken,getEmail,setAccessToken, setRefreshToken } from "./storeToken.js";

export const createProduct = async (req, res) => {
try{
    const { nombre, categoria, imagenes, condicionesTrueque, comentarioNLP, ubicacion} = req.body;
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    let email = getEmail();
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
         refreshToken: `${refreshToken}` 
        }
    );
    
    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    const userRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
            tableName: "usuarios",
            email: email,
            },
        }
        );
    const userData = userRes.data[0];
    const userId = userData._id;

    if (!nombre || !categoria || !comentarioNLP || !condicionesTrueque || !ubicacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (imagenes && imagenes.length > 3) {
      return res.status(400).json({ error: 'Máximo 3 imágenes permitidas' });
    }

    const producto = await axios.post('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
        {
            tableName: 'productos',
            records:[
                {
                    nombre:nombre,
                    categoria:categoria,
                    imagenes:imagenes || [],
                    condicionesTrueque:condicionesTrueque,
                    comentarioNLP:comentarioNLP,
                    ubicacion:ubicacion,
                    oferenteID: userId,
                    estado: 'borrador',
                    fechaCreacion: new Date().toISOString().slice(0, 10)
                }
            ]
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    res.status(201).json("Producto creado exitosamente");
}catch(error) {
    console.error("❌ Error al crear oferta:");
  if (error.response) {
    console.error("Respuesta del servidor:", error.response.data);
  } else if (error.request) {
    console.error("No hubo respuesta del servidor:", error.request._header);
  } else {
    console.error("Error interno:", error.message);
  }

  res.status(500).json({
    error: "Error al crear oferta",
    detalles: error.response?.data?.message || error.message,
  });
}
};

export const updateProduct = async (req, res) => {
    try{
        const { id } = req.params;
        const {nombre, categoria, condicionesTrueque, comentarioNLP, ubicacion} = req.body;

        let accessToken = getAccessToken();
        let refreshToken = getRefreshToken()
        let email = getEmail();
        const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
             refreshToken: `${refreshToken}` 
            });
    
        accessToken = ref.data.accessToken;
        refreshToken = ref.data.refreshToken;

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        const userRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                tableName: "usuarios",
                email: email
                },
            });
        const userData = userRes.data[0];
        const userId = userData._id;

        const producto = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                tableName: "productos",
                oferenteID: userId,
                nombre:nombre
                },
            });

        const productoData = producto.data[0];
        const productoID = productoData._id;

        const update = await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
            {
                tableName: 'productos',
                idColumn: '_id',
                idValue: productoID,
                updates:{condicionesTrueque:condicionesTrueque,comentarioNLP:comentarioNLP, ubicacion:ubicacion, fecha_actualizacion:new Date().toISOString().slice(0, 10)}
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        res.json("Actualizacion de producto exitosa");
    }catch(error){
        console.error("❌ Error al actualizar producto:", error.response?.data || error.message);
        res.status(500).json({
        error: "Error alactualizar producto",
        detalles: error.response?.data || error.message,
        });  
    }
};

export const changeStatus = async (req, res)=>{
    try{
        const {estado,nombre} = req.body;
        let accessToken = getAccessToken();
        let refreshToken = getRefreshToken()
        let email = getEmail();
        const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
             refreshToken: `${refreshToken}` 
            });
    
        accessToken = ref.data.accessToken;
        refreshToken = ref.data.refreshToken;

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        const userRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                tableName: "usuarios",
                email: email,
                },
            });
        const userData = userRes.data[0];
        const userId = userData._id;

        const producto = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                tableName: "productos",
                oferenteID: userId,
                nombre:nombre
                },
            });

        console.log(producto);
        const productoData = producto.data[0];
        const productoID = productoData._id;

        const update = await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
            {
                tableName: 'productos',
                idColumn: '_id',
                idValue: productoID,
                updates:{estado:estado, fecha_actualizacion:new Date().toISOString().slice(0, 10)}
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        res.json("Actualizacion de producto exitosa");
    }catch(error){
        console.error("❌ Error al cambiar estado del producto:", error.response?.data || error.message);
        res.status(500).json({
        error: "Error al cambiar estado del producto",
        detalles: error.response?.data || error.message,
        });  
    }
};

export const DeleteProduct = async (req, res)=> {
    try{
        const {nombre} = req.body;
        let accessToken = getAccessToken();
        let refreshToken = getRefreshToken();
        let email = getEmail();
        const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
             refreshToken: `${refreshToken}` 
            });
    
        accessToken = ref.data.accessToken;
        refreshToken = ref.data.refreshToken;

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        const userRes = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                tableName: "usuarios",
                email: email,
                },
            });
        const userData = userRes.data[0];
        const userId = userData._id;
        const producto = await axios.get("https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",{
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                tableName: "productos",
                oferenteID: userId,
                nombre:nombre
                },
            });

        const productoData = producto.data[0];
        const productoID = productoData._id;

    await axios.delete('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/delete',
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            data:{
                tableName:'productos',
                idColumn: '_id',
                idValue: productoID
            }
        }
    );
    res.json({ message: 'Oferta eliminada exitosamente' });
    }catch(error){
        console.error("❌ Error al eliminar producto:", error.response?.data || error.message);
        res.status(500).json({
        error: "Error al eliminar producto",
        detalles: error.response?.data || error.message,
        }); 
    }
};

