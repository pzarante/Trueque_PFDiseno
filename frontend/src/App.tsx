import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { EmailVerification } from "./components/EmailVerification";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { Marketplace } from "./components/Marketplace";
import { Profile } from "./components/Profile";
import { ProductDetail } from "./components/ProductDetail";
import { NotificationPanel } from "./components/NotificationPanel";
import { Chat } from "./components/Chat";
import { PublishProduct } from "./components/PublishProduct";
import { AdminDashboard } from "./components/AdminDashboard";
import { Dashboard } from "./components/Dashboard";
import { SemanticSearch } from "./components/SemanticSearch";
import { Recommendations } from "./components/Recommendations";
import { Product } from "./components/ProductCard";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { ThemeColor } from "./components/ThemeColorPicker";
import { ThemeColorProvider } from "./hooks/useThemeColor";
import { useAuth } from "./hooks/useAuth";
import { authAPI, userAPI, productAPI } from "./services/api";

type Page = "home" | "login" | "register" | "marketplace" | "profile" | "dashboard" | "admin" | "userProfile" | "semanticSearch" | "recommendations" | "forgot-password" | "reset-password";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  city: string;
  joinedDate: string;
  favorites: string[];
  activities: Activity[];
  isActive: boolean;
}

export interface Activity {
  id: string;
  type: "trade" | "product" | "rating" | "message";
  title: string;
  description: string;
  date: string;
  productId?: string;
  userId?: string;
}

export interface Notification {
  id: string;
  type: "message" | "trade" | "achievement" | "system" | "product" | "trade_request" | "trade_accepted" | "trade_rejected" | "trade_cancelled";
  title: string;
  description: string;
  time: string;
  read: boolean;
  productId?: string;
  userId?: string;
  messageId?: string;
  tradeId?: string;
  actionable?: boolean;
}

export interface Trade {
  id: string;
  user1Id: string;
  user2Id: string;
  product1Id: string;
  product2Id: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: string;
  initiatorId: string;
  receiverId: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "Nuevo mensaje de María López",
    description: "Perfecto, quedamos mañana entonces",
    time: "Hace 5 min",
    read: false,
    userId: "mock1"
  },
  {
    id: "2",
    type: "trade",
    title: "Propuesta de intercambio recibida",
    description: "Carlos Ruiz está interesado en tu bicicleta",
    time: "Hace 1 hora",
    read: false,
    productId: "2"
  },
  {
    id: "3",
    type: "achievement",
    title: "¡Felicitaciones!",
    description: "Completaste tu primer intercambio exitoso",
    time: "Hace 2 horas",
    read: true,
  },
];

// LocalStorage keys
const STORAGE_KEYS = {
  USER: "swaply_current_user",
  USERS: "swaply_users",
  PRODUCTS: "swaply_products",
  NOTIFICATIONS: "swaply_notifications",
  TRADES: "swaply_trades",
  FAVORITES: "swaply_favorites",
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { user: authUser, loading: authLoading, isAuthenticated, login: authLogin, logout: authLogout, setUser: setAuthUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [publishedProducts, setPublishedProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState<ThemeColor>("blue");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [verificationPassword, setVerificationPassword] = useState<string>("");
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);

  // Sincronizar usuario del hook de autenticación con el estado local
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else if (!authLoading && !isAuthenticated) {
      setUser(null);
    }
  }, [authUser, authLoading, isAuthenticated]);

  // Verificar si hay token de reset de contraseña en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) {
      setResetPasswordToken(resetToken);
      setCurrentPage("reset-password");
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load from localStorage (mantener para datos locales como productos, notificaciones, etc.)
  useEffect(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const savedTrades = localStorage.getItem(STORAGE_KEYS.TRADES);

    if (savedUsers) setAllUsers(JSON.parse(savedUsers));
    if (savedProducts) setPublishedProducts(JSON.parse(savedProducts));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedTrades) setTrades(JSON.parse(savedTrades));
  }, []);

  // Sincronizar cambios de usuario con el hook de autenticación
  useEffect(() => {
    if (user && user !== authUser) {
      setAuthUser(user);
    }
  }, [user, authUser, setAuthUser]);

  // Proteger rutas cuando no hay autenticación
  useEffect(() => {
    if (authLoading) return; // Esperar a que termine la verificación
    
    const protectedPages = ["marketplace", "profile", "semanticSearch", "recommendations"];
    const isProtectedPage = protectedPages.includes(currentPage);
    const hasToken = localStorage.getItem('token');
    const isUserAuthenticated = user || (hasToken && isAuthenticated);
    
    // Si estamos en una página protegida y no hay autenticación, redirigir a login
    if (isProtectedPage && !isUserAuthenticated) {
      setCurrentPage("login");
      toast.error("Acceso denegado", {
        description: "Debes iniciar sesión para acceder a esta sección",
      });
    }
  }, [authLoading, currentPage, user, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(publishedProducts));
  }, [publishedProducts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  }, [trades]);

  // Load theme preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedColor = localStorage.getItem("themeColor") as ThemeColor | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }

    // Set theme color
    if (savedColor && ["blue", "purple", "red", "orange", "green"].includes(savedColor)) {
      setThemeColor(savedColor);
      document.documentElement.setAttribute("data-theme", savedColor);
    } else {
      document.documentElement.setAttribute("data-theme", "blue");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleColorChange = (color: ThemeColor) => {
    setThemeColor(color);
    document.documentElement.setAttribute("data-theme", color);
    localStorage.setItem("themeColor", color);
    
    const colorNames = {
      blue: "Azul",
      purple: "Morado",
      red: "Rojo",
      orange: "Naranja",
      green: "Verde"
    };
    
    toast.success("Color del tema actualizado", {
      description: `Ahora estás usando el tema ${colorNames[color]}`,
    });
  };

  const addActivity = (userId: string, activity: Activity) => {
    setAllUsers(users => 
      users.map(u => 
        u.id === userId 
          ? { ...u, activities: [activity, ...u.activities.slice(0, 19)] }
          : u
      )
    );
    
    if (user && user.id === userId) {
      setUser(u => u ? { ...u, activities: [activity, ...u.activities.slice(0, 19)] } : null);
    }
  };

  const handleLogin = async (email: string, password: string, isAdmin: boolean) => {
    if (isAdmin) {
      // Validar credenciales de administrador (mantener lógica local para admin)
      if (email === "admin@swaply.com" && password === "admin123") {
        const adminUser: User = {
          id: "admin",
          name: "Administrador",
          email: email,
          role: "admin",
          city: "Bogotá",
          joinedDate: new Date().toISOString(),
          favorites: [],
          activities: [],
          isActive: true,
        };
        setUser(adminUser);
        setCurrentPage("admin");
        toast.success("¡Bienvenido Administrador!", {
          description: "Has accedido al panel de administración",
        });
      } else {
        toast.error("Credenciales inválidas", {
          description: "El email o contraseña de administrador son incorrectos",
        });
      }
    } else {
      try {
        const result = await authLogin(email, password);
        
        if (result.success && result.user) {
          setUser(result.user);
          setCurrentPage("marketplace");
          toast.success("¡Bienvenido de vuelta!", {
            description: "Has iniciado sesión exitosamente",
          });
        }
      } catch (error: any) {
        console.error("Error en login:", error);
        
        // Verificar si el error es por email no verificado (solo si el backend responde con 403)
        const errorData = error.errorData || {};
        if (error.status === 403 && errorData.requiresVerification) {
          setVerificationEmail(email);
          setShowEmailVerification(true);
          toast.info("Verificación requerida", {
            description: errorData.message || "Debes verificar tu correo electrónico antes de iniciar sesión",
          });
          return;
        }
        
        // Para otros errores, mostrar el mensaje normal
        toast.error("Error al iniciar sesión", {
          description: error.message || "No se pudo conectar con el servidor. Verifica que el backend esté corriendo.",
        });
      }
    }
  };

  const handleVerifyEmail = async (code: string) => {
    try {
      console.log('Verificando código:', code, 'para email:', verificationEmail);
      const response = await authAPI.verify(verificationEmail, code);
      console.log('Respuesta de verificación:', response);
      
      // Verificar que la verificación fue exitosa
      const isVerified = (response as any)?.verified || (response as any)?.message?.includes('verificado');
      
      if (isVerified || response) {
        toast.success("¡Email verificado!", {
          description: "Tu cuenta ha sido verificada exitosamente. Ahora puedes iniciar sesión.",
          duration: 5000,
        });
        
        setShowEmailVerification(false);
        setVerificationEmail("");
        setVerificationPassword("");
        setCurrentPage("login");
      } else {
        throw new Error("La verificación no fue completada correctamente");
      }
    } catch (error: any) {
      console.error("Error en verificación:", error);
      
      // Extraer mensaje de error más específico del backend
      let errorMessage = "Código inválido. Por favor intenta de nuevo.";
      
      if (error.errorData) {
        const errorData = error.errorData;
        
        // Priorizar el mensaje del backend que viene de ROBLE
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detalles) {
          const detalles = errorData.detalles;
          if (typeof detalles === 'string') {
            errorMessage = detalles;
          } else if (detalles.message) {
            errorMessage = detalles.message;
          } else if (detalles.error) {
            errorMessage = detalles.error;
          } else {
            // Si detalles es un objeto, intentar extraer el mensaje de ROBLE
            errorMessage = JSON.stringify(detalles);
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.robleError) {
          // Intentar extraer mensaje del error de ROBLE
          const robleError = errorData.robleError;
          errorMessage = robleError.message || robleError.error || robleError.msg || errorMessage;
        }
      } else if (error.message) {
        // Si el mensaje contiene "registrar", cambiarlo por un mensaje más apropiado
        if (error.message.includes('registrar')) {
          errorMessage = "Código de verificación inválido. Por favor verifica el código e intenta de nuevo.";
        } else {
          errorMessage = error.message;
        }
      }
      
      // No mencionar "expirado" a menos que el mensaje realmente lo indique
      if (!errorMessage.toLowerCase().includes('expir') && 
          !errorMessage.toLowerCase().includes('expired') &&
          !errorMessage.toLowerCase().includes('vencido')) {
        // Si el mensaje menciona expirado pero no debería, removerlo
        errorMessage = errorMessage.replace(/expirado|expired|vencido/gi, 'inválido');
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await authAPI.forgotPassword(email);
      
      toast.success("Instrucciones enviadas", {
        description: "Se han enviado las instrucciones para recuperar tu contraseña a tu correo electrónico.",
        duration: 6000,
      });
      
      // Volver al login después de enviar
      setCurrentPage("login");
    } catch (error: any) {
      console.error("Error al solicitar recuperación:", error);
      
      let errorMessage = "No se pudo enviar la solicitud. Por favor intenta de nuevo.";
      
      if (error.errorData) {
        const errorData = error.errorData;
        if (errorData.detalles) {
          const detalles = errorData.detalles;
          errorMessage = typeof detalles === 'string' 
            ? detalles 
            : (detalles.message || detalles.error || errorMessage);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!resetPasswordToken) {
      throw new Error("Token de recuperación no válido");
    }

    try {
      await authAPI.resetPassword(resetPasswordToken, newPassword);
      
      toast.success("¡Contraseña restablecida!", {
        description: "Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.",
        duration: 5000,
      });
      
      setResetPasswordToken(null);
      setCurrentPage("login");
    } catch (error: any) {
      console.error("Error al restablecer contraseña:", error);
      
      let errorMessage = "No se pudo restablecer la contraseña. Por favor intenta de nuevo.";
      
      if (error.errorData) {
        const errorData = error.errorData;
        if (errorData.detalles) {
          const detalles = errorData.detalles;
          errorMessage = typeof detalles === 'string' 
            ? detalles 
            : (detalles.message || detalles.error || errorMessage);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      // Usar la contraseña guardada si está disponible, si no el backend usará una temporal
      await authAPI.resendVerificationCode(verificationEmail, verificationPassword || undefined);
      
      toast.success("Código reenviado", {
        description: "Se ha reenviado el código de verificación a tu correo electrónico. Revisa tu bandeja de entrada y la carpeta de spam.",
        duration: 6000,
      });
    } catch (error: any) {
      console.error("Error al reenviar código:", error);
      
      let errorMessage = "No se pudo reenviar el código. Por favor intenta de nuevo.";
      
      if (error.errorData) {
        const errorData = error.errorData;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleRegister = async (name: string, email: string, password: string, city: string) => {
    try {
      const response = await authAPI.register({ name, email, password, ciudad: city });
      
      // Verificar si hay información sobre verificación de email
      const emailVerification = (response as any)?.emailVerification;
      const verificationMessage = emailVerification?.message || 
        "Se ha enviado un correo electrónico con el código de verificación a tu dirección de correo.";
      
      toast.success("¡Cuenta creada exitosamente!", {
        description: verificationMessage,
        duration: 6000,
      });
      
      // Solo mostrar pantalla de verificación si realmente se requiere
      if (emailVerification?.required) {
        setVerificationEmail(email);
        setVerificationPassword(password); // Guardar contraseña para reenviar código
        setShowEmailVerification(true);
      } else {
        // Redirigir al login después del registro como antes
        setCurrentPage("login");
      }
    } catch (error: any) {
      console.error("Error en registro:", error);
      // Extraer el mensaje de error, incluyendo detalles del backend
      let errorMessage = error.message || error.error || "No se pudo crear la cuenta.";
      
      // Si hay errorData con detalles, usarlos
      if (error.errorData) {
        if (error.errorData.detalles) {
          const detalles = error.errorData.detalles;
          errorMessage = typeof detalles === 'string' 
            ? detalles 
            : (detalles.message || detalles.error || JSON.stringify(detalles));
        } else if (error.errorData.error) {
          errorMessage = error.errorData.error;
        } else if (error.errorData.message) {
          errorMessage = error.errorData.message;
        }
      }
      
      // Si no hay conexión, mensaje más específico
      if (error.message && error.message.includes('fetch')) {
        errorMessage = "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000";
      }
      
      toast.error("Error al registrar", {
        description: errorMessage,
      });
    }
  };

  const handleLogout = () => {
    // Limpiar token y estado de autenticación
    authLogout();
    setUser(null);
    setCurrentPage("home");
    toast.info("Sesión cerrada", {
      description: "Has cerrado sesión exitosamente",
    });
  };

  const handleNavigate = (page: string) => {
    // Rutas protegidas que requieren autenticación
    const protectedPages = ["marketplace", "profile", "semanticSearch", "recommendations"];
    const requiresAuth = protectedPages.includes(page);
    
    // Verificar si hay token o usuario autenticado
    const hasToken = localStorage.getItem('token');
    const isUserAuthenticated = user || (hasToken && isAuthenticated);
    
    // Si la página requiere autenticación y no hay usuario/token, redirigir a login
    if (requiresAuth && !isUserAuthenticated && !authLoading) {
      setCurrentPage("login");
      toast.error("Acceso denegado", {
        description: "Debes iniciar sesión para acceder a esta sección",
      });
      return;
    }
    
    // Bloquear marketplace, profile, búsqueda y recomendaciones para admins
    if (user && user.role === "admin" && (page === "marketplace" || page === "profile" || page === "semanticSearch" || page === "recommendations")) {
      toast.error("Acceso denegado", {
        description: "Los administradores no pueden acceder a esta sección",
      });
      return;
    }
    
    if (page === "admin" && (!user || user.role !== "admin")) {
      toast.error("Acceso denegado", {
        description: "Solo los administradores pueden acceder a esta sección",
      });
      return;
    }
    setCurrentPage(page as Page);
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = publishedProducts.find(p => p.id === productId);
    if (!product) return;

    try {
      await productAPI.delete(product.title);
      setPublishedProducts(publishedProducts.filter(p => p.id !== productId));
      toast.success("Producto eliminado", {
        description: "El producto ha sido eliminado del sistema",
      });
      
      if (user) {
        const activity: Activity = {
          id: Date.now().toString(),
          type: "product",
          title: "Producto eliminado",
          description: `Eliminaste "${product.title}"`,
          date: new Date().toISOString(),
          productId: productId,
        };
        addActivity(user.id, activity);
      }
    } catch (error: any) {
      toast.error("Error al eliminar producto", {
        description: error.message || "No se pudo eliminar el producto",
      });
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setPublishedProducts(
      publishedProducts.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      )
    );
    
    if (user) {
      const activity: Activity = {
        id: Date.now().toString(),
        type: "product",
        title: "Producto actualizado",
        description: `Actualizaste "${updatedProduct.title}"`,
        date: new Date().toISOString(),
        productId: updatedProduct.id,
      };
      addActivity(user.id, activity);
    }
    
    toast.success("Producto actualizado", {
      description: "Los cambios se han guardado exitosamente",
    });
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
  };

  const handleViewUserProfile = (userId: string) => {
    setViewingUserId(userId);
    setCurrentPage("userProfile");
  };

  const handleContactUser = (userId: string) => {
    setChatUserId(userId);
    setIsChatOpen(true);
  };

  const handleProposeTrade = (productId: string, proposedProductId?: string) => {
    if (!user) return;
    
    const product = publishedProducts.find(p => p.id === productId);
    if (!product) return;
    
    const proposedProduct = proposedProductId ? publishedProducts.find(p => p.id === proposedProductId) : null;
    
    const newTrade: Trade = {
      id: Date.now().toString(),
      user1Id: user.id,
      user2Id: product.ownerUserId,
      product1Id: proposedProductId || "",
      product2Id: productId,
      status: "pending",
      createdAt: new Date().toISOString(),
      initiatorId: user.id,
      receiverId: product.ownerUserId,
    };
    
    setTrades([newTrade, ...trades]);
    
    const proposalMessage = proposedProduct 
      ? `Has propuesto intercambiar "${proposedProduct.title}" por "${product.title}"`
      : `Has mostrado interés en "${product.title}"`;
    
    toast.success("¡Propuesta enviada exitosamente!", {
      description: proposalMessage,
    });
    setSelectedProduct(null);
    
    // Add notification for product owner (actionable)
    const notificationDescription = proposedProduct
      ? `${user.name} quiere intercambiar "${proposedProduct.title}" por tu producto "${product.title}"`
      : `${user.name} está interesado en tu producto "${product.title}"`;
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "trade_request",
      title: "Nueva propuesta de intercambio",
      description: notificationDescription,
      time: "Ahora",
      read: false,
      productId: productId,
      userId: user.id,
      tradeId: newTrade.id,
      actionable: true,
    };
    setNotifications([newNotification, ...notifications]);
    
    // Add activity for sender
    const activityDescription = proposedProduct
      ? `Propusiste intercambiar "${proposedProduct.title}" por "${product.title}"`
      : `Mostraste interés en "${product.title}"`;
    
    const activity: Activity = {
      id: Date.now().toString(),
      type: "trade",
      title: "Propuesta enviada",
      description: activityDescription,
      date: new Date().toISOString(),
      productId: productId,
    };
    addActivity(user.id, activity);
  };

  const handleAcceptTrade = (tradeId: string) => {
    if (!user) return;
    
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    
    // Update trade status to accepted
    setTrades(trades.map(t => {
      if (t.id === tradeId) {
        return { ...t, status: "accepted" };
      }
      return t;
    }));
    
    // Get product info
    const product1 = publishedProducts.find(p => p.id === trade.product1Id);
    const product2 = publishedProducts.find(p => p.id === trade.product2Id);
    
    // Notify the initiator
    const acceptNotification: Notification = {
      id: Date.now().toString(),
      type: "trade_accepted",
      title: "Propuesta aceptada",
      description: product1 && product2 
        ? `${user.name} aceptó tu propuesta de intercambiar "${product1.title}" por "${product2.title}"`
        : "Tu propuesta de intercambio fue aceptada",
      time: "Ahora",
      read: false,
      tradeId: tradeId,
      userId: user.id,
      actionable: false,
    };
    setNotifications([acceptNotification, ...notifications]);
    
    // Mark the trade request notification as read
    setNotifications(notifications.map(n => 
      n.tradeId === tradeId && n.type === "trade_request" ? { ...n, read: true, actionable: false } : n
    ));
    
    toast.success("¡Propuesta aceptada!", {
      description: "El usuario ha sido notificado",
    });
    
    // Add activity
    const activity: Activity = {
      id: Date.now().toString(),
      type: "trade",
      title: "Propuesta aceptada",
      description: product1 && product2 
        ? `Aceptaste intercambiar "${product2.title}" por "${product1.title}"`
        : "Aceptaste una propuesta de intercambio",
      date: new Date().toISOString(),
    };
    addActivity(user.id, activity);
  };
  
  const handleRejectTrade = (tradeId: string) => {
    if (!user) return;
    
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    
    // Update trade status to rejected
    setTrades(trades.map(t => {
      if (t.id === tradeId) {
        return { ...t, status: "rejected" };
      }
      return t;
    }));
    
    // Get product info
    const product1 = publishedProducts.find(p => p.id === trade.product1Id);
    const product2 = publishedProducts.find(p => p.id === trade.product2Id);
    
    // Notify the initiator
    const rejectNotification: Notification = {
      id: Date.now().toString(),
      type: "trade_rejected",
      title: "Propuesta rechazada",
      description: product1 && product2 
        ? `${user.name} rechazó tu propuesta de intercambiar "${product1.title}" por "${product2.title}"`
        : "Tu propuesta de intercambio fue rechazada",
      time: "Ahora",
      read: false,
      tradeId: tradeId,
      userId: user.id,
      actionable: false,
    };
    setNotifications([rejectNotification, ...notifications]);
    
    // Mark the trade request notification as read
    setNotifications(notifications.map(n => 
      n.tradeId === tradeId && n.type === "trade_request" ? { ...n, read: true, actionable: false } : n
    ));
    
    toast.info("Propuesta rechazada", {
      description: "El usuario ha sido notificado",
    });
    
    // Add activity
    const activity: Activity = {
      id: Date.now().toString(),
      type: "trade",
      title: "Propuesta rechazada",
      description: product1 && product2 
        ? `Rechazaste intercambiar "${product2.title}" por "${product1.title}"`
        : "Rechazaste una propuesta de intercambio",
      date: new Date().toISOString(),
    };
    addActivity(user.id, activity);
  };
  
  const handleCancelTrade = (tradeId: string) => {
    if (!user) return;
    
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    
    // Update trade status to cancelled
    setTrades(trades.map(t => {
      if (t.id === tradeId) {
        return { ...t, status: "cancelled" };
      }
      return t;
    }));
    
    // Get product info
    const product1 = publishedProducts.find(p => p.id === trade.product1Id);
    const product2 = publishedProducts.find(p => p.id === trade.product2Id);
    
    // Notify the receiver
    const cancelNotification: Notification = {
      id: Date.now().toString(),
      type: "trade_cancelled",
      title: "Propuesta cancelada",
      description: product1 && product2 
        ? `${user.name} canceló su propuesta de intercambiar "${product1.title}" por "${product2.title}"`
        : "Una propuesta de intercambio fue cancelada",
      time: "Ahora",
      read: false,
      tradeId: tradeId,
      userId: user.id,
      actionable: false,
    };
    setNotifications([cancelNotification, ...notifications]);
    
    // Mark the trade request notification as read and non-actionable
    setNotifications(notifications.map(n => 
      n.tradeId === tradeId && n.type === "trade_request" ? { ...n, read: true, actionable: false } : n
    ));
    
    toast.info("Propuesta cancelada", {
      description: "La propuesta ha sido cancelada exitosamente",
    });
    
    // Add activity
    const activity: Activity = {
      id: Date.now().toString(),
      type: "trade",
      title: "Propuesta cancelada",
      description: product1 && product2 
        ? `Cancelaste tu propuesta de intercambiar "${product1.title}" por "${product2.title}"`
        : "Cancelaste una propuesta de intercambio",
      date: new Date().toISOString(),
    };
    addActivity(user.id, activity);
  };
  
  const handleConfirmTrade = (tradeId: string) => {
    if (!user) return;
    
    const trade = trades.find(t => t.id === tradeId);
    if (!trade || trade.status !== "accepted") return;
    
    // Mark trade as completed
    setTrades(trades.map(t => {
      if (t.id === tradeId) {
        return { ...t, status: "completed" };
      }
      return t;
    }));
    
    // Get product info
    const product1 = publishedProducts.find(p => p.id === trade.product1Id);
    const product2 = publishedProducts.find(p => p.id === trade.product2Id);
    
    // Add notifications for both users
    const completedNotification: Notification = {
      id: Date.now().toString(),
      type: "achievement",
      title: "Intercambio completado",
      description: product1 && product2 
        ? `Intercambio completado: "${product1.title}" por "${product2.title}"`
        : "¡Has completado un intercambio exitosamente!",
      time: "Ahora",
      read: false,
      tradeId: tradeId,
    };
    setNotifications([completedNotification, ...notifications]);
    
    // Add activity
    const activity: Activity = {
      id: Date.now().toString(),
      type: "trade",
      title: "Intercambio completado",
      description: `Completaste un intercambio exitosamente`,
      date: new Date().toISOString(),
    };
    addActivity(user.id, activity);
    
    toast.success("¡Intercambio completado!", {
      description: "¡Felicidades por tu intercambio exitoso!",
    });
  };

  const handlePublishProduct = async (product: Omit<Product, "id"> | Product, imageFiles?: File[]) => {
    if (!user) {
      toast.error("Error", {
        description: "Debes iniciar sesión para publicar productos",
      });
      return;
    }

    try {
      // Si el producto tiene id, es una edición
      if ('id' in product && product.id) {
        // Actualizar producto existente
        await productAPI.update({
          nombre: product.title,
          categoria: product.category,
          condicionesTrueque: product.interestedIn?.join(", ") || "Cualquier cosa",
          comentarioNLP: product.description,
          ubicacion: product.location.replace(", Colombia", ""),
        });
        
        handleUpdateProduct(product as Product);
        setIsPublishModalOpen(false);
        setEditingProduct(null);
        toast.success("Producto actualizado", {
          description: "Los cambios se han guardado exitosamente",
        });
        return;
      }
      
      // Crear nuevo producto
      if (!imageFiles || imageFiles.length === 0) {
        toast.error("Error", {
          description: "Debes subir al menos una imagen",
        });
        return;
      }

      const response = await productAPI.create({
        nombre: product.title,
        categoria: product.category,
        condicionesTrueque: product.interestedIn?.join(", ") || "Cualquier cosa",
        comentarioNLP: product.description,
        ubicacion: product.location.replace(", Colombia", ""),
        imagenes: imageFiles,
      });
      
      console.log("Producto creado:", response);

      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        ownerUserId: user.id,
        ownerName: user.name,
        createdAt: new Date().toISOString(),
      };
      
      setPublishedProducts([newProduct, ...publishedProducts]);
      setIsPublishModalOpen(false);
      setEditingProduct(null);
      
      if (product.status === "published") {
        toast.success("¡Producto publicado!", {
          description: "Tu producto ya está visible en el marketplace",
        });
      } else if (product.status === "draft") {
        toast.success("Borrador guardado", {
          description: "Tu producto se ha guardado como borrador",
        });
      }
      
      // Add notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "product",
        title: product.status === "published" ? "Producto publicado exitosamente" : "Borrador guardado",
        description: `${product.title} ${product.status === "published" ? "ya está disponible para intercambio" : "se guardó como borrador"}`,
        time: "Ahora",
        read: false,
        productId: newProduct.id,
      };
      setNotifications([newNotification, ...notifications]);
      
      // Add activity
      const activity: Activity = {
        id: Date.now().toString(),
        type: "product",
        title: product.status === "published" ? "Nuevo producto publicado" : "Borrador guardado",
        description: `${product.status === "published" ? "Publicaste" : "Guardaste"} "${product.title}"`,
        date: new Date().toISOString(),
        productId: newProduct.id,
      };
      addActivity(user.id, activity);
    } catch (error: any) {
      console.error("Error al guardar producto:", error);
      toast.error("Error al guardar producto", {
        description: error.message || "No se pudo guardar el producto. Verifica que el backend esté corriendo en http://localhost:3000",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsPublishModalOpen(true);
  };

  const handleToggleFavorite = (productId: string) => {
    if (!user) return;
    
    const isFavorited = user.favorites.includes(productId);
    const updatedFavorites = isFavorited
      ? user.favorites.filter(id => id !== productId)
      : [...user.favorites, productId];
    
    const updatedUser = { ...user, favorites: updatedFavorites };
    setUser(updatedUser);
    setAllUsers(users => users.map(u => u.id === user.id ? updatedUser : u));
    
    toast.success(isFavorited ? "Eliminado de favoritos" : "Añadido a favoritos", {
      description: isFavorited ? "El producto se ha eliminado de tus favoritos" : "El producto se ha añadido a tus favoritos",
    });
  };

  const handleDeactivateAccount = () => {
    if (!user) return;
    
    const updatedUser = { ...user, isActive: false };
    setAllUsers(users => users.map(u => u.id === user.id ? updatedUser : u));
    handleLogout();
    
    toast.success("Cuenta desactivada", {
      description: "Tu cuenta ha sido desactivada exitosamente",
    });
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkNotificationAsRead(notification.id);
    
    if (notification.productId) {
      const product = publishedProducts.find(p => p.id === notification.productId);
      if (product) {
        handleViewProduct(product);
      }
    } else if (notification.userId) {
      handleContactUser(notification.userId);
    } else if (notification.messageId) {
      setIsChatOpen(true);
    }
    
    setIsNotificationPanelOpen(false);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const unreadMessageCount = 3; // Mock count

  // Get viewing user for profile
  const viewingUser = viewingUserId ? allUsers.find(u => u.id === viewingUserId) : null;

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (authLoading) {
    return (
      <ThemeColorProvider themeColor={themeColor}>
        <div className="size-full min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando sesión...</p>
          </div>
        </div>
      </ThemeColorProvider>
    );
  }

  return (
    <ThemeColorProvider themeColor={themeColor}>
      <div className="size-full min-h-screen bg-background">
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          onOpenNotifications={() => setIsNotificationPanelOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          notificationCount={unreadNotificationCount}
          messageCount={unreadMessageCount}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          themeColor={themeColor}
          onColorChange={handleColorChange}
        />

        {currentPage === "home" && <Hero onNavigate={handleNavigate} />}
        {showEmailVerification ? (
          <EmailVerification
            email={verificationEmail}
            onVerify={handleVerifyEmail}
            onCancel={() => {
              setShowEmailVerification(false);
              setVerificationEmail("");
              setVerificationPassword("");
              setCurrentPage("login");
            }}
            onResendCode={handleResendVerificationCode}
          />
        ) : (
          <>
            {currentPage === "login" && (
              <Login onLogin={handleLogin} onNavigate={handleNavigate} />
            )}
            {currentPage === "register" && (
              <Register onRegister={handleRegister} onNavigate={handleNavigate} />
            )}
            {currentPage === "forgot-password" && (
              <ForgotPassword
                onRequestReset={handleForgotPassword}
                onBack={() => setCurrentPage("login")}
              />
            )}
            {currentPage === "reset-password" && resetPasswordToken && (
              <ResetPassword
                token={resetPasswordToken}
                onReset={handleResetPassword}
                onBack={() => {
                  setResetPasswordToken(null);
                  setCurrentPage("login");
                }}
              />
            )}
          </>
        )}
        {currentPage === "marketplace" && (
          <Marketplace 
            onViewProduct={handleViewProduct}
            onPublishProduct={() => setIsPublishModalOpen(true)}
            publishedProducts={publishedProducts}
            currentUserId={user?.id}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            themeColor={themeColor}
            onColorChange={handleColorChange}
          />
        )}
        {currentPage === "profile" && user && (
          <Profile 
            user={user} 
            onViewProduct={handleViewProduct}
            onPublishProduct={() => setIsPublishModalOpen(true)}
            publishedProducts={publishedProducts}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onEditProduct={handleEditProduct}
            onDeactivateAccount={handleDeactivateAccount}
            allProducts={publishedProducts}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            themeColor={themeColor}
            onColorChange={handleColorChange}
          />
        )}
        {currentPage === "dashboard" && user && (
          <Dashboard
            user={user}
            onViewProduct={handleViewProduct}
            themeColor={themeColor}
          />
        )}
        {currentPage === "userProfile" && viewingUser && (
          <Profile 
            user={viewingUser} 
            onViewProduct={handleViewProduct}
            onPublishProduct={() => setIsPublishModalOpen(true)}
            publishedProducts={publishedProducts}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onEditProduct={handleEditProduct}
            isViewingOther={true}
            onNavigateBack={() => setCurrentPage("marketplace")}
          />
        )}
        {currentPage === "admin" && user && user.role === "admin" && (
          <AdminDashboard
            publishedProducts={publishedProducts}
            onDeleteProduct={handleDeleteProduct}
            allUsers={allUsers}
            trades={trades}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            themeColor={themeColor}
            onColorChange={handleColorChange}
          />
        )}
        {currentPage === "semanticSearch" && (
          <SemanticSearch
            publishedProducts={publishedProducts}
            onViewProduct={handleViewProduct}
            currentUserId={user?.id}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {currentPage === "recommendations" && (
          <Recommendations
            publishedProducts={publishedProducts}
            onViewProduct={handleViewProduct}
            currentUserId={user?.id}
            currentUser={user}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {selectedProduct && user && (
          <ProductDetail
            product={selectedProduct}
            onClose={handleCloseProductDetail}
            onProposeTrade={handleProposeTrade}
            onViewProfile={handleViewUserProfile}
            onContactUser={handleContactUser}
            onEditProduct={handleEditProduct}
            currentUserId={user.id}
            isFavorited={user.favorites.includes(selectedProduct.id)}
            onToggleFavorite={handleToggleFavorite}
            onUpdateProduct={handleUpdateProduct}
            userProducts={publishedProducts.filter(p => p.ownerUserId === user.id && p.status === "published" && p.available)}
            onPublishProduct={() => {
              setSelectedProduct(null);
              setIsPublishModalOpen(true);
            }}
          />
        )}

        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onNotificationClick={handleNotificationClick}
          onAcceptTrade={handleAcceptTrade}
          onRejectTrade={handleRejectTrade}
          onCancelTrade={handleCancelTrade}
          currentUserId={user?.id || ""}
          trades={trades}
          products={publishedProducts}
        />

        <Chat
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatUserId(null);
          }}
          currentUser={user}
          targetUserId={chatUserId}
        />

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

        <Toaster />
      </div>
    </ThemeColorProvider>
  );
}
