import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { RefreshCw, Sparkles, TrendingUp, Heart, ThumbsUp, ThumbsDown, Meh, Star } from "lucide-react";
import { Button } from "./ui/button";
import { ProductCard, Product } from "./ProductCard";
import { Badge } from "./ui/badge";
import { useThemeColor, getGradientClasses, getShadowClasses, getAccentBgClasses, getTextClasses } from "../hooks/useThemeColor";
import { Card } from "./ui/card";
import { User } from "../App";

interface RecommendationsProps {
  publishedProducts: Product[];
  onViewProduct: (product: Product) => void;
  currentUserId?: string;
  currentUser?: User | null;
  onToggleFavorite?: (productId: string) => void;
  onNavigate?: (page: string) => void;
}

type SentimentType = "positive" | "neutral" | "negative";

interface RecommendedProduct extends Product {
  recommendationReason: string;
  sentimentScore?: SentimentType;
  affinityScore: number;
}

// Función para generar recomendaciones basadas en el historial del usuario
function generateRecommendations(
  products: Product[], 
  currentUserId?: string,
  currentUser?: User | null,
  seed: number = 0
): RecommendedProduct[] {
  // Filtrar productos que no sean del usuario actual
  const availableProducts = products.filter(
    p => p.status === "published" && p.ownerUserId !== currentUserId
  );

  if (availableProducts.length === 0) return [];

  // Simular preferencias del usuario basadas en favoritos y actividad
  const userFavorites = currentUser?.favorites || [];
  const userActivities = currentUser?.activities || [];

  // Categorías de interés (basadas en favoritos)
  const favoriteCategories = new Set<string>();
  userFavorites.forEach(favId => {
    const favProduct = products.find(p => p.id === favId);
    if (favProduct) {
      favoriteCategories.add(favProduct.category);
    }
  });

  // Calcular score de afinidad para cada producto
  const scoredProducts = availableProducts.map(product => {
    let score = 50; // Base score
    const reasons: string[] = [];

    // Si la categoría es una de las favoritas del usuario
    if (favoriteCategories.has(product.category)) {
      score += 30;
      reasons.push("categoria-favorita");
    }

    // Si hay actividad reciente relacionada con esta categoría
    const hasRecentActivity = userActivities.some(
      activity => activity.type === "product" && 
      products.find(p => p.id === activity.productId)?.category === product.category
    );
    if (hasRecentActivity) {
      score += 20;
      reasons.push("actividad-reciente");
    }

    // Popularidad simulada (basada en condición y createdAt)
    if (product.condition === "Nuevo" || product.condition === "Como Nuevo") {
      score += 15;
    }

    // Diversidad (para evitar solo una categoría)
    const randomBonus = (seed * parseInt(product.id, 10)) % 20;
    score += randomBonus;

    // Determinar la razón principal
    let mainReason = "Basado en tus intereses";
    if (reasons.includes("categoria-favorita")) {
      mainReason = "Basado en tus búsquedas recientes";
    } else if (reasons.includes("actividad-reciente")) {
      mainReason = "Usuarios con intereses similares";
    } else if (favoriteCategories.size === 0) {
      mainReason = "Popular en tu área";
    }

    // Simular sentimiento (opcional)
    const sentimentOptions: SentimentType[] = ["positive", "positive", "positive", "neutral", "neutral"];
    const sentiment = sentimentOptions[parseInt(product.id, 10) % sentimentOptions.length];

    return {
      ...product,
      recommendationReason: mainReason,
      sentimentScore: sentiment,
      affinityScore: Math.min(100, score),
    };
  });

  // Ordenar por score y tomar los top
  scoredProducts.sort((a, b) => b.affinityScore - a.affinityScore);
  
  // Retornar entre 6-12 recomendaciones
  return scoredProducts.slice(0, 12);
}

export function Recommendations({ 
  publishedProducts, 
  onViewProduct, 
  currentUserId,
  currentUser,
  onToggleFavorite,
  onNavigate
}: RecommendationsProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const accentBgClasses = getAccentBgClasses(themeColor);
  const textClasses = getTextClasses(themeColor);

  // Generar recomendaciones
  const recommendations = useMemo(() => {
    return generateRecommendations(publishedProducts, currentUserId, currentUser, refreshKey);
  }, [publishedProducts, currentUserId, currentUser, refreshKey]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExploreMarketplace = () => {
    if (onNavigate) {
      onNavigate("marketplace");
    }
  };

  const getSentimentIcon = (sentiment?: SentimentType) => {
    if (!sentiment) return null;
    
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="w-3 h-3 text-green-600 dark:text-green-400" />;
      case "negative":
        return <ThumbsDown className="w-3 h-3 text-red-600 dark:text-red-400" />;
      case "neutral":
        return <Meh className="w-3 h-3 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getSentimentLabel = (sentiment?: SentimentType) => {
    if (!sentiment) return null;
    
    switch (sentiment) {
      case "positive":
        return "Muy recomendado";
      case "negative":
        return "Revisar detalles";
      case "neutral":
        return "Opción válida";
    }
  };

  // Agrupar por razón de recomendación
  const groupedRecommendations = useMemo(() => {
    const groups: { [key: string]: RecommendedProduct[] } = {};
    
    recommendations.forEach(rec => {
      if (!groups[rec.recommendationReason]) {
        groups[rec.recommendationReason] = [];
      }
      groups[rec.recommendationReason].push(rec);
    });
    
    return groups;
  }, [recommendations]);

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClasses} flex items-center justify-center shadow-lg ${shadowClasses}`}>
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl">Sugerencias para ti</h1>
                <p className="text-muted-foreground">
                  Basadas en tus intereses y búsquedas recientes
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="min-h-[44px]"
              aria-label="Refrescar recomendaciones"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refrescar
            </Button>
          </div>

          {/* Stats Card */}
          <Card className={`p-6 mb-6 ${accentBgClasses}`}>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClasses} flex items-center justify-center`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recomendaciones</p>
                  <p className="text-xl">{recommendations.length}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClasses} flex items-center justify-center`}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Afinidad promedio</p>
                  <p className="text-xl">
                    {recommendations.length > 0
                      ? Math.round(recommendations.reduce((sum, r) => sum + r.affinityScore, 0) / recommendations.length)
                      : 0}%
                  </p>
                </div>
              </div>

              {currentUser && currentUser.favorites.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClasses} flex items-center justify-center`}>
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tus favoritos</p>
                    <p className="text-xl">{currentUser.favorites.length}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recommendations by Category */}
        {recommendations.length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedRecommendations).map(([reason, products], groupIndex) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${gradientClasses}`} />
                  <h2 className="text-2xl">{reason}</h2>
                  <Badge className={`${textClasses} bg-transparent border-current`}>
                    {products.length} {products.length === 1 ? 'producto' : 'productos'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                      className="relative"
                    >
                      {/* Sentiment Badge */}
                      {product.sentimentScore && (
                        <div className="absolute top-2 left-2 z-10">
                          <Badge 
                            variant="secondary" 
                            className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 flex items-center gap-1"
                            title={getSentimentLabel(product.sentimentScore) || undefined}
                          >
                            {getSentimentIcon(product.sentimentScore)}
                            <span className="text-xs">{getSentimentLabel(product.sentimentScore)}</span>
                          </Badge>
                        </div>
                      )}
                      
                      {/* Affinity Score */}
                      {product.affinityScore >= 80 && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className={`bg-gradient-to-r ${gradientClasses} text-white border-0 shadow-lg`}>
                            <Sparkles className="w-3 h-3 mr-1" />
                            {product.affinityScore}%
                          </Badge>
                        </div>
                      )}

                      <ProductCard
                        product={product}
                        onViewDetails={onViewProduct}
                        currentUserId={currentUserId}
                        onToggleFavorite={onToggleFavorite}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${gradientClasses} flex items-center justify-center shadow-lg ${shadowClasses}`}>
              <Star className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl mb-3">Todavía no hay recomendaciones</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Comienza a explorar productos y añade algunos a favoritos para recibir recomendaciones personalizadas.
            </p>
            <Button
              onClick={handleExploreMarketplace}
              className={`bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} min-h-[44px]`}
            >
              Explorar Marketplace
            </Button>
          </motion.div>
        )}

        {/* Info Cards */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="p-6">
              <div className={`w-12 h-12 mb-4 rounded-lg ${accentBgClasses} flex items-center justify-center`}>
                <Sparkles className={`w-6 h-6 ${textClasses}`} />
              </div>
              <h3 className="mb-2">Análisis Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                Nuestro sistema analiza tus preferencias y actividad para sugerir productos relevantes
              </p>
            </Card>

            <Card className="p-6">
              <div className={`w-12 h-12 mb-4 rounded-lg ${accentBgClasses} flex items-center justify-center`}>
                <TrendingUp className={`w-6 h-6 ${textClasses}`} />
              </div>
              <h3 className="mb-2">Score de Afinidad</h3>
              <p className="text-sm text-muted-foreground">
                Cada recomendación incluye un porcentaje que indica qué tan bien se ajusta a tus intereses
              </p>
            </Card>

            <Card className="p-6">
              <div className={`w-12 h-12 mb-4 rounded-lg ${accentBgClasses} flex items-center justify-center`}>
                <RefreshCw className={`w-6 h-6 ${textClasses}`} />
              </div>
              <h3 className="mb-2">Actualización Continua</h3>
              <p className="text-sm text-muted-foreground">
                Las recomendaciones se actualizan constantemente según tu actividad y nuevos productos
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
