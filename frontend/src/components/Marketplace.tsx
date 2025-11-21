import { motion } from "motion/react";
import { useState } from "react";
import { Search, SlidersHorizontal, Plus, X, Moon, Sun } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ProductCard, Product } from "./ProductCard";
import { Badge } from "./ui/badge";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { ThemeColorPicker, ThemeColor } from "./ThemeColorPicker";

interface MarketplaceProps {
  onViewProduct: (product: Product) => void;
  onPublishProduct: () => void;
  publishedProducts: Product[];
  currentUserId?: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  themeColor?: ThemeColor;
  onColorChange?: (color: ThemeColor) => void;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Cámara Vintage Analógica",
    description: "Cámara analógica en excelente estado, incluye funda de cuero original. Perfecta para fotografía artística.",
    category: "Electrónica",
    image: "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhfGVufDF8fHx8MTc2MDA1MjIzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Bogotá, Colombia",
    ownerName: "Ana García",
    ownerUserId: "mock1",
    condition: "Como Nuevo",
    interestedIn: ["Vinilos", "Libros de fotografía", "Trípode"],
    status: "Publicada",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Bicicleta de Montaña",
    description: "Bicicleta de montaña 21 velocidades, poco uso. Ideal para rutas y ciudad.",
    category: "Deportes",
    image: "https://images.unsplash.com/photo-1745550242881-05353e84f999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjAwOTYwNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Medellín, Colombia",
    ownerName: "Carlos Ruiz",
    ownerUserId: "mock2",
    condition: "Bueno",
    interestedIn: ["Patinete eléctrico", "Tabla de surf", "Equipo de camping"],
    status: "Publicada",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Guitarra Acústica",
    description: "Guitarra acústica con sonido cálido y profundo. Incluye funda acolchada y afinador.",
    category: "Música",
    image: "https://images.unsplash.com/photo-1630110330918-ced8a801add8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhcnxlbnwxfHx8fDE3NjAwNDE5NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Cali, Colombia",
    ownerName: "María López",
    ownerUserId: "mock3",
    condition: "Como Nuevo",
    interestedIn: ["Teclado", "Micrófono", "Pedales de efectos"],
    status: "Publicada",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Colección de Libros Clásicos",
    description: "Set de 15 libros clásicos de literatura universal en excelente estado.",
    category: "Libros",
    image: "https://images.unsplash.com/photo-1508060793788-7d5f1c40c4ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rcyUyMHNoZWxmfGVufDF8fHx8MTc2MDA3MDUxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Barranquilla, Colombia",
    ownerName: "Pedro Martínez",
    ownerUserId: "mock4",
    condition: "Bueno",
    interestedIn: ["Libros de ciencia ficción", "Comics", "Enciclopedias"],
    status: "Publicada",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Skateboard Profesional",
    description: "Skateboard completo con ruedas de alta calidad. Perfecto para trucos y street.",
    category: "Deportes",
    image: "https://images.unsplash.com/photo-1652411319700-5e5e68206ca8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2F0ZWJvYXJkJTIwc3BvcnR8ZW58MXx8fHwxNzYwMTM2MDEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Cartagena, Colombia",
    ownerName: "Luis Fernández",
    ownerUserId: "mock5",
    condition: "Usado",
    interestedIn: ["Longboard", "Casco y protecciones", "Zapatillas"],
    status: "Publicada",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Auriculares Inalámbricos",
    description: "Auriculares bluetooth con cancelación de ruido. Batería de larga duración.",
    category: "Electrónica",
    image: "https://images.unsplash.com/photo-1713618651165-a3cf7f85506c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwYXVkaW98ZW58MXx8fHwxNzYwMDM0MDM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Bucaramanga, Colombia",
    ownerName: "Laura Sánchez",
    ownerUserId: "mock6",
    condition: "Como Nuevo",
    interestedIn: ["Altavoz bluetooth", "Smartwatch", "Cargador inalámbrico"],
    status: "Publicada",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "7",
    title: "Laptop para Trabajo",
    description: "Portátil en buen estado, ideal para trabajar desde casa o estudiar.",
    category: "Electrónica",
    image: "https://images.unsplash.com/photo-1558478551-1a378f63328e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYwMTM4NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Pereira, Colombia",
    ownerName: "Roberto Gil",
    ownerUserId: "mock7",
    condition: "Bueno",
    interestedIn: ["Monitor", "Teclado mecánico", "Mouse gaming"],
    status: "Publicada",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "8",
    title: "Set de Yoga Completo",
    description: "Incluye esterilla, bloques, correa y bolsa de transporte. Todo en excelente estado.",
    category: "Deportes",
    image: "https://images.unsplash.com/photo-1704524853906-94753b3946cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGNoYW5nZSUyMGdvb2RzJTIwbWFya2V0cGxhY2V8ZW58MXx8fHwxNzYwMTM4NzQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Santa Marta, Colombia",
    ownerName: "Carmen Díaz",
    ownerUserId: "mock8",
    condition: "Nuevo",
    interestedIn: ["Pesas", "Bicicleta estática", "Ropa deportiva"],
    status: "Publicada",
    available: true,
    createdAt: new Date().toISOString(),
  },
];

const CATEGORIES = ["Todos", "Electrónica", "Deportes", "Música", "Libros", "Hogar", "Moda", "Arte", "Juguetes", "Otros"];
const LOCATIONS = ["Todas", "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Santa Marta"];
const CONDITIONS = ["Todas", "Nuevo", "Como Nuevo", "Bueno", "Usado"];
const STATUSES = ["Todos", "Disponible", "No Disponible"];

export function Marketplace({ 
  onViewProduct, 
  onPublishProduct, 
  publishedProducts, 
  currentUserId,
  isDarkMode = false,
  onToggleTheme,
  themeColor = "blue",
  onColorChange
}: MarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [selectedCondition, setSelectedCondition] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);

  // Combine mock products with published products - only show published products
  const allProducts = [...publishedProducts.filter(p => p.status === "Publicada"), ...MOCK_PRODUCTS];

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesLocation = selectedLocation === "Todas" || product.location.includes(selectedLocation);
    const matchesCondition = selectedCondition === "Todas" || product.condition === selectedCondition;
    const matchesStatus = selectedStatus === "Todos" || 
      (selectedStatus === "Disponible" && product.available) ||
      (selectedStatus === "No Disponible" && !product.available);
    return matchesSearch && matchesCategory && matchesLocation && matchesCondition && matchesStatus;
  });

  const clearFilters = () => {
    setSelectedCategory("Todos");
    setSelectedLocation("Todas");
    setSelectedCondition("Todas");
    setSelectedStatus("Todos");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory !== "Todos" || selectedLocation !== "Todas" || selectedCondition !== "Todas" || selectedStatus !== "Todos" || searchQuery !== "";

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl mb-2">Marketplace</h1>
              <p className="text-muted-foreground">
                Descubre productos disponibles para intercambiar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={onPublishProduct}
                className={`bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} min-h-[44px]`}
                aria-label="Publicar nuevo producto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Publicar Producto
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background min-h-[44px]"
                aria-label="Buscar productos en el marketplace"
              />
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="sm:w-auto min-h-[44px] relative"
                  aria-label="Abrir panel de filtros"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge className={`ml-2 bg-gradient-to-r ${gradientClasses} text-white border-0`}>
                      {[selectedCategory !== "Todos", selectedLocation !== "Todas", selectedCondition !== "Todas", selectedStatus !== "Todos", searchQuery !== ""].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros de Búsqueda</SheetTitle>
                  <SheetDescription>
                    Refina tu búsqueda para encontrar exactamente lo que necesitas
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
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
                    <Label htmlFor="condition-filter">Condición del Producto</Label>
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

                  {/* Disponibilidad */}
                  <div className="space-y-3">
                    <Label htmlFor="status-filter">Disponibilidad</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger id="status-filter" className="min-h-[44px]">
                        <SelectValue placeholder="Selecciona disponibilidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1 min-h-[44px]"
                      disabled={!hasActiveFilters}
                    >
                      Limpiar Filtros
                    </Button>
                    <Button
                      onClick={() => setIsFilterOpen(false)}
                      className={`flex-1 min-h-[44px] bg-gradient-to-r ${gradientClasses}`}
                    >
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {searchQuery && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  Búsqueda: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 hover:text-foreground"
                    aria-label="Eliminar filtro de búsqueda"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
                aria-label="Limpiar todos los filtros"
              >
                Limpiar todo
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide"
          role="tablist"
          aria-label="Filtrar por categoría"
        >
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap transition-all min-h-[44px] px-4 flex items-center ${
                selectedCategory === category
                  ? `bg-gradient-to-r ${gradientClasses} text-white border-0 shadow-lg ${shadowClasses}`
                  : "hover:bg-accent"
              }`}
              onClick={() => setSelectedCategory(category)}
              role="tab"
              aria-selected={selectedCategory === category}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCategory(category);
                }
              }}
            >
              {category}
            </Badge>
          ))}
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
          {hasActiveFilters && ` de ${allProducts.length} en total`}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="region"
            aria-label="Lista de productos disponibles"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
                currentUserId={currentUserId}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar tus filtros o búsqueda
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" className="min-h-[44px]">
                Limpiar todos los filtros
              </Button>
            )}
          </motion.div>
        )}

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-muted-foreground">
              No se encontraron productos que coincidan con tu búsqueda
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
