import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, Sparkles, TrendingUp } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ProductCard, Product } from "./ProductCard";
import { Badge } from "./ui/badge";
import { useThemeColor, getGradientClasses, getShadowClasses, getAccentBgClasses, getTextClasses } from "../hooks/useThemeColor";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { userAPI, productAPI } from "../services/api";
import { toast } from "sonner";

interface SemanticSearchProps {
  publishedProducts: Product[];
  onViewProduct: (product: Product) => void;
  currentUserId?: string;
  onToggleFavorite?: (productId: string) => void;
  userFavorites?: string[];
}

const CATEGORIES = ["Todos", "Electrónica", "Deportes", "Música", "Libros", "Hogar", "Moda", "Arte", "Juguetes", "Otros"];
const LOCATIONS = ["Todas", "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Santa Marta"];
const CONDITIONS = ["Todas", "Nuevo", "Como Nuevo", "Bueno", "Usado"];

interface SearchResult extends Product {
  similarityScore: number;
  matchedKeywords: string[];
  affinityLevel: "high" | "medium" | "low";
}

// Función para calcular similitud semántica simulada
function calculateSemanticSimilarity(query: string, product: Product): SearchResult {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/).filter(word => word.length > 2);
  
  let score = 0;
  const matchedKeywords: string[] = [];
  
  // Expandir sinónimos y términos relacionados
  const synonyms: { [key: string]: string[] } = {
    "bicicleta": ["bici", "bike", "ciclismo", "montaña", "ruedas"],
    "cámara": ["fotografía", "foto", "imagen", "lente", "captura"],
    "guitarra": ["música", "instrumento", "cuerdas", "acústica", "eléctrica"],
    "laptop": ["computadora", "portátil", "pc", "ordenador", "trabajo"],
    "libro": ["lectura", "literatura", "texto", "novela", "clásico"],
    "nuevo": ["excelente", "perfecto", "óptimo", "impecable"],
    "usado": ["bueno", "funcional", "antiguo"],
    "deporte": ["ejercicio", "actividad", "fitness"],
  };
  
  // Buscar en título (peso alto)
  words.forEach(word => {
    if (product.title.toLowerCase().includes(word)) {
      score += 30;
      matchedKeywords.push(word);
    }
    
    // Buscar sinónimos en título
    Object.entries(synonyms).forEach(([key, values]) => {
      if (word === key || values.includes(word)) {
        values.forEach(syn => {
          if (product.title.toLowerCase().includes(syn)) {
            score += 20;
            if (!matchedKeywords.includes(syn)) {
              matchedKeywords.push(syn);
            }
          }
        });
      }
    });
  });
  
  // Buscar en descripción (peso medio)
  words.forEach(word => {
    if (product.description.toLowerCase().includes(word)) {
      score += 15;
      if (!matchedKeywords.includes(word)) {
        matchedKeywords.push(word);
      }
    }
  });
  
  // Buscar en categoría (peso medio)
  words.forEach(word => {
    if (product.category.toLowerCase().includes(word)) {
      score += 20;
      if (!matchedKeywords.includes(word)) {
        matchedKeywords.push(word);
      }
    }
  });
  
  // Buscar en condición (peso bajo)
  words.forEach(word => {
    if (product.condition.toLowerCase().includes(word)) {
      score += 10;
      if (!matchedKeywords.includes(word)) {
        matchedKeywords.push(word);
      }
    }
  });
  
  // Buscar en intereses (peso medio)
  product.interestedIn.forEach(interest => {
    words.forEach(word => {
      if (interest.toLowerCase().includes(word)) {
        score += 12;
        if (!matchedKeywords.includes(word)) {
          matchedKeywords.push(word);
        }
      }
    });
  });
  
  // Determinar nivel de afinidad
  let affinityLevel: "high" | "medium" | "low";
  if (score >= 50) {
    affinityLevel = "high";
  } else if (score >= 25) {
    affinityLevel = "medium";
  } else {
    affinityLevel = "low";
  }
  
  return {
    ...product,
    similarityScore: Math.min(100, score),
    matchedKeywords,
    affinityLevel,
  };
}

export function SemanticSearch({ publishedProducts, onViewProduct, currentUserId, onToggleFavorite, userFavorites = [] }: SemanticSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [selectedCondition, setSelectedCondition] = useState("Todas");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const accentBgClasses = getAccentBgClasses(themeColor);
  const textClasses = getTextClasses(themeColor);

  const transformProductFromRoble = (p: any): Product => {
    let images: string[] = [];
    try {
      if (p.imagenes) {
        const imgData = typeof p.imagenes === 'string' ? JSON.parse(p.imagenes) : p.imagenes;
        images = Array.isArray(imgData) 
          ? imgData.map((img: any) => {
              if (typeof img === 'string') {
                // Si es una string que parece una URL completa, usarla directamente
                if (img.startsWith('http://') || img.startsWith('https://')) {
                  return img;
                }
                // Si es una string que empieza con /, agregar el prefijo del servidor
                if (img.startsWith('/')) {
                  return `http://localhost:3000${img}`;
                }
                // Si es solo un filename, construir la URL usando productAPI
                return productAPI.getImage(img);
              }
              // Si es un objeto con url
              if (img.url) {
                return img.url.startsWith('/') ? `http://localhost:3000${img.url}` : (img.url.startsWith('http') ? img.url : `http://localhost:3000${img.url}`);
              }
              // Si es un objeto con filename
              if (img.filename) {
                return productAPI.getImage(img.filename);
              }
              // Si no tiene estructura conocida, retornar como string
              return typeof img === 'string' ? img : "";
            })
          : typeof p.imagenes === 'string' 
            ? (() => {
                try {
                  const parsed = JSON.parse(p.imagenes);
                  if (Array.isArray(parsed)) {
                    return parsed.map((img: any) => {
                      if (img.url) return `http://localhost:3000${img.url}`;
                      if (img.filename) return productAPI.getImage(img.filename);
                      return img;
                    });
                  }
                } catch {
                  // Si no es JSON válido, tratarlo como URL directa o filename
                  if (p.imagenes.startsWith('http://') || p.imagenes.startsWith('https://')) {
                    return [p.imagenes];
                  }
                  if (p.imagenes.startsWith('/')) {
                    return [`http://localhost:3000${p.imagenes}`];
                  }
                  return [productAPI.getImage(p.imagenes)];
                }
                return [];
              })()
            : [];
      }
    } catch (e) {
      console.error("Error parsing images:", e);
      // Fallback: intentar usar imagenes directamente si hay error
      if (p.imagenes && typeof p.imagenes === 'string') {
        images = p.imagenes.startsWith('http') || p.imagenes.startsWith('/') 
          ? [p.imagenes.startsWith('/') ? `http://localhost:3000${p.imagenes}` : p.imagenes]
          : [productAPI.getImage(p.imagenes)];
      }
    }

    const user = p.usuario;

    return {
      id: p._id,
      title: p.nombre,
      description: p.comentarioNLP || p.descripcion || "",
      category: p.categoria,
      image: images[0] || "",
      images: images,
      location: p.ubicacion || "",
      ownerName: user?.name || "Usuario",
      ownerUserId: p.oferenteID || "",
      condition: "Bueno",
      interestedIn: p.condicionesTrueque ? [p.condicionesTrueque] : [],
      status: p.estado === "publicado" || p.estado === "published" ? "Publicada" : 
              p.estado === "pausado" || p.estado === "paused" ? "Pausada" : 
              "Borrador",
      available: p.activo !== false,
      createdAt: p.fechaCreacion || new Date().toISOString(),
    };
  };

  const performSemanticSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await userAPI.semanticSearch(searchQuery, {
        categoria: selectedCategory !== "Todos" ? selectedCategory : undefined,
        ubicacion: selectedLocation !== "Todas" ? selectedLocation : undefined,
        estado: "publicado",
        n: 50
      }) as { data: any[] };

      const productsData = response.data || [];
      
      const transformedProducts = productsData.map((p: any) => {
        const product = transformProductFromRoble(p);
        const similarityScore = p.similarityScore || 0;
        
        const queryLower = searchQuery.toLowerCase();
        const words = queryLower.split(/\s+/).filter(word => word.length > 2);
        const matchedKeywords: string[] = [];
        
        words.forEach(word => {
          if (product.title.toLowerCase().includes(word)) {
            matchedKeywords.push(word);
          }
          if (product.description.toLowerCase().includes(word)) {
            matchedKeywords.push(word);
          }
          if (product.category.toLowerCase().includes(word)) {
            matchedKeywords.push(word);
          }
        });
        
        let affinityLevel: "high" | "medium" | "low" = "low";
        if (similarityScore >= 70) {
          affinityLevel = "high";
        } else if (similarityScore >= 40) {
          affinityLevel = "medium";
        }
        
        return {
          ...product,
          similarityScore: Math.min(100, similarityScore),
          matchedKeywords: [...new Set(matchedKeywords)],
          affinityLevel
        } as SearchResult;
      });

      const filtered = transformedProducts.filter((result: SearchResult) => {
        const matchesCategory = selectedCategory === "Todos" || 
          result.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(result.category?.toLowerCase() || "");
        
        const matchesLocation = selectedLocation === "Todas" || 
          (result.location && result.location.toLowerCase().includes(selectedLocation.toLowerCase())) ||
          (selectedLocation.toLowerCase().includes(result.location?.toLowerCase() || ""));
        
        const matchesCondition = selectedCondition === "Todas" || 
          result.condition?.toLowerCase().includes(selectedCondition.toLowerCase()) ||
          selectedCondition.toLowerCase().includes(result.condition?.toLowerCase() || "");
        
        return matchesCategory && matchesLocation && matchesCondition;
      });
      
      filtered.sort((a: SearchResult, b: SearchResult) => b.similarityScore - a.similarityScore);
      setSearchResults(filtered);
    } catch (error: any) {
      console.error("Error en búsqueda semántica:", error);
      toast.error("Error en búsqueda semántica", {
        description: error.message || "No se pudo realizar la búsqueda. Usando búsqueda local...",
      });
      
      const allProducts = publishedProducts.filter(p => p.status === "Publicada");
      const results = allProducts.map(product => calculateSemanticSimilarity(searchQuery, product));
      let filtered = results.filter(result => {
        const matchesCategory = selectedCategory === "Todos" || 
          result.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(result.category?.toLowerCase() || "");
        const matchesLocation = selectedLocation === "Todas" || 
          (result.location && result.location.toLowerCase().includes(selectedLocation.toLowerCase())) ||
          (selectedLocation.toLowerCase().includes(result.location?.toLowerCase() || ""));
        const matchesCondition = selectedCondition === "Todas" || 
          result.condition?.toLowerCase().includes(selectedCondition.toLowerCase()) ||
          selectedCondition.toLowerCase().includes(result.condition?.toLowerCase() || "");
        return result.similarityScore > 0 && matchesCategory && matchesLocation && matchesCondition;
      });
      filtered.sort((a: SearchResult, b: SearchResult) => b.similarityScore - a.similarityScore);
      setSearchResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Ingresa un término de búsqueda");
      return;
    }
    performSemanticSearch();
  };

  useEffect(() => {
    if (hasSearched && searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        performSemanticSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedCategory, selectedLocation, selectedCondition]);

  const clearFilters = () => {
    setSelectedCategory("Todos");
    setSelectedLocation("Todas");
    setSelectedCondition("Todas");
  };

  const hasActiveFilters = selectedCategory !== "Todos" || selectedLocation !== "Todas" || selectedCondition !== "Todas";

  const getAffinityBadge = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return (
          <Badge className={`bg-gradient-to-r ${gradientClasses} text-white border-0`}>
            <Sparkles className="w-3 h-3 mr-1" />
            Alta afinidad
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary">
            <TrendingUp className="w-3 h-3 mr-1" />
            Buena coincidencia
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClasses} flex items-center justify-center shadow-lg ${shadowClasses}`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl">Búsqueda Semántica</h1>
              <p className="text-muted-foreground">
                Describe lo que buscas en lenguaje natural
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <Card className={`p-6 mb-6 border-2 ${accentBgClasses}`}>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder="Escribe lo que buscas en lenguaje natural (ej. 'bicicleta de montaña en buen estado')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-12 pr-4 min-h-[52px] text-base bg-background"
                  aria-label="Campo de búsqueda semántica"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSearch}
                  className={`flex-1 min-h-[44px] bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses}`}
                  disabled={!searchQuery.trim()}
                  aria-label="Buscar productos"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="sm:w-auto min-h-[44px]"
                      aria-label="Abrir filtros avanzados"
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filtros
                      {hasActiveFilters && (
                        <Badge className={`ml-2 bg-gradient-to-r ${gradientClasses} text-white border-0`}>
                          {[selectedCategory !== "Todos", selectedLocation !== "Todas", selectedCondition !== "Todas"].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtros Avanzados</SheetTitle>
                      <SheetDescription>
                        Combina filtros para refinar tu búsqueda
                      </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 mt-6">
                      {/* Categoría */}
                      <div className="space-y-3">
                        <Label htmlFor="category-filter">Categoría</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger id="category-filter" className="min-h-[44px]">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ubicación */}
                      <div className="space-y-3">
                        <Label htmlFor="location-filter">Ubicación</Label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger id="location-filter" className="min-h-[44px]">
                            <SelectValue placeholder="Selecciona una ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCATIONS.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Condición */}
                      <div className="space-y-3">
                        <Label htmlFor="condition-filter">Estado del Artículo</Label>
                        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                          <SelectTrigger id="condition-filter" className="min-h-[44px]">
                            <SelectValue placeholder="Selecciona una condición" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITIONS.map((condition) => (
                              <SelectItem key={condition} value={condition}>
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Botones */}
                      <div className="flex gap-3 pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="flex-1 min-h-[44px]"
                          disabled={!hasActiveFilters}
                        >
                          Limpiar
                        </Button>
                        <Button
                          onClick={() => {
                            setIsFilterOpen(false);
                            handleSearch();
                          }}
                          className={`flex-1 min-h-[44px] bg-gradient-to-r ${gradientClasses}`}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </Card>

          {/* Active Filters */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {selectedCategory !== "Todos" && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  Categoría: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("Todos")}
                    className="ml-2 hover:text-foreground"
                    aria-label="Eliminar filtro de categoría"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedLocation !== "Todas" && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  Ubicación: {selectedLocation}
                  <button
                    onClick={() => setSelectedLocation("Todas")}
                    className="ml-2 hover:text-foreground"
                    aria-label="Eliminar filtro de ubicación"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCondition !== "Todas" && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  Condición: {selectedCondition}
                  <button
                    onClick={() => setSelectedCondition("Todas")}
                    className="ml-2 hover:text-foreground"
                    aria-label="Eliminar filtro de condición"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        {hasSearched && searchQuery.trim() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl mb-1">Resultados de búsqueda</h2>
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} {searchResults.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                  {searchResults.length > 0 && ' ordenados por relevancia'}
                </p>
              </div>
            </div>

            {loading ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center animate-pulse">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl mb-2">Buscando...</h3>
                <p className="text-muted-foreground">
                  Realizando búsqueda semántica con IA
                </p>
              </Card>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Affinity Badge */}
                    {result.affinityLevel === "high" && result.similarityScore >= 70 && (
                      <div className="absolute top-2 left-2 z-10">
                        {getAffinityBadge(result.affinityLevel)}
                      </div>
                    )}
                    
                    {/* Similarity Score Badge */}
                    {result.similarityScore >= 50 && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className={`bg-gradient-to-r ${gradientClasses} text-white border-0 shadow-lg`}>
                          <Sparkles className="w-3 h-3 mr-1" />
                          {result.similarityScore}%
                        </Badge>
                      </div>
                    )}

                    <ProductCard
                      product={result}
                      onViewDetails={onViewProduct}
                      currentUserId={currentUserId}
                      isFavorited={userFavorites?.includes(result.id) || false}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl mb-2">No se encontraron resultados</h3>
                <p className="text-muted-foreground mb-6">
                  Intenta con otros términos o ajusta los filtros
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" className="min-h-[44px]">
                    Limpiar filtros
                  </Button>
                )}
              </Card>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${gradientClasses} flex items-center justify-center shadow-lg ${shadowClasses}`}>
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl mb-3">Búsqueda Inteligente</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Nuestra búsqueda semántica entiende el significado de tus palabras, no solo coincidencias exactas. 
              Describe lo que necesitas en lenguaje natural y encontraremos las mejores opciones para ti.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="p-6">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${accentBgClasses} flex items-center justify-center`}>
                  <Sparkles className={`w-6 h-6 ${textClasses}`} />
                </div>
                <h3 className="mb-2">Búsqueda Natural</h3>
                <p className="text-sm text-muted-foreground">
                  Escribe como hablas, sin preocuparte por palabras exactas
                </p>
              </Card>
              <Card className="p-6">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${accentBgClasses} flex items-center justify-center`}>
                  <TrendingUp className={`w-6 h-6 ${textClasses}`} />
                </div>
                <h3 className="mb-2">Score de Afinidad</h3>
                <p className="text-sm text-muted-foreground">
                  Resultados ordenados por relevancia y similitud
                </p>
              </Card>
              <Card className="p-6">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${accentBgClasses} flex items-center justify-center`}>
                  <SlidersHorizontal className={`w-6 h-6 ${textClasses}`} />
                </div>
                <h3 className="mb-2">Filtros Combinados</h3>
                <p className="text-sm text-muted-foreground">
                  Refina por categoría, ubicación y estado
                </p>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
