import { motion } from "motion/react";
import { Heart, MapPin } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  images?: string[];
  location: string;
  ownerName: string;
  ownerUserId: string;
  condition: "Nuevo" | "Como Nuevo" | "Bueno" | "Usado";
  interestedIn: string[];
  status: "Borrador" | "Publicada" | "Pausada";
  available: boolean;
  createdAt: string;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (productId: string) => void;
  isOwnProduct?: boolean;
  currentUserId?: string;
}

export function ProductCard({ product, onViewDetails, isFavorited: initialFavorited = false, onToggleFavorite, isOwnProduct, currentUserId }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  
  // Determine if this is the user's own product
  const isOwn = isOwnProduct || (currentUserId && product.ownerUserId === currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group h-full flex flex-col"
      onClick={() => onViewDetails(product)}
      role="article"
      aria-label={`Producto: ${product.title}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ImageWithFallback
          src={product.image}
          alt={`Imagen de ${product.title}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!isOwn && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) {
                onToggleFavorite(product.id);
              } else {
                setIsFavorited(!isFavorited);
              }
            }}
            className={`absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
              initialFavorited || isFavorited
                ? "bg-red-500 text-white"
                : "bg-white dark:bg-gray-800 text-foreground hover:bg-white dark:hover:bg-gray-700"
            }`}
            aria-label={isFavorited ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={isFavorited}
          >
            <Heart
              className="w-5 h-5"
              fill={(initialFavorited || isFavorited) ? "currentColor" : "none"}
            />
          </motion.button>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`bg-gradient-to-r ${gradientClasses} text-white border-0 shadow-lg`}>
            {product.category}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="line-clamp-1">{product.title}</h3>
          <Badge variant="outline" className="ml-2 shrink-0">
            {product.condition}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{product.location}</span>
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <p className="text-xs text-muted-foreground mb-2">Interesado en:</p>
          <div className="flex flex-wrap gap-2">
            {product.interestedIn.slice(0, 2).map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {product.interestedIn.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{product.interestedIn.length - 2}
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className={`w-full mt-auto min-h-[44px] bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses}`}
          aria-label={`Ver detalles de ${product.title}`}
        >
          Ver Detalles
        </Button>
      </div>
    </motion.div>
  );
}
