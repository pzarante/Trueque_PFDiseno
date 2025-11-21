import { motion } from "motion/react";
import { X, MapPin, User, ArrowLeftRight, Heart, Share2, Edit, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Product } from "./ProductCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { useThemeColor, getGradientClasses } from "../hooks/useThemeColor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onProposeTrade: (productId: string, proposedProductId?: string) => void;
  onViewProfile: (userId: string) => void;
  onContactUser: (userId: string, productId?: string) => void;
  onEditProduct?: (product: Product) => void;
  currentUserId: string;
  isFavorited: boolean;
  onToggleFavorite: (productId: string) => void;
  onUpdateProduct?: (product: Product) => void;
  userProducts?: Product[];
  onPublishProduct?: () => void;
}

export function ProductDetail({ 
  product, 
  onClose, 
  onProposeTrade,
  onViewProfile,
  onContactUser,
  onEditProduct,
  currentUserId,
  isFavorited,
  onToggleFavorite,
  onUpdateProduct,
  userProducts = [],
  onPublishProduct,
}: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  
  const isOwnProduct = product.ownerUserId === currentUserId;
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleProposeTradeClick = () => {
    setShowTradeDialog(true);
  };

  const handleConfirmTrade = () => {
    if (selectedProductId) {
      onProposeTrade(product.id, selectedProductId);
      setShowTradeDialog(false);
      setSelectedProductId("");
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const { productAPI } = await import("../services/api");
      
      // Si está publicado/publicada, cambiar a pausada. Si está pausada, cambiar a publicada
      const isCurrentlyPaused = product.status === "Pausada" || product.status === "paused" || product.status === "pausado";
      const newStatus = isCurrentlyPaused ? "Publicada" : "Pausada";
      const backendStatus = isCurrentlyPaused ? "publicado" : "pausado";
      
      await productAPI.updateStatus(product.title, backendStatus);
      
      if (onUpdateProduct) {
        const updatedProduct = { 
          ...product, 
          available: isCurrentlyPaused,
          status: newStatus
        };
        onUpdateProduct(updatedProduct);
      }
      
      const { toast } = await import("sonner");
      toast.success(
        isCurrentlyPaused ? "Producto reactivado" : "Producto pausado",
        {
          description: isCurrentlyPaused 
            ? "El producto ha sido publicado nuevamente"
            : "El producto ha sido pausado y ya no está disponible para intercambios"
        }
      );
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error("Error al actualizar estado", {
        description: error.message || "No se pudo cambiar el estado del producto",
      });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex justify-between items-center z-10">
            <h2 className="text-xl">Detalles del Producto</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
              {!isOwnProduct && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onToggleFavorite(product.id)}
                  className={isFavorited ? "text-red-500" : ""}
                >
                  <Heart className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <ImageWithFallback
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-white w-6"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer border-2 transition-all ${
                        currentImageIndex === i
                          ? `border-primary`
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                      onClick={() => setCurrentImageIndex(i)}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`${product.title} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl">{product.title}</h1>
                  <Badge className={`bg-gradient-to-r ${gradientClasses} text-white border-0 shadow-lg`}>
                    {product.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{product.location}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{product.condition}</Badge>
                  <Badge 
                    variant={product.available ? "default" : "secondary"}
                    className={product.available ? "bg-green-600" : "bg-gray-600"}
                  >
                    {product.available ? "Disponible" : "No Disponible"}
                  </Badge>
                  {product.status !== "Publicada" && (
                    <Badge variant="secondary">
                      {product.status === "Borrador" ? "Borrador" : "Pausada"}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3">Interesado en intercambiar por:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.interestedIn.map((interest, index) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Owner Info */}
              <div>
                <h3 className="mb-3">Publicado por</h3>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={`bg-gradient-to-br ${gradientClasses} text-white`}>
                      {product.ownerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{product.ownerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.location}
                    </p>
                  </div>
                  {!isOwnProduct && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewProfile(product.ownerUserId)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Ver Perfil
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {isOwnProduct ? (
                  <>
                    <Button
                      onClick={() => onEditProduct && onEditProduct(product)}
                      className={`flex-1 bg-gradient-to-r ${gradientClasses} shadow-lg min-h-[44px]`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Producto
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 min-h-[44px]"
                      onClick={handleToggleAvailability}
                    >
                      {product.status === "Pausada" || product.status === "paused" || product.status === "pausado" ? "Reactivar Producto" : "Pausar Producto"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleProposeTradeClick}
                      disabled={!product.available}
                      className={`flex-1 bg-gradient-to-r ${gradientClasses} shadow-lg min-h-[44px]`}
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      Proponer Intercambio
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 min-h-[44px]"
                      onClick={() => {
                        onContactUser(product.ownerUserId, product.id);
                        onClose();
                      }}
                    >
                      Contactar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Trade Dialog */}
      <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proponer Intercambio por: {product.title}</DialogTitle>
            <DialogDescription>
              Selecciona uno de tus productos disponibles para ofrecer a cambio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {userProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${gradientClasses} flex items-center justify-center`}>
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2">No tienes productos disponibles</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Para proponer un intercambio, necesitas tener al menos un producto publicado y disponible
                </p>
                {onPublishProduct && (
                  <Button 
                    onClick={() => {
                      setShowTradeDialog(false);
                      onPublishProduct();
                    }}
                    className={`bg-gradient-to-r ${gradientClasses}`}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Publicar Producto
                  </Button>
                )}
              </div>
            ) : (
              <RadioGroup value={selectedProductId} onValueChange={setSelectedProductId}>
                <div className="space-y-3">
                  {userProducts.map((p) => (
                    <Label 
                      key={p.id} 
                      htmlFor={`product-${p.id}`}
                      className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedProductId === p.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={p.id} id={`product-${p.id}`} className="min-w-[20px]" />
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <ImageWithFallback
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{p.category}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{p.condition}</Badge>
                          <Badge className={`text-xs bg-gradient-to-r ${gradientClasses} border-0`}>
                            {p.location}
                          </Badge>
                        </div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTradeDialog(false);
                setSelectedProductId("");
              }} 
              className="flex-1 min-h-[44px]"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmTrade} 
              disabled={!selectedProductId || userProducts.length === 0}
              className={`flex-1 bg-gradient-to-r ${gradientClasses} min-h-[44px]`}
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Enviar Propuesta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
