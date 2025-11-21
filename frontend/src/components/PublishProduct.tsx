import { motion } from "motion/react";
import { X, Upload, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useState, useRef, useEffect } from "react";
import { Product } from "./ProductCard";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";
import { toast } from "sonner";

interface PublishProductProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (product: Omit<Product, "id"> | Product, imageFiles?: File[]) => void;
  currentUser: any;
  editingProduct?: Product | null;
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
  "Otros",
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
const STATUSES = [
  { value: "Borrador", label: "Borrador" },
  { value: "Publicada", label: "Publicada" },
  { value: "Pausada", label: "Pausada" },
] as const;

export function PublishProduct({
  isOpen,
  onClose,
  onPublish,
  currentUser,
  editingProduct,
}: PublishProductProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState<typeof CONDITIONS[number]>("Bueno");
  const [status, setStatus] = useState<"Borrador" | "Publicada" | "Pausada">("Publicada");
  const [available, setAvailable] = useState(true);
  const [interestedInInput, setInterestedInInput] = useState("");
  const [interestedIn, setInterestedIn] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  
  // Cargar datos cuando editingProduct cambia
  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setDescription(editingProduct.description);
      setCategory(editingProduct.category);
      setLocation(editingProduct.location.replace(", Colombia", ""));
      setCondition(editingProduct.condition);
      setStatus(editingProduct.status);
      setAvailable(editingProduct.available ?? true);
      setInterestedIn(editingProduct.interestedIn);
      setImages(editingProduct.images || [editingProduct.image]);
      setImageFiles([]);
    } else {
      // Resetear cuando no hay producto en edición
      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setCondition("Bueno");
      setStatus("Publicada");
      setAvailable(true);
      setInterestedIn([]);
      setImages([]);
      setImageFiles([]);
    }
  }, [editingProduct, isOpen]);

  const handleAddInterest = () => {
    if (interestedInInput.trim() && interestedIn.length < 5) {
      setInterestedIn([...interestedIn, interestedInInput.trim()]);
      setInterestedInInput("");
    }
  };

  const handleRemoveInterest = (index: number) => {
    setInterestedIn(interestedIn.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 3 - images.length;
    if (remainingSlots === 0) {
      toast.error("Máximo de imágenes alcanzado", {
        description: "Solo puedes subir hasta 3 imágenes por producto",
      });
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
        setImageFiles((prev) => [...prev, file]);
      }
    });

    if (files.length > remainingSlots) {
      toast.warning("Algunas imágenes no se subieron", {
        description: `Solo puedes subir ${remainingSlots} imagen(es) más`,
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Descripción requerida", {
        description: "La descripción del producto es obligatoria",
      });
      return;
    }
    
    if (images.length === 0) {
      toast.error("Imagen requerida", {
        description: "Debes subir al menos una imagen del producto",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        // Si estamos editando, mantener el ID
        const updatedProduct: Product = {
          ...editingProduct,
          title,
          description,
          category,
          image: images[0],
          images: images,
          location: location + ", Colombia",
          condition,
          interestedIn: interestedIn.length > 0 ? interestedIn : ["Cualquier cosa"],
          status,
          available,
        };
        onPublish(updatedProduct, imageFiles);
      } else {
        // Si es nuevo, no incluir ID
        const newProduct: Omit<Product, "id"> = {
          title,
          description,
          category,
          image: images[0],
          images: images,
          location: location + ", Colombia",
          ownerName: currentUser?.name || "Usuario",
          ownerUserId: currentUser?.id || "",
          condition,
          interestedIn: interestedIn.length > 0 ? interestedIn : ["Cualquier cosa"],
          status,
          available,
          createdAt: new Date().toISOString(),
        };
        onPublish(newProduct, imageFiles);
      }
    } catch (error) {
      toast.error("Error al guardar producto", {
        description: "No se pudo guardar el producto. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      aria-labelledby="publish-product-title"
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
              <h2 id="publish-product-title" className="text-2xl text-white mb-1">
                {editingProduct ? "Editar Producto" : "Publicar Producto"}
              </h2>
              <p className="text-sm text-white/80">
                Completa la información de tu producto
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 min-w-[44px] min-h-[44px]"
              aria-label="Cerrar modal de publicación"
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
              className="bg-input-background min-h-[44px]"
              aria-required="true"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción * (obligatorio)</Label>
            <Textarea
              id="description"
              placeholder="Describe tu producto, su estado, características, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="bg-input-background resize-none"
            />
          </div>

          {/* Category and Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="bg-input-background">
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
                <SelectTrigger className="bg-input-background">
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

          {/* Status and Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado de Publicación *</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as "Borrador" | "Publicada" | "Pausada")}
                required
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available">Disponibilidad *</Label>
              <Select
                value={available ? "available" : "unavailable"}
                onValueChange={(value) => setAvailable(value === "available")}
                required
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="unavailable">No Disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger className="bg-input-background">
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

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Imágenes del Producto * (máximo 3)</Label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 3}
                className="w-full min-h-[44px]"
              >
                <Upload className="w-4 h-4 mr-2" />
                {images.length === 0 ? "Subir Imágenes" : `Subir Más Imágenes (${images.length}/3)`}
              </Button>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                      <img
                        src={img}
                        alt={`Producto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-primary">
                          Principal
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              aria-label="Cancelar publicación"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 min-h-[44px] bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses}`}
              disabled={isSubmitting}
              aria-label={editingProduct ? "Guardar cambios" : "Publicar producto"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  {editingProduct ? "Guardando..." : "Publicando..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                  {editingProduct ? "Guardar Cambios" : "Publicar Producto"}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
