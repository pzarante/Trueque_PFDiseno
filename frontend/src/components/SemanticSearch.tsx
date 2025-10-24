import { motion } from "motion/react";
import { useState, useMemo } from "react";
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

interface SemanticSearchProps {
  publishedProducts: Product[];
  onViewProduct: (product: Product) => void;
  currentUserId?: string;
  onToggleFavorite?: (productId: string) => void;
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

export function SemanticSearch({ publishedProducts, onViewProduct, currentUserId, onToggleFavorite }: SemanticSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [selectedCondition, setSelectedCondition] = useState("Todas");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const accentBgClasses = getAccentBgClasses(themeColor);
  const textClasses = getTextClasses(themeColor);

  // Calcular resultados de búsqueda semántica
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    // Obtener todos los productos publicados
    const allProducts = publishedProducts.filter(p => p.status === "published");
    
    // Calcular similitud para cada producto
    const results = allProducts.map(product => 
      calculateSemanticSimilarity(searchQuery, product)
    );
    
    // Filtrar por similitud mínima y otros filtros
    let filtered = results.filter(result => {
      const hasMinSimilarity = result.similarityScore > 0;
      const matchesCategory = selectedCategory === "Todos" || result.category === selectedCategory;
      const matchesLocation = selectedLocation === "Todas" || result.location.includes(selectedLocation);
      const matchesCondition = selectedCondition === "Todas" || result.condition === selectedCondition;
      
      return hasMinSimilarity && matchesCategory && matchesLocation && matchesCondition;
    });
    
    // Ordenar por score de similitud
    filtered.sort((a, b) => b.similarityScore - a.similarityScore);
    
    return filtered;
  }, [searchQuery, publishedProducts, selectedCategory, selectedLocation, selectedCondition]);

  const handleSearch = () => {
    setHasSearched(true);
  };

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

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords.length) return text;
    
    let result = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      result = result.replace(regex, `<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">$1</mark>`);
    });
    
    return result;
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

            {searchResults.length > 0 ? (
              <div className="space-y-6">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        {/* Imagen */}
                        <div className="w-full md:w-48 h-48 flex-shrink-0">
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h3 
                                className="text-xl mb-2"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightKeywords(result.title, result.matchedKeywords) 
                                }}
                              />
                              <div className="flex flex-wrap gap-2 mb-3">
                                {getAffinityBadge(result.affinityLevel)}
                                <Badge variant="outline">{result.category}</Badge>
                                <Badge variant="outline">{result.condition}</Badge>
                                <Badge className={`${textClasses}`}>
                                  {result.similarityScore}% relevancia
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <p 
                            className="text-muted-foreground mb-4 line-clamp-2"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightKeywords(result.description, result.matchedKeywords) 
                            }}
                          />

                          {result.matchedKeywords.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-muted-foreground mb-2">Coincidencias encontradas:</p>
                              <div className="flex flex-wrap gap-2">
                                {result.matchedKeywords.slice(0, 5).map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {result.matchedKeywords.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{result.matchedKeywords.length - 5} más
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <Button
                              onClick={() => onViewProduct(result)}
                              className={`bg-gradient-to-r ${gradientClasses} min-h-[44px]`}
                            >
                              Ver Detalles
                            </Button>
                            <div className="text-sm text-muted-foreground">
                              📍 {result.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
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
