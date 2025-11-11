import fetch from "node-fetch";

export async function validateRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secretKey}&response=${token}`,
  });

  const data = await response.json();

  if (!data.success) {
    console.error("⚠️ Error de reCAPTCHA:", data);
    throw new Error("Error en la validación del reCAPTCHA");
  }

  console.log("✅ reCAPTCHA validado correctamente");
}
