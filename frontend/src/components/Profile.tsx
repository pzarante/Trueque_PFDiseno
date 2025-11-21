import { motion } from "motion/react";
import { Edit, MapPin, Mail, Calendar, Package, Heart, Star, Pencil, Trash2, ArrowLeft, MessageCircle, Quote, User as UserIcon, ArrowLeftRight } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ProductCard, Product } from "./ProductCard";
import { Separator } from "./ui/separator";
import { EditProfile, ProfileData } from "./EditProfile";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { userAPI, ratingsAPI } from "../services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";
import { User } from "../App";
import { ThemeColor } from "./ThemeColorPicker";

interface ProfileProps {
  user: User;
  onViewProduct: (product: Product) => void;
  onPublishProduct?: () => void;
  publishedProducts?: Product[];
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onEditProduct?: (product: Product) => void;
  onDeactivateAccount?: () => void;
  onUpdateProfile?: (profileData: ProfileData) => Promise<void>;
  allProducts?: Product[];
  isViewingOther?: boolean;
  onNavigateBack?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  themeColor?: ThemeColor;
  onColorChange?: (color: ThemeColor) => void;
  onContactUser?: (userId: string, productId?: string) => void;
  onToggleFavorite?: (productId: string) => void;
  onProposeTrade?: (productId: string, proposedProductId?: string) => void;
  currentUserId?: string;
  currentUserFavorites?: string[];
}

export function Profile({ 
  user, 
  onViewProduct, 
  onPublishProduct,
  onDeleteProduct,
  onEditProduct,
  onDeactivateAccount,
  onUpdateProfile,
  allProducts = [],
  isViewingOther = false,
  onNavigateBack,
  themeColor = "blue",
  onContactUser,
  onToggleFavorite,
  onProposeTrade,
  currentUserId,
  currentUserFavorites = [],
}: ProfileProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [reputation, setReputation] = useState<{ averageScore: number; completedTrades: number } | null>(null);
  const [loadingReputation, setLoadingReputation] = useState(false);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const { themeColor: contextThemeColor } = useThemeColor();
  const activeThemeColor = themeColor || contextThemeColor;
  const gradientClasses = getGradientClasses(activeThemeColor);
  const shadowClasses = getShadowClasses(activeThemeColor);

  useEffect(() => {
    if (!loadingReputation) {
      if (isViewingOther && user.id) {
        loadOtherUserReputation(user.id);
        loadUserRatings(user.id);
      } else if (!isViewingOther) {
        loadReputation();
        loadUserRatings(user.id);
      }
    }
  }, [isViewingOther, user.id]);

  const loadReputation = async () => {
    if (isViewingOther) return;
    
    setLoadingReputation(true);
    try {
      const response = await userAPI.getReputation();
      const reputationData = (response as any).data || response;
      setReputation({
        averageScore: reputationData.averageScore || 0,
        completedTrades: reputationData.completedTrades || 0,
      });
    } catch (error) {
      console.error("Error al cargar reputación:", error);
      setReputation({ averageScore: 0, completedTrades: 0 });
    } finally {
      setLoadingReputation(false);
    }
  };

  const loadOtherUserReputation = async (userId: string) => {
    setLoadingReputation(true);
    try {
      const response = await userAPI.getProfileById(userId);
      const profileData = (response as any).data || response;
      if (profileData.reputation) {
        setReputation({
          averageScore: profileData.reputation.averageScore || 0,
          completedTrades: profileData.reputation.completedTrades || 0,
        });
      } else {
        setReputation({ averageScore: 0, completedTrades: 0 });
      }
    } catch (error) {
      console.error("Error al cargar reputación del usuario:", error);
      setReputation({ averageScore: 0, completedTrades: 0 });
    } finally {
      setLoadingReputation(false);
    }
  };

  const loadUserRatings = async (userId: string) => {
    if (!userId) return;
    
    setLoadingRatings(true);
    try {
      const response = await ratingsAPI.getUserRatings(userId);
      const ratingsData = (response as any).data || [];
      setRatings(ratingsData);
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
      setRatings([]);
    } finally {
      setLoadingRatings(false);
    }
  };
  
  // Obtener productos del usuario
  const userProducts = allProducts.filter(p => p.ownerUserId === user.id);
  const publishedUserProducts = userProducts.filter(p => p.status === "Publicada");
  const draftProducts = userProducts.filter(p => p.status === "Borrador");
  const pausedProducts = userProducts.filter(p => p.status === "Pausada");
  
  // Obtener productos favoritos
  const favoritedProducts = allProducts.filter(p => user.favorites.includes(p.id));

  const handleSaveProfile = async (profileData: ProfileData) => {
    if (onUpdateProfile) {
      try {
        await onUpdateProfile(profileData);
        toast.success("Perfil actualizado", {
          description: "Tus cambios se han guardado exitosamente",
        });
        setIsEditProfileOpen(false);
      } catch (error: any) {
        toast.error("Error al actualizar perfil", {
          description: error.message || "No se pudieron guardar los cambios",
        });
      }
    } else {
      toast.success("Perfil actualizado", {
        description: "Tus cambios se han guardado exitosamente",
      });
      setIsEditProfileOpen(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (onDeleteProduct) {
      onDeleteProduct(productId);
      toast.success("Producto eliminado", {
        description: "El producto ha sido eliminado exitosamente",
      });
    }
    setProductToDelete(null);
  };

  const handleDeactivate = () => {
    if (onDeactivateAccount) {
      onDeactivateAccount();
    }
    setShowDeactivateDialog(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button for viewing other profiles */}
        {isViewingOther && onNavigateBack && (
          <Button
            variant="ghost"
            onClick={onNavigateBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${gradientClasses} rounded-2xl p-8 mb-8 relative overflow-hidden shadow-xl ${shadowClasses}`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTEydjEyaDEyVjMweiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
          
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-10 right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl"
          />
          
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
              <AvatarFallback className="text-3xl bg-white text-purple-600">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl text-white">{user.name}</h1>
                {reputation && reputation.averageScore > 0 && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    {reputation.averageScore.toFixed(1)}
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.city}, Colombia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Miembro desde {formatDate(user.joinedDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isViewingOther ? (
                <Button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="bg-white text-purple-600 hover:bg-white/90 min-h-[44px]"
                  aria-label="Editar perfil"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              ) : (
                onContactUser && (
                  <Button 
                    onClick={() => onContactUser(user.id)}
                    className={`bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} min-h-[44px]`}
                    aria-label="Contactar usuario"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contactar
                  </Button>
                )
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Productos Publicados"
            value={userProducts.length.toString()}
            gradientClasses={gradientClasses}
          />
          <StatCard
            icon={<Heart className="w-5 h-5" />}
            label="Intercambios Completados"
            value={reputation?.completedTrades?.toString() || user.activities.filter(a => a.type === "trade" && a.title.includes("completado")).length.toString()}
            gradientClasses={gradientClasses}
          />
          <StatCard
            icon={<Star className="w-5 h-5 fill-current" />}
            label="Valoración Media"
            value={reputation?.averageScore?.toFixed(1) || "0.0"}
            gradientClasses={gradientClasses}
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="products">{isViewingOther ? "Productos" : "Mis Productos"}</TabsTrigger>
              {!isViewingOther && <TabsTrigger value="favorites">Favoritos</TabsTrigger>}
              {!isViewingOther && <TabsTrigger value="activity">Actividad</TabsTrigger>}
              <TabsTrigger value="ratings">Calificaciones ({ratings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2>{isViewingOther ? "Productos Publicados" : "Mis Productos"}</h2>
                  <p className="text-muted-foreground">
                    {isViewingOther 
                      ? `Productos publicados por ${user.name}`
                      : "Productos que has publicado para intercambiar"}
                  </p>
                </div>
                {!isViewingOther && onPublishProduct && (
                  <Button 
                    onClick={onPublishProduct}
                    className={`bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} min-h-[44px]`}
                    aria-label="Publicar nuevo producto"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Nuevo Producto
                  </Button>
                )}
              </div>
              
              {/* Publicados */}
              {publishedUserProducts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm">Publicados ({publishedUserProducts.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedUserProducts.map((product) => (
                      <div key={product.id} className="relative group">
                        <ProductCard
                          product={product}
                          onViewDetails={onViewProduct}
                          isOwnProduct={!isViewingOther}
                          currentUserId={currentUserId}
                          isFavorited={isViewingOther && currentUserFavorites ? (currentUserFavorites.includes(product.id) || false) : false}
                          onToggleFavorite={isViewingOther && onToggleFavorite ? onToggleFavorite : undefined}
                        />
                        {isViewingOther && onProposeTrade && currentUserId && allProducts && (
                          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2">
                            <Button
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                const userProducts = allProducts.filter(p => 
                                  p.ownerUserId === currentUserId && 
                                  p.status === "Publicada" &&
                                  p.id !== product.id
                                );
                                if (userProducts.length > 0) {
                                  onProposeTrade(product.id, userProducts[0].id);
                                  toast.success("Propuesta de intercambio enviada", {
                                    description: `Has propuesto intercambiar "${userProducts[0].title}" por "${product.title}"`,
                                  });
                                } else {
                                  toast.info("No tienes productos publicados", {
                                    description: "Publica un producto primero para poder proponer un intercambio",
                                  });
                                }
                              }}
                              className={`w-full bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses} min-h-[44px]`}
                              size="sm"
                            >
                              <ArrowLeftRight className="w-4 h-4 mr-2" />
                              Proponer Trueque
                            </Button>
                          </div>
                        )}
                        {!isViewingOther && (
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="w-9 h-9 rounded-full shadow-lg bg-white text-black hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                onEditProduct && onEditProduct(product);
                              }}
                              aria-label="Editar producto"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="w-9 h-9 rounded-full shadow-lg bg-white text-black hover:bg-red-500 hover:text-white dark:bg-white dark:text-black dark:hover:bg-red-500 dark:hover:text-white"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                setProductToDelete(product.id);
                              }}
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Borradores */}
              {draftProducts.length > 0 && !isViewingOther && (
                <div className="space-y-4">
                  <h3 className="text-sm">Borradores ({draftProducts.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {draftProducts.map((product) => (
                      <div key={product.id} className="relative group opacity-75">
                        <ProductCard
                          product={product}
                          onViewDetails={onViewProduct}
                          isOwnProduct={true}
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-9 h-9 rounded-full shadow-lg bg-white text-black hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              onEditProduct && onEditProduct(product);
                            }}
                            aria-label="Editar producto"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-9 h-9 rounded-full shadow-lg bg-white text-black hover:bg-red-500 hover:text-white dark:bg-white dark:text-black dark:hover:bg-red-500 dark:hover:text-white"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              setProductToDelete(product.id);
                            }}
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pausados */}
              {pausedProducts.length > 0 && !isViewingOther && (
                <div className="space-y-4">
                  <h3 className="text-sm">Pausados ({pausedProducts.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pausedProducts.map((product) => (
                      <div key={product.id} className="relative group opacity-75">
                        <ProductCard
                          product={product}
                          onViewDetails={onViewProduct}
                          isOwnProduct={true}
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-9 h-9 rounded-full shadow-lg bg-white text-black hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              onEditProduct && onEditProduct(product);
                            }}
                            aria-label="Editar producto"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-9 h-9 rounded-full shadow-lg bg-white text-black hover:bg-red-500 hover:text-white dark:bg-white dark:text-black dark:hover:bg-red-500 dark:hover:text-white"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              setProductToDelete(product.id);
                            }}
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userProducts.length === 0 && (
                <div className="text-center py-20 bg-card border border-border rounded-2xl">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="mb-2">
                    {isViewingOther ? "Este usuario no ha publicado productos" : "Aún no has publicado productos"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isViewingOther ? "Explora otros perfiles" : "Comienza a publicar productos para intercambiar"}
                  </p>
                  {!isViewingOther && onPublishProduct && (
                    <Button 
                      onClick={onPublishProduct}
                      className={`bg-gradient-to-r ${gradientClasses} min-h-[44px]`}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Publicar Primer Producto
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <div className="mb-6">
                <h2>Productos Favoritos</h2>
                <p className="text-muted-foreground">
                  Productos que te han gustado
                </p>
              </div>
              {favoritedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoritedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={onViewProduct}
                      currentUserId={user.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card border border-border rounded-2xl">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="mb-2">No tienes favoritos</h3>
                  <p className="text-muted-foreground">
                    Los productos que marques como favoritos aparecerán aquí
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="mb-6">
                <h2>Actividad Reciente</h2>
                <p className="text-muted-foreground">
                  Historial de tus intercambios y actividad
                </p>
              </div>
              {user.activities && user.activities.length > 0 ? (
                <div className="space-y-4">
                  {user.activities.map((activity, index) => (
                    <div key={activity.id}>
                      <ActivityItem
                        title={activity.title}
                        description={activity.description}
                        date={formatActivityDate(activity.date)}
                      />
                      {index < user.activities.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card border border-border rounded-2xl">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="mb-2">Sin actividad reciente</h3>
                  <p className="text-muted-foreground">
                    Tu actividad aparecerá aquí cuando realices acciones
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ratings" className="space-y-6">
              <div className="mb-6">
                <h2>Calificaciones Recibidas</h2>
                <p className="text-muted-foreground">
                  Comentarios y calificaciones de otros usuarios sobre tus trueques
                </p>
              </div>
              {loadingRatings ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
                  <p className="text-muted-foreground">Cargando calificaciones...</p>
                </div>
              ) : ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <motion.div
                      key={rating.id || rating._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${gradientClasses} rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{rating.rater?.name || "Usuario"}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (rating.rating || 0)
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-muted-foreground ml-1">
                                {rating.rating || 0}/5
                              </span>
                            </div>
                          </div>
                          {rating.comment && (
                            <div className="flex items-start gap-2 mt-2">
                              <Quote className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground italic">{rating.comment}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-3">
                            {new Date(rating.createdAt || rating.fecha_creacion || Date.now()).toLocaleDateString("es-CO", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card border border-border rounded-2xl">
                  <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="mb-2">
                    {isViewingOther ? "Este usuario no tiene calificaciones" : "Aún no tienes calificaciones"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isViewingOther 
                      ? "Las calificaciones aparecerán aquí cuando otros usuarios califiquen sus trueques"
                      : "Las calificaciones aparecerán aquí cuando completes trueques y otros usuarios te califiquen"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Deactivate Account Button */}
        {!isViewingOther && (
          <div className="mt-8 pt-8 border-t border-border">
            <Button
              variant="destructive"
              onClick={() => setShowDeactivateDialog(true)}
              className="min-h-[44px]"
            >
              Desactivar Cuenta
            </Button>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {!isViewingOther && (
        <EditProfile
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
          currentUser={user}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={productToDelete !== null} onOpenChange={(open: boolean) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente de tu perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
              className="bg-red-600 hover:bg-red-700 min-h-[44px]"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Account Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu cuenta será desactivada y no podrás acceder hasta que la reactives. Tus productos no serán visibles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-red-600 hover:bg-red-700 min-h-[44px]"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ icon, label, value, gradientClasses }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  gradientClasses: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradientClasses} rounded-lg flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl">{value}</p>
    </div>
  );
}

function ActivityItem({ title, description, date }: { title: string; description: string; date: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{date}</p>
      </div>
    </div>
  );
}

function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  
  return date.toLocaleDateString('es-CO');
}
