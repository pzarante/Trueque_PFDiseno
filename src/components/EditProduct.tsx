import { motion } from "motion/react";
import { X, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { Product } from "./ProductCard";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";

interface EditProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
}

const CATEGORIES = [
  "Electrónica",
  "Deportes",
  "Música",
  "Libros",
  "Hogar",
  "Moda",
  "Arte",
  "Juguetes",
];

const CITIES = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Santa Marta",
];

const CONDITIONS = ["Nuevo", "Como Nuevo", "Bueno", "Usado"] as const;

export function EditProduct({
  isOpen,
  onClose,
  onSave,
  product,
}: EditProductProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState<typeof CONDITIONS[number]>("Bueno");
  const [interestedInInput, setInterestedInInput] = useState("");
  const [interestedIn, setInterestedIn] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setCategory(product.category);
      setLocation(product.location.replace(", Colombia", ""));
      setCondition(product.condition);
      setInterestedIn(product.interestedIn);
      setImageUrl(product.image);
    }
  }, [product]);

  const handleAddInterest = () => {
    if (interestedInInput.trim() && interestedIn.length < 5) {
      setInterestedIn([...interestedIn, interestedInInput.trim()]);
      setInterestedInInput("");
    }
  };

  const handleRemoveInterest = (index: number) => {
    setInterestedIn(interestedIn.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setIsSubmitting(true);

    // Simular delay de guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedProduct: Product = {
      ...product,
      title,
      description,
      category,
      location: location.includes("Colombia") ? location : location + ", Colombia",
      condition,
      interestedIn: interestedIn.length > 0 ? interestedIn : ["Cualquier cosa"],
      image: imageUrl,
    };

    onSave(updatedProduct);
    setIsSubmitting(false);
  };

  if (!isOpen || !product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-product-title"
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
              <h2 id="edit-product-title" className="text-2xl text-white mb-1">
                Editar Producto
              </h2>
              <p className="text-sm text-white/80">
                Actualiza la información de tu producto
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
              aria-label="Cerrar modal de edición de producto"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del Producto *</Label>
            <Input
              id="title"
              placeholder="Ej: Bicicleta de montaña"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-input-background"
              aria-required="true"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe tu producto, su estado, características, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="bg-input-background resize-none"
              aria-required="true"
            />
          </div>

          {/* Category and Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="bg-input-background" aria-required="true">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Estado *</Label>
              <Select
                value={condition}
                onValueChange={(value) => setCondition(value as typeof CONDITIONS[number])}
                required
              >
                <SelectTrigger className="bg-input-background" aria-required="true">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
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

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de Imagen</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-input-background"
              />
              <Button type="button" variant="outline" className="shrink-0" aria-label="Subir imagen">
                <ImageIcon className="w-4 h-4 mr-2" />
                Subir
              </Button>
            </div>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border">
                <img
                  src={imageUrl}
                  alt="Preview del producto"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1704524853906-94753b3946cb?w=400";
                  }}
                />
              </div>
            )}
          </div>

          {/* Interested In */}
          <div className="space-y-2">
            <Label htmlFor="interestedIn">
              ¿Qué te interesa a cambio? (máx. 5)
            </Label>
            <div className="flex gap-2">
              <Input
                id="interestedIn"
                placeholder="Ej: Guitarra, Libros, etc."
                value={interestedInInput}
                onChange={(e) => setInterestedInInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
                className="bg-input-background"
                disabled={interestedIn.length >= 5}
              />
              <Button
                type="button"
                onClick={handleAddInterest}
                disabled={interestedIn.length >= 5 || !interestedInInput.trim()}
                variant="outline"
                aria-label="Agregar interés"
              >
                Agregar
              </Button>
            </div>
            {interestedIn.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {interestedIn.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handleRemoveInterest(index)}
                  >
                    {interest}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
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
              aria-label="Guardar cambios del producto"
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
