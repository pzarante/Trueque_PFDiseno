import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "./ui/utils";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showValidation?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: "Al menos 8 caracteres", test: (p) => p.length >= 8 },
  { label: "Al menos una mayúscula", test: (p) => /[A-Z]/.test(p) },
  { label: "Al menos una minúscula", test: (p) => /[a-z]/.test(p) },
  { label: "Al menos un número", test: (p) => /[0-9]/.test(p) },
  { label: "Al menos un carácter especial (@$!%*?&)", test: (p) => /[@$!%*?&]/.test(p) },
];

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  className,
  showValidation = false,
  onValidationChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const shouldShowValidation = showValidation && (touched || value.length > 0);
  const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    met: req.test(value),
  }));

  const isValid = requirements.every((req) => req.met);

  // Notificar cambios de validación
  if (onValidationChange && shouldShowValidation) {
    onValidationChange(isValid);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e);
            if (!touched) setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          required={required}
          className={cn(
            "bg-input-background pr-10",
            shouldShowValidation && !isValid && value.length > 0 && "border-red-500 focus-visible:ring-red-500",
            className
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      
      {shouldShowValidation && value.length > 0 && (
        <div className="mt-2 space-y-1.5 rounded-md border border-border bg-muted/30 p-3 text-sm">
          <p className="font-medium text-foreground mb-2">Requisitos de contraseña:</p>
          {requirements.map((req, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 transition-colors",
                req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <Check className="h-4 w-4 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 flex-shrink-0" />
              )}
              <span className={cn(req.met && "line-through opacity-60")}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

