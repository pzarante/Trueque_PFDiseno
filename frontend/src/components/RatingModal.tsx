import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";
import { toast } from "sonner";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: number) => Promise<void>;
  userName: string;
  tradeId: string;
  disabled?: boolean;
}

export function RatingModal({
  isOpen,
  onClose,
  onRate,
  userName,
  tradeId,
  disabled = false,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Selecciona una calificación", {
        description: "Por favor, elige una calificación de 1 a 5 estrellas",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onRate(rating);
      setRating(0);
      setHoveredRating(0);
      onClose();
      toast.success("Calificación enviada", {
        description: "Tu calificación ha sido registrada exitosamente",
      });
    } catch (error: any) {
      toast.error("Error al enviar calificación", {
        description: error.message || "No se pudo registrar la calificación",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Calificar a {userName}
          </DialogTitle>
          <DialogDescription>
            Selecciona una calificación de 1 a 5 estrellas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-8">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoveredRating || rating);
                return (
                  <motion.button
                    key={star}
                    type="button"
                    disabled={disabled || isSubmitting}
                    onClick={() => !disabled && !isSubmitting && setRating(star)}
                    onMouseEnter={() => !disabled && !isSubmitting && setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`transition-all ${
                      disabled || isSubmitting
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:scale-110"
                    }`}
                    whileHover={!disabled && !isSubmitting ? { scale: 1.1 } : {}}
                    whileTap={!disabled && !isSubmitting ? { scale: 0.95 } : {}}
                  >
                    <Star
                      className={`w-12 h-12 transition-colors ${
                        isActive
                          ? `fill-primary text-primary ${shadowClasses}`
                          : "text-muted-foreground"
                      }`}
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || isSubmitting || rating === 0}
            className={`bg-gradient-to-r ${gradientClasses} ${shadowClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? "Enviando..." : "Enviar Calificación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

