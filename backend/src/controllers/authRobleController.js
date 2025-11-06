import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try{
        const { name, email, password, ciudad } = req.body;

        /*const existingUser = await axios.get('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params:{
                    tableName: 'usuarios',
                    email
                }
            }
        );
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }*/

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/signup-direct', {
            name,
            email,
            password:password,
            ciudad,
            activo: false
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
       await axios.post('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
        {
            tableName: 'usuarios',
            records:[
                {
                    nombre:name,
                    email:email,
                    password:hashedPassword,
                    cuidad:ciudad,
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
    );
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
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!user.emailVerificado) {
            return res.status(401).json({ error: 'Debes verificar tu email primero' });
        } 

        if (!user.activo) {
            return res.status(401).json({ error: 'Tu cuenta está desactivada' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
            {
                email:user.email, 
                password:user.password
            });

        const ac_token = token.data.accessToken;
            res.json({
                ac_token,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    ciudad: user.ciudad
                }
            });

    }catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

export const verifyEmail = async (req, res) => {
    try{
    const { token } = req.params;
    const { accessToken } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
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
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.emailVerificado) {
      return res.json({ message: 'Email ya verificado' });
    }

    await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
        {
            tableName: 'usuarios',
            idColumn: '_id',
            idValue: user.id,
            data:{
                emailVerificado: true,
                activo: true,
                tokenVerificacion: null
            }
        },
        {
            headers: {
                Authorization: 'Bearer ${accessToken}'
            }
        }
    );
    }catch (error) {
        res.status(500).json({ error: 'Error al verificar el email' });
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

