import axios from "axios";
import { getAccessToken, getRefreshToken,getEmail,setAccessToken, setRefreshToken } from "./storeToken.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProduct = async (req, res) => {
try{
    const { nombre, categoria, condicionesTrueque, comentarioNLP, ubicacion } = req.body; 
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

        //Obtener IDs de los productos del usuario
    const products = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          tableName: "productos",
          oferenteID: userId,
        },
      }
    );

    let productIds = products.data.map(product => product._id);
    productIds = JSON.stringify(productIds);

    let prodcutsName = products.data.map(product => product.nombre);
    console.log(prodcutsName)
    if (!nombre || !categoria || !comentarioNLP || !condicionesTrueque || !ubicacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (prodcutsName.includes(nombre)){
        return res.status(400).json({error: 'ya existe un producto con ese nombre'})
    };
    let imagenesJSON = [];

    if (req.files && req.files.length > 0) {
    console.log('Archivos recibidos:', req.files.length);
    
    if (req.files.length > 3) {
        return res.status(400).json({ error: 'Máximo 3 imágenes permitidas' });
    }

    imagenesJSON = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        url: `/uploads/${file.filename}`
    }));
    
    imagenesJSON = JSON.stringify(imagenesJSON);
    
    } else {
    console.log('No se recibieron archivos');
    imagenesJSON = JSON.stringify([]); 
    }

    const productData = {
        nombre: nombre,
        categoria: categoria,
        imagenes: imagenesJSON, 
        condicionesTrueque: condicionesTrueque,
        comentarioNLP: comentarioNLP,
        ubicacion: ubicacion,
        oferenteID: userId,
        estado: 'borrador',
        fechaCreacion: new Date().toISOString().slice(0, 10)
    };
    
    const producto = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
        {
            tableName: 'productos',
            records: [productData]
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

     await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
        {
            tableName:'usuarios',
            idColumn:'_id',
            idValue:userId,
            updates: {productos_ofrecidos:productIds, fecha_actualizacion:new Date().toISOString().slice(0, 10)}
        },
        {
            headers:{
            Authorization:`Bearer ${accessToken}`
            }
        }
        );

    // Verificar si realmente se insertó
    if (producto.data.inserted && producto.data.inserted.length > 0) {
        res.status(201).json({
          message: "Producto creado exitosamente en la base de datos"
        });
    } else {
        console.error('Producto no insertado. Razón:', producto.data.skipped?.[0]?.reason);
        res.status(400).json({
          error: "No se pudo guardar en la base de datos",
          detalles: producto.data.skipped?.[0]?.reason
        });
    }

}catch(error) {
    console.error(" ERROR AL CREAR OFERTA:", error.response?.data || error.message);
    
    res.status(500).json({
      error: "Error al crear oferta",
      detalles: error.response?.data || error.message,
    });
}
};

export const getProductImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../uploads', filename);
    
    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error al obtener imagen:", error);
    res.status(404).json({ error: "Imagen no encontrada" });
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
        console.error("Error al actualizar producto:", error.response?.data || error.message);
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
        console.error("Error al cambiar estado del producto:", error.response?.data || error.message);
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
        console.error("Error al eliminar producto:", error.response?.data || error.message);
        res.status(500).json({
        error: "Error al eliminar producto",
        detalles: error.response?.data || error.message,
        }); 
    }
};

// En offertsRobleController.js - Agrega esta función
export const getAllProducts = async (req, res) => {
  try {
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    
    // Refresh token si es necesario
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token", {
      refreshToken: refreshToken 
    });
    
    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    // Obtener todos los productos
    const productsRes = await axios.get(
      "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { tableName: "productos" }
      }
    );

    console.log("📦 Productos obtenidos de ROBLE:", productsRes.data);

    // Enriquecer con información de los oferentes
    const productsWithOwners = await Promise.all(
      productsRes.data.map(async (product) => {
        try {
          // Obtener información del oferente
          const ownerRes = await axios.get(
            "https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { tableName: "usuarios", _id: product.oferenteID }
            }
          );

          const owner = ownerRes.data[0] || { name: "No encontrado", email: "N/A" };

          return {
            producto_id: product._id,
            nombre: product.nombre,
            categoria: product.categoria,
            estado: product.estado,
            ubicacion: product.ubicacion,
            oferente_id: product.oferenteID,
            oferente_nombre: owner.name,
            oferente_email: owner.email,
            fecha_creacion: product.fechaCreacion
          };
        } catch (error) {
          console.error(`❌ Error obteniendo oferente para producto ${product._id}:`, error.message);
          return {
            producto_id: product._id,
            nombre: product.nombre,
            categoria: product.categoria,
            estado: product.estado,
            ubicacion: product.ubicacion,
            oferente_id: product.oferenteID,
            oferente_nombre: "Error al cargar",
            oferente_email: "Error al cargar",
            fecha_creacion: product.fechaCreacion
          };
        }
      })
    );

    res.status(200).json({
      message: "Productos obtenidos exitosamente",
      total: productsWithOwners.length,
      data: productsWithOwners
    });

  } catch (error) {
    console.error("❌ Error al obtener productos:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al obtener productos",
      detalles: error.response?.data || error.message,
    });
  }
};