import { motion } from "motion/react";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRightLeft } from "lucide-react";
import { ThemeColor } from "./ThemeColorPicker";
import { useThemeColor, getGradientClasses, getShadowClasses, getTextClasses } from "../hooks/useThemeColor";
import { PasswordInput } from "./PasswordInput";
import ReCAPTCHA from "react-google-recaptcha";

interface RegisterProps {
  onRegister: (name: string, email: string, password: string, city: string, captchaToken?: string) => void;
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
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !captchaToken) {
      return;
    }
    // Llamar onRegister y manejar el error si ocurre
    const registerPromise = onRegister(name, email, password, city, captchaToken);
    
    // Si onRegister retorna una promesa, manejar errores
    if (registerPromise instanceof Promise) {
      registerPromise.catch((error: any) => {
        // Resetear captcha si hay un error de captcha
        const errorMessage = error?.message?.toLowerCase() || "";
        const errorData = error?.errorData || {};
        const isCaptchaError = errorMessage.includes("captcha") || 
                              errorData?.error?.toLowerCase().includes("captcha") ||
                              error?.status === 400 && errorData?.error?.includes("captcha");
        
        if (isCaptchaError && recaptchaRef.current) {
          recaptchaRef.current.reset();
          setCaptchaToken(null);
        }
      });
    }
  };

  // Definir colores de las animaciones según el tema
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0a1628] dark:via-[#0d1f38] dark:to-[#0a1628]" />
      
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-20 right-20 w-72 h-72 bg-gradient-to-br ${animGradients.primary} rounded-full blur-3xl opacity-30`}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br ${animGradients.secondary} rounded-full blur-3xl opacity-20`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Logo */}
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
              Únete a la comunidad de Swaply
            </p>
          </div>

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
                className="bg-input-background"
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
                className="bg-input-background"
              />
            </div>

            <PasswordInput
              id="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              showValidation={true}
              onValidationChange={setIsPasswordValid}
            />

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                type="text"
                placeholder="Ej: Bogotá, Medellín, Cali..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                theme="dark"
              />
            </div>

            <Button
              type="submit"
              disabled={!isPasswordValid || !captchaToken}
              className={`w-full bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Crear Cuenta
            </Button>
          </form>

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
