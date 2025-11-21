import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRightLeft, Lock, CheckCircle } from "lucide-react";
import { ThemeColor } from "./ThemeColorPicker";
import { useThemeColor, getGradientClasses, getShadowClasses, getTextClasses } from "../hooks/useThemeColor";
import { PasswordInput } from "./PasswordInput";

interface ResetPasswordProps {
  token: string;
  onReset: (newPassword: string) => Promise<void>;
  onBack: () => void;
}

export function ResetPassword({ token, onReset, onBack }: ResetPasswordProps) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const textClasses = getTextClasses(themeColor);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!isPasswordValid) {
      setError("La contraseña no cumple con los requisitos");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await onReset(newPassword);
    } catch (err: any) {
      setError(err.message || "Error al restablecer la contraseña");
    } finally {
      setIsLoading(false);
    }
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
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl">Restablecer Contraseña</h2>
            <p className="text-muted-foreground mt-2 text-center">
              Ingresa tu nueva contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <PasswordInput
              id="newPassword"
              label="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              required
              showValidation={true}
              onValidationChange={setIsPasswordValid}
            />

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                required
                className="bg-input-background"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
              className={`w-full bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                "Restableciendo..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Restablecer Contraseña
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full"
            >
              Cancelar
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

