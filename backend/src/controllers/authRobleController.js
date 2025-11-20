import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setAccessToken,setRefreshToken,setEmail} from './storeToken.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, ciudad } = req.body;

    const authRes = await axios.post(
      'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/signup',
      {
        name,
        email,
        password, 
      }
    );

   const loginRes = await axios.post(
      'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
      {
        email:"admin@swaply.com",
        password:"12345@Dm"
      }
    );

    const accessToken = loginRes.data.accessToken;
    
    await axios.post(
      'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/insert',
      {
        tableName: 'usuarios',
        records: [
          {
            name: name,
            email: email,
            ciudad: ciudad,
            fecha_creacion: new Date().toISOString().slice(0, 10),
            active: false
          },
        ],
      },
      {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente en ROBLE y en la base de datos personalizada.',
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error al registrar usuario',
      detalles: error.response?.data || error.message,
    });
  }
};

export const login = async (req, res) => {
    try {
        const {email,password } = req.body;
        const log = await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
            {
                email:email, 
                password:password
            });
        let accessToken = log.data.accessToken;
        let refre = log.data.refreshToken;
        setRefreshToken(refre);
        setAccessToken(accessToken);
        setEmail(email);
        res.status(201).json({
        message: 'Credenciales correctas. Iniciando Sesion'});
    }catch (error) {
        console.error("Error al  iniciar sesion del usuario:", error.response?.data || error.message);
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

    const loginRes = await axios.post(
      'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
      {
        email:"admin@swaply.com",
        password:"12345@Dm"
      }
    );

    const accessToken = loginRes.data.accessToken;

    await axios.put('https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
      {
        tableName:'usuarios',
        idColumn:'email',
        idValue:email,
        updates: {active:true}
      },
      {
        headers:{
          Authorization:`Bearer ${accessToken}`
        }
      }
    );
    res.status(201).json({
        message: 'Usuario Verificado. Puede iniciar sesion'
    });

    }catch (error) {
        console.error("Error al verificar usuario:", error.response?.data || error.message);
        const er_data = error.response?.data
        const er_mes = error.message
        res.status(500).json({ error: 'Error al registrar usuario',er_data, er_mes });
    }
};

export const forgotPassword = async (req, res) => {
    try{
    const { email } = req.body;

    const forgot = await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/forgot-password',
        {
            email:email
        }
    );
   res.json('Se ha enviado información a tu correo' );
   console.log(forgot.resetToken);
    }catch (error) {
        console.error("Error al procesar recuperación de contraseña", error.response?.data || error.message);
        const er_data = error.response?.data
        const er_mes = error.message
        res.status(500).json({ error: 'Error al procesar recuperación de contraseña',er_data, er_mes  });
    }


};

export const resetPassword = async (req,res) => {
try{

    const rest = login.token.refreshToken;
    const {newPassword} = req.body;
    console.log(rest)
    await axios.post('https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/reset-password', {
        token: rest,
        newPassword: newPassword
      });
}catch(error){
    console.error("Error al restaurar la contraseña", error.response?.data || error.message);
    const er_data = error.response?.data
    const er_mes = error.message
    res.status(500).json({ error: 'Error al restaurar la contraseña',er_data, er_mes  });
}
};

