import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try{
        const { name, email, password, ciudad } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/signup', {
            
            email:email,
            password:password,
            name:name
        });

        console.log(email)
        console.log(password)
        const token = await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
            {
                email:email, 
                password:password,
                name:name
            });

        const Tok = token.data.accessToken;

        console.log(Tok)
       /*await axios.post('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
        {
            tableName: 'Usuarios',
            records:[
                {
                    nombre:name,
                    email:email,
                    password:hashedPassword,
                    ciudad:ciudad,
                    tokenVerificacion: verificationToken,
                    activo: false
                }
            ]
        },
        {
            headers: {
                Authorization: `Bearer ${Tok}`
            }
        }
    );*/
        res.status(201).json({
        message: 'Usuario creado. Verifica tu email para activar tu cuenta'
    }
);
    }catch(error){
        console.error("❌ Error al registrar usuario:", error.response?.data || error.message);
        const er_data = error.response?.data
        const er_mes = error.message
        res.status(500).json({ error: 'Error al registrar usuario',er_data, er_mes });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
            {
                email:email, 
                password:password
            });
        const Tok = token.data.accessToken;
        console.log(Tok)
        console.log(token);
        res.status(201).json({
        message: 'Credenciales correctas. Iniciando Sesion'});
    }catch (error) {
        console.error("❌ Error al  iniciar sesion del usuario:", error.response?.data || error.message);
        const er_data = error.response?.data
        const er_mes = error.message
        res.status(500).json({ error: 'Error al  iniciar sesion del usuario',er_data, er_mes });
    }
};

export const verifyEmail = async (req, res) => {
    try{
    const { email, code } = req.body;
    await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/verify-email',
        {
            email:email,
            code:code
        }
    );
    res.status(201).json({
        message: 'Usuario Verificado. Puede iniciar sesion'
    }
);

    }catch (error) {
        console.error("❌ Error al verificar usuario:", error.response?.data || error.message);
        const er_data = error.response?.data
        const er_mes = error.message
        res.status(500).json({ error: 'Error al registrar usuario',er_data, er_mes });
    }
};

export const forgotPassword = async (req, res) => {
    /*try{
    const { email } = req.body;
    const { accessToken } = req.headers;
    const user = await axios.get('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read',
            {
                headers: { Authorization: 'Bearer ${accessToken}' },
                paramas:{
                    tableName: 'usuarios',
                    email
                }
            }
        );
    if (!user) {
      return res.json({ message: 'Si el email existe, se enviará un enlace de recuperación' });
    }

    const resetToken = axios.post('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/reset-password',
        {
            token:accessToken
        }
    );

    }catch (error) {
        res.status(500).json({ error: 'Error al procesar recuperación de contraseña' });
    }*/
   res.json('Coming soon' );
};

export const resetPassword = async (req,res) => {
res.json('Coming soon');
};

