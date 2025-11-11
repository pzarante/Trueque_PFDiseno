import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRightLeft } from "lucide-react";
import { ThemeColor } from "./ThemeColorPicker";
import {
  useThemeColor,
  getGradientClasses,
  getShadowClasses,
  getTextClasses,
} from "../hooks/useThemeColor";

interface RegisterProps {
  onRegister: (name: string, email: string, password: string, city: string, token: string) => void;
  onNavigate: (page: string) => void;
}

export function Register({ onRegister, onNavigate }: RegisterProps) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const textClasses = getTextClasses(themeColor);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");

  // Cargar reCAPTCHA
  useEffect(() => {
    const existing = document.querySelector("script[src='https://www.google.com/recaptcha/api.js']");
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = (window as any).grecaptcha?.getResponse();
    if (!token) {
      alert("Por favor, completa el reCAPTCHA antes de continuar.");
      return;
    }
    
    await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, city, token }),
    });

    onRegister(name, email, password, city, token);
  };

  const getAnimationGradient = () => {
    const gradients: Record<ThemeColor, { primary: string; secondary: string }> = {
      blue: { primary: "from-blue-400 to-cyan-400", secondary: "from-cyan-500 to-blue-600" },
      purple: { primary: "from-purple-400 to-pink-400", secondary: "from-pink-500 to-purple-600" },
      red: { primary: "from-red-400 to-rose-400", secondary: "from-rose-500 to-red-600" },
      orange: { primary: "from-orange-400 to-amber-400", secondary: "from-amber-500 to-orange-600" },
      green: { primary: "from-green-400 to-emerald-400", secondary: "from-emerald-500 to-green-600" },
    };
    return gradients[themeColor];
  };

  const animGradients = getAnimationGradient();

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0a1628] dark:via-[#0d1f38] dark:to-[#0a1628]" />

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-20 right-20 w-72 h-72 bg-gradient-to-br ${animGradients.primary} rounded-full blur-3xl opacity-30`}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br ${animGradients.secondary} rounded-full blur-3xl opacity-20`}
      />

      {/* Contenedor principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Encabezado */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`bg-gradient-to-br ${gradientClasses} p-3 rounded-xl mb-4 shadow-lg ${shadowClasses}`}
            >
              <ArrowRightLeft className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl">Crear Cuenta</h2>
            <p className="text-muted-foreground mt-2">
              Únete a la comunidad de <span className="text-primary font-medium">Swaply</span>
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                type="text"
                placeholder="Ej: Bogotá, Medellín, Cali..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            {/* Captcha  */}
            <div className="w-full flex justify-center items-center mt-6">
          <div
              className="g-recaptcha transform scale-100"
              data-sitekey="6LdudgksAAAAAC3uOubF5hL2JB7p9rHyCKNdEuG"
          ></div>
          </div>


            <Button
              type="submit"
              className={`w-full bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} mt-6`}
            >
              Crear Cuenta
            </Button>
          </form>

          {/* Enlace login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => onNavigate("login")}
                className={`${textClasses} font-medium hover:opacity-80 transition-opacity`}
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
