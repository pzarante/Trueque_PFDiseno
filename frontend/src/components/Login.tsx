import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRightLeft, Shield, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ThemeColor } from "./ThemeColorPicker";
import { useThemeColor, getGradientClasses, getShadowClasses, getAccentBgClasses, getAccentBorderClasses, getAccentTextClasses, getTextClasses } from "../hooks/useThemeColor";

interface LoginProps {
  onLogin: (email: string, password: string, isAdmin: boolean) => void;
  onNavigate: (page: string) => void;
}

export function Login({ onLogin, onNavigate }: LoginProps) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const accentBgClasses = getAccentBgClasses(themeColor);
  const accentBorderClasses = getAccentBorderClasses(themeColor);
  const accentTextClasses = getAccentTextClasses(themeColor);
  const textClasses = getTextClasses(themeColor);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, false);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(adminEmail, adminPassword, true);
  };

  // Definir colores de las animaciones según el tema
  const getAnimationGradient = () => {
    const gradients: Record<ThemeColor, { primary: string; secondary: string }> = {
      blue: { primary: "from-blue-400 to-cyan-400", secondary: "from-blue-500 to-blue-600" },
      purple: { primary: "from-purple-400 to-pink-400", secondary: "from-purple-500 to-purple-600" },
      red: { primary: "from-red-400 to-rose-400", secondary: "from-red-500 to-red-600" },
      orange: { primary: "from-orange-400 to-amber-400", secondary: "from-orange-500 to-orange-600" },
      green: { primary: "from-green-400 to-emerald-400", secondary: "from-green-500 to-green-600" },
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
            <h2 className="text-2xl">Iniciar Sesión</h2>
            <p className="text-muted-foreground mt-2">
              Bienvenido de vuelta a Swaply
            </p>
          </div>

          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">
                <User className="w-4 h-4 mr-2" />
                Usuario
              </TabsTrigger>
              <TabsTrigger value="admin">
                <Shield className="w-4 h-4 mr-2" />
                Administrador
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserSubmit} className="space-y-6">
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

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses}`}
                >
                  Iniciar Sesión
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminSubmit} className="space-y-6">
                <div className={`p-4 rounded-lg ${accentBgClasses} border ${accentBorderClasses} mb-4`}>
                  <p className={`text-sm ${accentTextClasses}`}>
                    <strong>Credenciales de prueba:</strong>
                    <br />
                    Email: admin@swaply.com
                    <br />
                    Contraseña: admin123
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Correo de Administrador</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@swaply.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Contraseña</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses}`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Acceder como Admin
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => onNavigate("register")}
                className={`${textClasses} font-medium hover:opacity-80 transition-opacity`}
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
