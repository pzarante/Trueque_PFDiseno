import axios from "axios";

export default async function recaptchaMiddleware(req, res, next) {
  try {
    const token = req.body.captchaToken || req.headers["x-recaptcha-token"];

    if (!token) {
      return res.status(400).json({ error: "captcha requerido" });
    }

    // Si no hay clave secreta configurada, permitir pasar en desarrollo
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      console.warn("RECAPTCHA_SECRET_KEY no configurado. Omitiendo validación en desarrollo.");
      return next();
    }

    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
    params.append("response", token);

    const { data } = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!data.success) {
      console.error("Error en validación de captcha:", data["error-codes"]);
      return res.status(400).json({ 
        error: "captcha inválido",
        details: data["error-codes"] || ["Token inválido o expirado"]
      });
    }

    next();
  } catch (e) {
    console.error("Error verificando captcha:", e);
    return res.status(500).json({ 
      error: "error verificando captcha",
      details: e.message 
    });
  }
}
