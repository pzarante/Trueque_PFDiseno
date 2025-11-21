import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setAccessToken,setRefreshToken,setEmail} from './storeToken.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, ciudad } = req.body;

    // Paso 1: Registrar en ROBLE
    let authRes;
    try {
      authRes = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/signup',
        {
          name,
          email,
          password, 
        }
      );
      console.log('Respuesta de ROBLE signup:', authRes.data);
    } catch (signupError) {
      console.error('Error en signup de ROBLE:', signupError.response?.data || signupError.message);
      const errorData = signupError.response?.data || {};
      const errorMessage = errorData.message || errorData.error || 'Error al registrar en ROBLE';
      return res.status(signupError.response?.status || 400).json({
        error: 'Error al registrar usuario en ROBLE',
        detalles: errorMessage,
        robleError: errorData
      });
    }

    // Paso 2: Obtener token de admin para insertar en BD
    let loginRes;
    try {
      loginRes = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
        {
          email:"admin@swaply.com",
          password:"12345@Dm"
        }
      );
    } catch (loginError) {
      console.error('Error al obtener token de admin:', loginError.response?.data || loginError.message);
      // Si falla el login de admin, aún así el usuario está registrado en ROBLE
      return res.status(201).json({
        message: 'Usuario registrado exitosamente en ROBLE, pero hubo un problema al guardar en la base de datos.',
        warning: 'Por favor contacta al administrador.'
      });
    }

    const accessToken = loginRes.data.accessToken;
    
    // Paso 3: Insertar en la base de datos
    try {
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
    } catch (dbError) {
      console.error('Error al insertar en BD:', dbError.response?.data || dbError.message);
      // Si falla la inserción en BD, el usuario ya está en ROBLE
      return res.status(201).json({
        message: 'Usuario registrado exitosamente en ROBLE, pero hubo un problema al guardar en la base de datos.',
        warning: 'Por favor contacta al administrador.',
        dbError: dbError.response?.data || dbError.message
      });
    }

    // ROBLE envía un correo electrónico con código de verificación automáticamente
    // La respuesta puede incluir información sobre el correo enviado
    const robleMessage = authRes.data?.message || authRes.data?.msg || '';
    const emailSent = robleMessage.toLowerCase().includes('email') || 
                     robleMessage.toLowerCase().includes('correo') ||
                     robleMessage.toLowerCase().includes('verification') ||
                     robleMessage.toLowerCase().includes('verificación');

    res.status(201).json({
      message: 'Usuario registrado exitosamente en ROBLE y en la base de datos personalizada.',
      robleResponse: authRes.data,
      emailVerification: emailSent || robleMessage ? {
        required: true,
        message: robleMessage || 'Se ha enviado un correo electrónico con el código de verificación. Por favor revisa tu bandeja de entrada.',
        instructions: 'Revisa tu correo electrónico y usa el código recibido para verificar tu cuenta.'
      } : null
    });
  } catch (error) {
    console.error('Error inesperado al registrar usuario:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error inesperado al registrar usuario',
      detalles: error.response?.data?.message || error.response?.data?.error || error.message,
      fullError: error.response?.data || error.message,
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
            message: 'Credenciales correctas. Iniciando Sesion',
            token: accessToken,
            accessToken: accessToken,
            refreshToken: refre
        });
    }catch (error) {
        console.error("Error al iniciar sesion del usuario:", error.response?.data || error.message);
        const er_data = error.response?.data || {};
        const er_mes = error.message;
        
        // Detectar si el error es por email no verificado
        const errorMessage = er_data.message || er_data.error || '';
        const isUnverified = errorMessage.toLowerCase().includes('verif') || 
                            errorMessage.toLowerCase().includes('email') ||
                            errorMessage.toLowerCase().includes('correo') ||
                            errorMessage.toLowerCase().includes('activate') ||
                            errorMessage.toLowerCase().includes('activar') ||
                            error.response?.status === 403;
        
        if (isUnverified) {
            return res.status(403).json({ 
                error: 'Email no verificado',
                message: 'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el código de verificación.',
                requiresVerification: true,
                email: email,
                er_data, 
                er_mes 
            });
        }
        
        res.status(error.response?.status || 500).json({ 
            error: 'Error al iniciar sesion del usuario',
            er_data, 
            er_mes 
        });
    }
};

export const verifyEmail = async (req, res) => {
    try{
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Email y código son requeridos',
        message: 'Por favor proporciona el email y el código de verificación'
      });
    }

    console.log('Verificando código para:', email, 'Código:', code);

    // Paso 1: Verificar el código con ROBLE
    let verifyResponse;
    try {
      verifyResponse = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/verify-email',
        {
          email: email,
          code: code
        }
      );
      console.log('Respuesta de ROBLE verify-email:', verifyResponse.data);
    } catch (verifyError) {
      console.error('Error al verificar código en ROBLE:', verifyError.response?.data || verifyError.message);
      const errorData = verifyError.response?.data || {};
      const errorMessage = errorData.message || errorData.error || errorData.msg || 'Código de verificación inválido';
      
      // Si ROBLE rechaza el código, devolver el error específico
      return res.status(verifyError.response?.status || 400).json({
        error: 'Error al verificar el código',
        message: errorMessage,
        detalles: errorData,
        robleError: errorData
      });
    }

    // Paso 2: Si ROBLE acepta el código, actualizar la BD para marcar como activo
    let loginRes;
    try {
      loginRes = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
        {
          email:"admin@swaply.com",
          password:"12345@Dm"
        }
      );
    } catch (loginError) {
      console.error('Error al obtener token de admin para actualizar BD:', loginError.response?.data || loginError.message);
      // Aunque falle actualizar la BD, ROBLE ya verificó el código, así que el usuario puede hacer login
      return res.status(200).json({
        message: 'Código verificado exitosamente en ROBLE. Puedes iniciar sesión.',
        warning: 'Hubo un problema al actualizar la base de datos, pero tu cuenta está verificada en ROBLE.'
      });
    }

    const accessToken = loginRes.data.accessToken;

    // Paso 3: Actualizar el estado active en la BD
    try {
      await axios.put(
        'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/update',
        {
          tableName: 'usuarios',
          idColumn: 'email',
          idValue: email,
          updates: { active: true }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      console.log('Usuario actualizado en BD como activo');
    } catch (dbError) {
      console.error('Error al actualizar usuario en BD:', dbError.response?.data || dbError.message);
      // Aunque falle actualizar la BD, ROBLE ya verificó el código
      return res.status(200).json({
        message: 'Código verificado exitosamente en ROBLE. Puedes iniciar sesión.',
        warning: 'Hubo un problema al actualizar la base de datos, pero tu cuenta está verificada en ROBLE.',
        dbError: dbError.response?.data || dbError.message
      });
    }

    // Éxito: código verificado y BD actualizada
    res.status(200).json({
      message: 'Usuario verificado exitosamente. Puedes iniciar sesión.',
      verified: true,
      robleResponse: verifyResponse.data
    });

    }catch (error) {
        console.error("Error al verificar usuario:", error.response?.data || error.message);
        const er_data = error.response?.data || {};
        const er_mes = error.message;
        
        // Extraer el mensaje real de ROBLE
        let errorMessage = er_data.message || er_data.error || er_data.msg || '';
        
        // Si no hay mensaje específico, usar uno genérico pero no mencionar "expirado" a menos que el error lo indique
        if (!errorMessage) {
            errorMessage = 'Código de verificación inválido. Por favor verifica el código e intenta de nuevo.';
        } else {
            // Solo mencionar "expirado" si el mensaje realmente lo indica
            const isExpired = errorMessage.toLowerCase().includes('expir') || 
                            errorMessage.toLowerCase().includes('expired') ||
                            errorMessage.toLowerCase().includes('vencido');
            
            if (!isExpired && errorMessage.toLowerCase().includes('invalid')) {
                errorMessage = 'Código de verificación inválido. Por favor verifica el código e intenta de nuevo.';
            }
        }
        
        res.status(error.response?.status || 400).json({ 
            error: 'Error al verificar el código',
            message: errorMessage,
            detalles: er_data,
            er_mes,
            robleError: er_data
        });
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

export const resendVerificationCode = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Obtener token de admin para consultar la BD
    let loginRes;
    try {
      loginRes = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/login',
        {
          email:"admin@swaply.com",
          password:"12345@Dm"
        }
      );
    } catch (loginError) {
      console.error('Error al obtener token de admin:', loginError.response?.data || loginError.message);
      return res.status(500).json({ 
        error: 'Error al reenviar código',
        message: 'No se pudo conectar con el servidor. Por favor intenta más tarde.'
      });
    }

    const accessToken = loginRes.data.accessToken;

    // Buscar el usuario en la BD para obtener su información completa
    let userData;
    try {
      const userRes = await axios.get(
        'https://roble-api.openlab.uninorte.edu.co/database/trueque_pfdiseno_b28d4fbe65/read',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            tableName: 'usuarios',
            email: email,
          },
        }
      );
      
      userData = userRes.data?.data?.[0] || userRes.data?.[0];
      console.log('Usuario encontrado en BD:', userData);
    } catch (dbError) {
      console.error('Error al buscar usuario en BD:', dbError.response?.data || dbError.message);
      // Continuar aunque no encontremos el usuario en nuestra BD
    }

    // Si tenemos la contraseña del usuario, usarla. Si no, usar una contraseña válida temporal
    // ROBLE necesita una contraseña válida para procesar el signup y reenviar el código
    const passwordToUse = password || 'TempPassword123!@#';
    const nameToUse = userData?.name || 'Usuario';

    // Intentar hacer un nuevo signup completo con el email y contraseña
    // Esto debería hacer que ROBLE reenvíe el código de verificación
    try {
      console.log('Intentando reenviar código para:', email);
      const authRes = await axios.post(
        'https://roble-api.openlab.uninorte.edu.co/auth/trueque_pfdiseno_b28d4fbe65/signup',
        {
          email: email,
          name: nameToUse,
          password: passwordToUse
        }
      );

      console.log('Respuesta de ROBLE al reenviar:', authRes.data);
      res.status(200).json({
        message: 'Código de verificación reenviado exitosamente. Revisa tu correo electrónico.',
        robleResponse: authRes.data
      });
    } catch (signupError) {
      console.error('Error en signup al reenviar:', signupError.response?.data || signupError.message);
      
      // ROBLE puede rechazar si el usuario ya existe, pero aún así podría haber reenviado el código
      const errorData = signupError.response?.data || {};
      const errorMessage = errorData.message || errorData.error || '';
      
      // Incluso si hay error, ROBLE podría haber reenviado el código
      // Informar al usuario que revise su correo
      res.status(200).json({
        message: 'Se ha procesado la solicitud de reenvío de código. Por favor revisa tu correo electrónico (incluyendo la carpeta de spam).',
        robleResponse: errorData,
        note: 'Si no recibes el código en unos minutos, verifica que el email sea correcto o contacta al administrador.'
      });
    }
  } catch (error) {
    console.error('Error inesperado al reenviar código de verificación:', error.response?.data || error.message);
    const er_data = error.response?.data || {};
    const er_mes = error.message;
    
    res.status(500).json({ 
      error: 'Error al reenviar código de verificación',
      message: er_data.message || er_data.error || 'No se pudo reenviar el código. Por favor intenta de nuevo.',
      detalles: er_data,
      er_mes 
    });
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

