import { motion } from "motion/react";
import { X, Save, Loader2, User, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
  currentUser: any;
}

export interface ProfileData {
  name: string;
  ciudad: string;
  descripcion: string;
}

const CITIES = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Santa Marta",
  "Cúcuta",
  "Ibagué",
  "Manizales",
  "Pasto",
];

export function EditProfile({
  isOpen,
  onClose,
  onSave,
  currentUser,
}: EditProfileProps) {
  const [name, setName] = useState(currentUser?.name || "");
  const [location, setLocation] = useState(currentUser?.city || currentUser?.ciudad || "Bogotá");
  const [bio, setBio] = useState(currentUser?.description || currentUser?.descripcion || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const profileData: ProfileData = {
      name,
      ciudad: location,
      descripcion: bio,
    };

    onSave(profileData);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className={`sticky top-0 bg-gradient-to-br ${gradientClasses} p-6 rounded-t-2xl z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 id="edit-profile-title" className="text-2xl text-white mb-1">
                Editar Perfil
              </h2>
              <p className="text-sm text-white/80">
                Actualiza tu información personal
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
              aria-label="Cerrar modal de edición de perfil"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarFallback className={`text-3xl bg-gradient-to-br ${gradientClasses} text-white`}>
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-primary hover:bg-primary/90"
                aria-label="Cambiar foto de perfil"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre Completo *
            </Label>
            <Input
              id="name"
              placeholder="Tu nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-input-background"
              aria-required="true"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ciudad *
            </Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger className="bg-input-background" aria-required="true">
                <SelectValue placeholder="Selecciona tu ciudad" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Descripción breve (opcional)
            </Label>
            <Textarea
              id="bio"
              placeholder="Cuéntanos un poco sobre ti y tus intereses..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="bg-input-background resize-none"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/300 caracteres
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 min-h-[44px]"
              disabled={isSubmitting}
              aria-label="Cancelar edición"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 min-h-[44px] bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses}`}
              disabled={isSubmitting}
              aria-label="Guardar cambios del perfil"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
