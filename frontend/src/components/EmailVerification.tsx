import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRightLeft, Mail, CheckCircle } from "lucide-react";
import { ThemeColor } from "./ThemeColorPicker";
import { useThemeColor, getGradientClasses, getShadowClasses, getTextClasses } from "../hooks/useThemeColor";

interface EmailVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  onResendCode?: () => Promise<void>;
}

export function EmailVerification({ email, onVerify, onCancel, onResendCode }: EmailVerificationProps) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const textClasses = getTextClasses(themeColor);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      setError("Por favor ingresa el código completo");
      return;
    }

    setIsVerifying(true);
    setError("");
    try {
      await onVerify(code);
    } catch (err: any) {
      setError(err.message || "Código inválido. Por favor intenta de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!onResendCode) return;
    setIsResending(true);
    setError("");
    try {
      await onResendCode();
    } catch (err: any) {
      setError(err.message || "Error al reenviar el código");
    } finally {
      setIsResending(false);
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
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl">Verificar Correo Electrónico</h2>
            <p className="text-muted-foreground mt-2 text-center">
              Hemos enviado un código de verificación a
            </p>
            <p className={`${textClasses} font-medium mt-1`}>{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificación</Label>
              <Input
                id="code"
                type="text"
                placeholder="Ingresa el código de 6 dígitos"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                required
                className="bg-input-background text-center text-2xl tracking-widest"
                maxLength={6}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isVerifying || code.length < 4}
                className={`w-full bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isVerifying ? (
                  "Verificando..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verificar Código
                  </>
                )}
              </Button>

              {onResendCode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? "Reenviando..." : "Reenviar Código"}
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground text-center">
              <strong>¿No recibiste el código?</strong>
              <br />
              Revisa tu carpeta de spam o solicita un nuevo código.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

