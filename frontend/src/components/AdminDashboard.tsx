import { motion } from "motion/react";
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  BarChart3,
  Shield,
  Moon,
  Sun
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Product } from "./ProductCard";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { ThemeColorPicker, ThemeColor } from "./ThemeColorPicker";
import { useThemeColor, getGradientClasses, getShadowClasses } from "../hooks/useThemeColor";
import { userAPI } from "../services/api";

interface AdminDashboardProps {
  publishedProducts: Product[];
  onDeleteProduct: (id: string) => void;
  allUsers?: any[];
  trades?: any[];
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  themeColor?: ThemeColor;
  onColorChange?: (color: ThemeColor) => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  totalProducts: number;
  totalTrades: number;
  rating: number;
  status: "active" | "suspended" | "pending";
  joinedDate: string;
}

const MOCK_USERS: UserData[] = [
  {
    id: "1",
    name: "María López",
    email: "maria@example.com",
    totalProducts: 12,
    totalTrades: 8,
    rating: 4.8,
    status: "active",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    email: "carlos@example.com",
    totalProducts: 6,
    totalTrades: 4,
    rating: 4.5,
    status: "active",
    joinedDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Ana García",
    email: "ana@example.com",
    totalProducts: 3,
    totalTrades: 2,
    rating: 5.0,
    status: "pending",
    joinedDate: "2024-03-10",
  },
];

interface TradeData {
  id: string;
  user1: string;
  user2: string;
  product1: string;
  product2: string;
  status: "pending" | "completed" | "cancelled";
  date: string;
}

const MOCK_TRADES: TradeData[] = [
  {
    id: "1",
    user1: "María López",
    user2: "Carlos Ruiz",
    product1: "Guitarra Acústica",
    product2: "Bicicleta de Montaña",
    status: "completed",
    date: "2024-03-15",
  },
  {
    id: "2",
    user1: "Ana García",
    user2: "María López",
    product1: "Cámara Vintage",
    product2: "Libro de Fotografía",
    status: "pending",
    date: "2024-03-20",
  },
];

export function AdminDashboard({ 
  publishedProducts, 
  onDeleteProduct, 
  allUsers = [], 
  trades: propTrades = [],
  isDarkMode = false,
  onToggleTheme,
  themeColor = "blue",
  onColorChange
}: AdminDashboardProps) {
  const [users, setUsers] = useState(allUsers.length > 0 ? allUsers : MOCK_USERS);
  const [trades, setTrades] = useState(propTrades.length > 0 ? propTrades : MOCK_TRADES);
  const { themeColor: contextThemeColor } = useThemeColor();
  const activeThemeColor = themeColor || contextThemeColor;
  const gradientClasses = getGradientClasses(activeThemeColor);
  const shadowClasses = getShadowClasses(activeThemeColor);

  const totalUsers = users.length;
  const totalProducts = publishedProducts.length;
  const totalTrades = trades.filter((t: any) => t.status === "completed").length;
  const pendingApprovals = users.filter((u: any) => u.status === "pending").length;

  const handleSuspendUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === "active" ? "suspended" : "active";
    const active = newStatus === "active";
    
    try {
      await userAPI.toggleUserStatus(user.email, active);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: newStatus }
          : u
      ));
      
      toast.success(active ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente");
    } catch (error: any) {
      console.error("Error al cambiar estado de usuario:", error);
      toast.error("Error al actualizar estado", {
        description: error.message || "No se pudo cambiar el estado del usuario",
      });
    }
  };

  const handleApproveUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    try {
      await userAPI.toggleUserStatus(user.email, true);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: "active" as const }
          : u
      ));
      
      toast.success("Usuario aprobado y activado exitosamente");
    } catch (error: any) {
      console.error("Error al aprobar usuario:", error);
      toast.error("Error al aprobar usuario", {
        description: error.message || "No se pudo aprobar el usuario",
      });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    onDeleteProduct(productId);
    toast.success("Producto eliminado");
  };

  return (
    <div className="min-h-screen pt-16 pb-20 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0a1628] dark:via-[#0d1f38] dark:to-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${gradientClasses} rounded-xl flex items-center justify-center shadow-lg ${shadowClasses}`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl">Panel de Administrador</h1>
                <p className="text-muted-foreground">
                  Gestiona usuarios, productos y estadísticas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onColorChange && (
                <ThemeColorPicker
                  currentColor={activeThemeColor}
                  onColorChange={onColorChange}
                />
              )}
              {onToggleTheme && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleTheme}
                  className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px]"
                  aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Usuarios"
            value={totalUsers.toString()}
            gradient="from-blue-600 to-cyan-600"
            delay={0}
          />
          <StatCard
            icon={<Package className="w-6 h-6" />}
            label="Total Productos"
            value={totalProducts.toString()}
            gradient="from-cyan-600 to-blue-600"
            delay={0.1}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Intercambios"
            value={totalTrades.toString()}
            gradient="from-blue-700 to-blue-800"
            delay={0.2}
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Pendientes"
            value={pendingApprovals.toString()}
            gradient="from-orange-600 to-red-600"
            delay={0.3}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="trades">Intercambios</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6">
              <h3 className="mb-6">Gestión de Usuarios</h3>
              <div className="space-y-4">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{user.name}</p>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : user.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className={
                              user.status === "active"
                                ? "bg-green-600"
                                : user.status === "pending"
                                ? "bg-orange-600"
                                : ""
                            }
                          >
                            {user.status === "active"
                              ? "Activo"
                              : user.status === "pending"
                              ? "Pendiente"
                              : "Suspendido"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{user.totalProducts} productos</span>
                          <span>{user.totalTrades} intercambios</span>
                          <span>{user.rating} estrellas</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveUser(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={user.status === "suspended" ? "default" : "outline"}
                        onClick={() => handleSuspendUser(user.id)}
                      >
                        {user.status === "suspended" ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Activar
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Suspender
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="p-6">
              <h3 className="mb-6">Productos Publicados</h3>
              <div className="space-y-4">
                {publishedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{product.category}</Badge>
                          <Badge variant="outline">{product.condition}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {publishedProducts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No hay productos publicados por usuarios
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Trades Tab */}
          <TabsContent value="trades">
            <Card className="p-6">
              <h3 className="mb-6">Historial de Intercambios</h3>
              <div className="space-y-4">
                {trades.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl border border-border hover:bg-accent transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant={
                          trade.status === "completed"
                            ? "default"
                            : trade.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          trade.status === "completed" ? "bg-green-600" : ""
                        }
                      >
                        {trade.status === "completed"
                          ? "Completado"
                          : trade.status === "pending"
                          ? "Pendiente"
                          : "Cancelado"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(trade.date).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">{trade.user1}</p>
                        <p className="text-xs text-muted-foreground">
                          {trade.product1}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{trade.user2}</p>
                        <p className="text-xs text-muted-foreground">
                          {trade.product2}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}
          >
            <div className="text-white">{icon}</div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
