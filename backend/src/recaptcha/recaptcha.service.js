import fetch from "node-fetch";

export async function validateRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
    { method: "POST" }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error("Error en la validación del reCAPTCHA");
  }
}

