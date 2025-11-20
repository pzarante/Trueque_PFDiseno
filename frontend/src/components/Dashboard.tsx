import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  FileText, 
  Eye, 
  Pause, 
  CheckCircle, 
  Clock, 
  Send, 
  Inbox,
  Edit,
  Trash2,
  ArrowRightLeft,
  X,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Product } from "./ProductCard";
import { PublishProduct } from "./PublishProduct";
import { toast } from "sonner";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";
import { User } from "../App";
import { productAPI, truequesAPI, userAPI } from "../services/api";
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

const getProductImageUrl = (imageData: any): string => {
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed) && parsed[0]?.url) {
        return `http://localhost:3000${parsed[0].url}`;
      }
      if (Array.isArray(parsed) && parsed[0]?.filename) {
        return productAPI.getImage(parsed[0].filename);
      }
    } catch (e) {
      return imageData;
    }
  }
  if (imageData?.url) {
    return `http://localhost:3000${imageData.url}`;
  }
  if (imageData?.filename) {
    return productAPI.getImage(imageData.filename);
  }
  return imageData || "https://via.placeholder.com/300";
};

interface DashboardProps {
  user: User;
  onViewProduct: (product: Product) => void;
  themeColor?: string;
}

interface Trade {
  _id: string;
  id_usuario1: string;
  id_usuario2: string;
  id_porductOferente: string;
  id_productDestinatario: string;
  status: string;
  confirmacion_oferente: string;
  confirmacion_destinatario: string;
  fecha_creacion: string;
  fecha_confirmacion?: string;
  producto_oferente?: Product;
  producto_destinatario?: Product;
  usuario_oferente?: any;
  usuario_destinatario?: any;
  mi_confirmacion?: string;
}

export function Dashboard({ 
  user, 
  onViewProduct,
  themeColor = "blue"
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"ofertas" | "trueques">("ofertas");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [tradeToConfirm, setTradeToConfirm] = useState<{ id: string; action: 'aceptar' | 'rechazar' } | null>(null);
  
  const { themeColor: contextThemeColor } = useThemeColor();
  const activeThemeColor = (themeColor || contextThemeColor) as "blue" | "purple" | "red" | "orange" | "green";
  const gradientClasses = getGradientClasses(activeThemeColor);
  const shadowClasses = getShadowClasses(activeThemeColor);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const productsResponse = await userAPI.getProducts() as any;
      const productsData = productsResponse.data || [];
      const transformedProducts: Product[] = productsData.map((p: any) => {
        let images: string[] = [];
        try {
          if (p.imagenes) {
            const imgData = typeof p.imagenes === 'string' ? JSON.parse(p.imagenes) : p.imagenes;
            images = Array.isArray(imgData) 
              ? imgData.map((img: any) => getProductImageUrl(img))
              : [getProductImageUrl(p.imagenes)];
          }
        } catch (e) {
          console.error("Error parsing images:", e);
        }

        return {
          id: p._id,
          title: p.nombre,
          description: p.comentarioNLP || p.descripcion || "",
          category: p.categoria,
          image: images[0] || "",
          images: images,
          location: p.ubicacion || "",
          ownerName: p.usuario?.name || user.name,
          ownerUserId: p.oferenteID || user.id,
          condition: "Bueno",
          interestedIn: p.condicionesTrueque ? [p.condicionesTrueque] : [],
          status: p.estado === "publicado" ? "published" : p.estado === "pausado" ? "paused" : "draft",
          available: p.activo !== false,
          createdAt: p.fechaCreacion || new Date().toISOString(),
        };
      });
      
      setProducts(transformedProducts);

      const tradesResponse = await truequesAPI.getMyTrades() as any;
      setTrades(tradesResponse.data || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos", {
        description: error.message || "No se pudieron cargar tus ofertas y trueques",
      });
    } finally {
      setLoading(false);
    }
  };

  const draftProducts = products.filter(p => p.status === "draft");
  const publishedProducts = products.filter(p => p.status === "published");
  const pausedProducts = products.filter(p => p.status === "paused");
  const receivedTrades = trades.filter(t => t.id_usuario1 === user.id && t.id_usuario2 !== user.id);
  const sentTrades = trades.filter(t => t.id_usuario2 === user.id && t.id_usuario1 !== user.id);
  const pendingTrades = trades.filter(t => 
    (t.id_usuario1 === user.id || t.id_usuario2 === user.id) && 
    t.status === "pendiente" &&
    (t.mi_confirmacion === "pendiente" || !t.mi_confirmacion)
  );
  const closedTrades = trades.filter(t => 
    (t.id_usuario1 === user.id || t.id_usuario2 === user.id) && 
    (t.status === "completado" || t.status === "rechazado")
  );

  const handlePublishProduct = async (product: Omit<Product, "id"> | Product, imageFiles?: File[]) => {
    try {
      if ('id' in product && product.id) {
        await productAPI.update({
          nombre: product.title,
          categoria: product.category,
          condicionesTrueque: product.interestedIn?.join(", ") || "Cualquier cosa",
          comentarioNLP: product.description,
          ubicacion: product.location.replace(", Colombia", ""),
        });
        toast.success("Producto actualizado");
      } else {
        if (!imageFiles || imageFiles.length === 0) {
          toast.error("Debes subir al menos una imagen");
          return;
        }
        await productAPI.create({
          nombre: product.title,
          categoria: product.category,
          condicionesTrueque: product.interestedIn?.join(", ") || "Cualquier cosa",
          comentarioNLP: product.description,
          ubicacion: product.location.replace(", Colombia", ""),
          imagenes: imageFiles,
        });
        toast.success("Producto creado exitosamente");
      }
      setIsPublishModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (error: any) {
      console.error("Error al guardar producto:", error);
      toast.error("Error al guardar producto", {
        description: error.message || "No se pudo guardar el producto. Verifica que el backend esté corriendo.",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      await productAPI.delete(product.title);
      toast.success("Producto eliminado");
      setProductToDelete(null);
      loadData();
    } catch (error: any) {
      toast.error("Error al eliminar producto", {
        description: error.message || "No se pudo eliminar el producto",
      });
    }
  };

  const handleChangeStatus = async (product: Product, newStatus: string) => {
    try {
      const statusMap: Record<string, string> = {
        "published": "publicado",
        "paused": "pausado",
        "draft": "borrador",
        "publicado": "publicado",
        "pausado": "pausado",
        "borrador": "borrador"
      };
      
      const backendStatus = statusMap[newStatus] || newStatus;
      await productAPI.updateStatus(product.title, backendStatus);
      
      const statusMessages: Record<string, string> = {
        "publicado": "publicado",
        "pausado": "pausado",
        "borrador": "guardado como borrador"
      };
      
      toast.success(`Producto ${statusMessages[backendStatus] || backendStatus}`);
      loadData();
    } catch (error: any) {
      toast.error("Error al cambiar estado", {
        description: error.message || "No se pudo cambiar el estado del producto",
      });
    }
  };

  const handleConfirmTrade = async (tradeId: string, action: 'aceptar' | 'rechazar') => {
    try {
      await truequesAPI.confirm(tradeId, action);
      toast.success(action === 'aceptar' ? "Trueque aceptado" : "Trueque rechazado");
      setTradeToConfirm(null);
      loadData();
    } catch (error: any) {
      toast.error("Error al confirmar trueque", {
        description: error.message || "No se pudo procesar la confirmación",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsPublishModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Borrador", variant: "outline" },
      published: { label: "Publicada", variant: "default" },
      paused: { label: "Pausada", variant: "secondary" },
      pendiente: { label: "Pendiente", variant: "secondary" },
      completado: { label: "Completado", variant: "default" },
      rechazado: { label: "Rechazado", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mi Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus ofertas y trueques
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setIsPublishModalOpen(true);
            }}
            className={`bg-gradient-to-r ${gradientClasses} shadow-lg ${shadowClasses}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Oferta
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "ofertas" | "trueques")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ofertas">
              <Package className="w-4 h-4 mr-2" />
              Mis Ofertas
            </TabsTrigger>
            <TabsTrigger value="trueques">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Trueques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ofertas" className="space-y-4">
            <Tabs defaultValue="todas" className="space-y-4">
              <TabsList>
                <TabsTrigger value="todas">Todas ({products.length})</TabsTrigger>
                <TabsTrigger value="borradores">Borradores ({draftProducts.length})</TabsTrigger>
                <TabsTrigger value="publicadas">Publicadas ({publishedProducts.length})</TabsTrigger>
                <TabsTrigger value="pausadas">Pausadas ({pausedProducts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="todas">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No tienes ofertas aún</p>
                        <Button
                          onClick={() => setIsPublishModalOpen(true)}
                          className="mt-4"
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Crear primera oferta
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    products.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={product.image || "https://via.placeholder.com/300"}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(product.status)}
                          </div>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">{product.title}</CardTitle>
                          <CardDescription>{product.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewProduct(product)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setProductToDelete(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {product.status === "draft" && (
                              <Button
                                size="sm"
                                onClick={() => handleChangeStatus(product, "publicado")}
                                className="ml-auto"
                              >
                                Publicar
                              </Button>
                            )}
                            {product.status === "published" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangeStatus(product, "pausado")}
                                className="ml-auto"
                              >
                                Pausar
                              </Button>
                            )}
                            {product.status === "paused" && (
                              <Button
                                size="sm"
                                onClick={() => handleChangeStatus(product, "publicado")}
                                className="ml-auto"
                              >
                                Reanudar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="borradores">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftProducts.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No tienes borradores</p>
                      </CardContent>
                    </Card>
                  ) : (
                    draftProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={product.image || "https://via.placeholder.com/300"}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">{product.title}</CardTitle>
                          <CardDescription>{product.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleChangeStatus(product, "publicado")}
                              className="ml-auto"
                            >
                              Publicar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="publicadas">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publishedProducts.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Eye className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No tienes ofertas publicadas</p>
                      </CardContent>
                    </Card>
                  ) : (
                    publishedProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={product.image || "https://via.placeholder.com/300"}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">{product.title}</CardTitle>
                          <CardDescription>{product.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewProduct(product)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChangeStatus(product, "pausado")}
                              className="ml-auto"
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Pausar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pausadas">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pausedProducts.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Pause className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No tienes ofertas pausadas</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pausedProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={product.image || "https://via.placeholder.com/300"}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">{product.title}</CardTitle>
                          <CardDescription>{product.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            size="sm"
                            onClick={() => handleChangeStatus(product, "publicado")}
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Reanudar publicación
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="trueques" className="space-y-4">
            <Tabs defaultValue="todos" className="space-y-4">
              <TabsList>
                <TabsTrigger value="todos">Todos ({trades.length})</TabsTrigger>
                <TabsTrigger value="recibidos">Recibidos ({receivedTrades.length})</TabsTrigger>
                <TabsTrigger value="enviados">Enviados ({sentTrades.length})</TabsTrigger>
                <TabsTrigger value="pendientes">Confirmación Pendiente ({pendingTrades.length})</TabsTrigger>
                <TabsTrigger value="cerrados">Cerrados ({closedTrades.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="todos">
                <div className="space-y-4">
                  {trades.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <ArrowRightLeft className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No tienes trueques aún</p>
                      </CardContent>
                    </Card>
                  ) : (
                    trades.map((trade) => (
                      <TradeCard
                        key={trade._id}
                        trade={trade}
                        currentUserId={user.id}
                        onViewProduct={onViewProduct}
                        onConfirm={(id, action) => setTradeToConfirm({ id, action })}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recibidos">
                <div className="space-y-4">
                  {receivedTrades.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No has recibido propuestas de trueque</p>
                      </CardContent>
                    </Card>
                  ) : (
                    receivedTrades.map((trade) => (
                      <TradeCard
                        key={trade._id}
                        trade={trade}
                        currentUserId={user.id}
                        onViewProduct={onViewProduct}
                        onConfirm={(id, action) => setTradeToConfirm({ id, action })}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="enviados">
                <div className="space-y-4">
                  {sentTrades.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Send className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No has enviado propuestas de trueque</p>
                      </CardContent>
                    </Card>
                  ) : (
                    sentTrades.map((trade) => (
                      <TradeCard
                        key={trade._id}
                        trade={trade}
                        currentUserId={user.id}
                        onViewProduct={onViewProduct}
                        onConfirm={(id, action) => setTradeToConfirm({ id, action })}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pendientes">
                <div className="space-y-4">
                  {pendingTrades.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No tienes trueques pendientes de confirmación</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pendingTrades.map((trade) => (
                      <TradeCard
                        key={trade._id}
                        trade={trade}
                        currentUserId={user.id}
                        onViewProduct={onViewProduct}
                        onConfirm={(id, action) => setTradeToConfirm({ id, action })}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="cerrados">
                <div className="space-y-4">
                  {closedTrades.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No tienes trueques cerrados</p>
                      </CardContent>
                    </Card>
                  ) : (
                    closedTrades.map((trade) => (
                      <TradeCard
                        key={trade._id}
                        trade={trade}
                        currentUserId={user.id}
                        onViewProduct={onViewProduct}
                        onConfirm={(id, action) => setTradeToConfirm({ id, action })}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </motion.div>

      <PublishProduct
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setEditingProduct(null);
        }}
        onPublish={handlePublishProduct}
        currentUser={user}
        editingProduct={editingProduct}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!tradeToConfirm} onOpenChange={() => setTradeToConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tradeToConfirm?.action === 'aceptar' ? '¿Aceptar trueque?' : '¿Rechazar trueque?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tradeToConfirm?.action === 'aceptar' 
                ? 'Al aceptar, el trueque quedará pendiente de confirmación de la otra parte.'
                : 'Al rechazar, el trueque será cancelado.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tradeToConfirm && handleConfirmTrade(tradeToConfirm.id, tradeToConfirm.action)}
              className={tradeToConfirm?.action === 'aceptar' ? '' : 'bg-destructive text-destructive-foreground'}
            >
              {tradeToConfirm?.action === 'aceptar' ? 'Aceptar' : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TradeCard({ 
  trade, 
  currentUserId, 
  onViewProduct, 
  onConfirm 
}: { 
  trade: Trade; 
  currentUserId: string; 
  onViewProduct: (product: Product) => void;
  onConfirm: (id: string, action: 'aceptar' | 'rechazar') => void;
}) {
  const isReceived = trade.id_usuario1 === currentUserId;
  const otherUser = isReceived ? trade.usuario_destinatario : trade.usuario_oferente;
  const myProduct = isReceived ? trade.producto_oferente : trade.producto_destinatario;
  const otherProduct = isReceived ? trade.producto_destinatario : trade.producto_oferente;
  const needsMyConfirmation = trade.mi_confirmacion === "pendiente" || !trade.mi_confirmacion;

  if (!myProduct || !otherProduct) {
    return null;
  }

  const myProductData = myProduct as any;
  const otherProductData = otherProduct as any;

  const myProductFormatted: Product = {
    id: myProductData._id || myProductData.id || "",
    title: myProductData.nombre || myProductData.title || "",
    description: myProductData.comentarioNLP || myProductData.description || "",
    category: myProductData.categoria || myProductData.category || "",
    image: getProductImageUrl(myProductData.imagenes || myProductData.image),
    images: [],
    location: myProductData.ubicacion || myProductData.location || "",
    ownerName: myProductData.usuario?.name || "",
    ownerUserId: myProductData.oferenteID || "",
    condition: "Bueno",
    interestedIn: [],
    status: "published",
    available: true,
    createdAt: "",
  };

  const otherProductFormatted: Product = {
    id: otherProductData._id || otherProductData.id || "",
    title: otherProductData.nombre || otherProductData.title || "",
    description: otherProductData.comentarioNLP || otherProductData.description || "",
    category: otherProductData.categoria || otherProductData.category || "",
    image: getProductImageUrl(otherProductData.imagenes || otherProductData.image),
    images: [],
    location: otherProductData.ubicacion || otherProductData.location || "",
    ownerName: otherUser?.name || "",
    ownerUserId: otherProductData.oferenteID || "",
    condition: "Bueno",
    interestedIn: [],
    status: "published",
    available: true,
    createdAt: "",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trueque #{trade._id.slice(-8)}</CardTitle>
          <Badge variant={
            trade.status === "completado" ? "default" :
            trade.status === "rechazado" ? "destructive" :
            "secondary"
          }>
            {trade.status}
          </Badge>
        </div>
        <CardDescription>
          {isReceived ? "Recibiste" : "Enviaste"} una propuesta de trueque
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium mb-2">Tu producto:</p>
            <div 
              className="border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onViewProduct(myProductFormatted)}
            >
              <img
                src={myProductFormatted.image || "https://via.placeholder.com/150"}
                alt={myProductFormatted.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <p className="font-medium">{myProductFormatted.title}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">
              {isReceived ? "Producto ofrecido:" : "Producto solicitado:"}
            </p>
            <div 
              className="border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onViewProduct(otherProductFormatted)}
            >
              <img
                src={otherProductFormatted.image || "https://via.placeholder.com/150"}
                alt={otherProductFormatted.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <p className="font-medium">{otherProductFormatted.title}</p>
              <p className="text-sm text-muted-foreground">de {otherUser?.name || "Usuario"}</p>
            </div>
          </div>
        </div>
        
        {needsMyConfirmation && trade.status === "pendiente" && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => onConfirm(trade._id, 'aceptar')}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Aceptar
            </Button>
            <Button
              onClick={() => onConfirm(trade._id, 'rechazar')}
              variant="destructive"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
          </div>
        )}

        {trade.status === "completado" && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Trueque completado</span>
            </div>
            {trade.fecha_confirmacion && (
              <p className="text-xs text-muted-foreground mt-1">
                Confirmado el {new Date(trade.fecha_confirmacion).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

