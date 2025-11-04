import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try{
        const { name, email, password, city } = req.body;

        const existingUser = axios.get('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read',
            {
                headers: { Authorization: 'Bearer TU_ACCESS_TOKEN'},
                paramas:{
                    tableName: 'productos',
                    email
                }
            }
        );
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        const user = await axios.post('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
        {
            tableName: 'usuarios',
            records:[
                {
                    nombre:name,
                    email,
                    password:hashedPassword,
                    ciudad:city,
                    tokenVerificacion: verificationToken,
                    activo: 'borrador'
                }
            ]
        },
        {
            headers: {
                Authorization: 'Bearer TU_ACCESS_TOKEN'
            }
        }
    );
        res.status(201).json({
        message: 'Usuario creado. Verifica tu email para activar tu cuenta',
        userId: user.id
    }
);
    }catch(error){
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};