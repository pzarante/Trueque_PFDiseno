import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
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
  onRate: (rating: number, comment: string) => Promise<void>;
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
  const [comment, setComment] = useState("");
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
      await onRate(rating, comment);
      setRating(0);
      setComment("");
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
      setComment("");
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
            Comparte tu experiencia con este usuario después del trueque completado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Calificación</Label>
            <div className="flex items-center justify-center gap-2 py-4">
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
                      className={`w-10 h-10 transition-colors ${
                        isActive
                          ? `fill-primary text-primary ${shadowClasses}`
                          : "text-muted-foreground"
                      }`}
                    />
                  </motion.button>
                );
              })}
            </div>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-muted-foreground"
              >
                {rating === 1 && "Muy insatisfecho"}
                {rating === 2 && "Insatisfecho"}
                {rating === 3 && "Neutro"}
                {rating === 4 && "Satisfecho"}
                {rating === 5 && "Muy satisfecho"}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-semibold">
              Comentario (opcional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Describe tu experiencia con este trueque..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={disabled || isSubmitting}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500 caracteres
            </p>
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

