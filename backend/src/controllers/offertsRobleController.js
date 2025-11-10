import axios from "axios";
import { getAccessToken, getRefreshToken,setAccessToken, setRefreshToken } from "./storeToken.js";

export const createProduct = async (req, res) => {
try{
    const { nombre, categoria, imagenes, condicionesTrueque, comentarioNLP, ubicacion} = req.body;
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken()
    const ref = await axios.post("https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/refresh-token",{
         refreshToken: `${refreshToken}` 
        }
    );
    
    accessToken = ref.data.accessToken;
    refreshToken = ref.data.refreshToken;

    setAccessToken(token);
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
                    imagenes:imagenes,
                    condicionesTrueque:condicionesTrueque,
                    comentarioNLP:comentarioNLP,
                    ubicacion:ubicacion,
                    oferenteId: userId,
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
    res.status(201).json(producto);
}catch(error) {
    res.status(500).json({ error: 'Error al crear la oferta' });
}
};

export const updateProduct = async (req, res) => {
    try{
        const userId = req.userId;
        const { id } = req.params;
        const data = req.body;

        const producto = await axios.get('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read',
        {
            headers: { Authorization: 'Bearer ${accessToken}'},
            params: {
                tableName: 'productos',
                idColumn: '_id',
                idValue: id
            }
        }
    );
    if (!producto || producto.oferenteId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta oferta' });
    }

    const update = await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
        {
            tableName: 'productos',
            idColumn: '_id',
            idValue: id,
            data
        },
        {
            headers: {
                Authorization: 'Bearer ${accessToken}'
            }
        }
    );
    res.json(update);
}catch(error){
    res.status(500).json({ error: 'Error al actualizar la oferta' });
}
};

export const changeStatus = async (req, res)=>{
    try{
        const userId = req.userId;
        const { id } = req.params;
        const { estado } = req.body;

        if (!['borrador', 'publicada', 'pausada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const producto = await axios.get('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read',
        {
            headers: { Authorization: 'Bearer ${accessToken}'},
            params: {
                tableName: 'productos',
                idColumn: '_id',
                idValue: id
            }
        }
    );
    if (!producto || producto.oferenteId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para cambiar el estado de esta oferta' });
    }

    const status = await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
        {
            tableName: 'productos',
            idColumn: '_id',
            idValue: id,
            updates:{estado}
        },
        {
            headers: {
                Authorization: 'Bearer ${accessToken}'
            }
        }
    );
    res.json(status);
    }catch(error){
        res.status(500).json({ error: 'Error al cambiar el estado' });
    }
};

export const DeleteProduct = async (req, res)=> {
    try{
        const userId = req.userId;
        const { id } = req.params;

        const producto = await axios.get('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read',
        {
            headers: { Authorization: 'Bearer ${accessToken}'},
            params: {
                tableName: 'productos',
                idColumn: '_id',
                idValue: id
            }
        }
    );
    if (!producto || producto.oferenteId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta oferta' });
    }

    await axios.delete('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/delete',
        {
            headers: {
                Authorization: 'Bearer ${accessToken}'
            },
            data:{
                tableName:'productos',
                idColumn: '_id',
                idValue: id
            }
        }
    );
    res.json({ message: 'Oferta eliminada exitosamente' });
    }catch(error){
        res.status(500).json({ error: 'Error al eliminar la oferta' });
    }
};

