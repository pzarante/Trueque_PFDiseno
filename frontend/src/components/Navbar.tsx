import { motion } from "motion/react";
import { ArrowRightLeft, User, LogOut, Menu, X, Bell, MessageSquare, Moon, Sun, Shield, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ThemeColorPicker, ThemeColor } from "./ThemeColorPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useEffect } from "react";
import { getGradientClasses, getShadowClasses, getBgClasses } from "../hooks/useThemeColor";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenChat: () => void;
  notificationCount: number;
  messageCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  themeColor: ThemeColor;
  onColorChange: (color: ThemeColor) => void;
}

export function Navbar({ 
  currentPage, 
  onNavigate, 
  user, 
  onLogout,
  onOpenNotifications,
  onOpenChat,
  notificationCount,
  messageCount,
  isDarkMode,
  onToggleTheme,
  themeColor,
  onColorChange
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const bgClasses = getBgClasses(themeColor);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className={`bg-gradient-to-br ${gradientClasses} p-2 rounded-xl shadow-lg ${shadowClasses}`}>
              <ArrowRightLeft className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r ${gradientClasses} bg-clip-text text-transparent`}>
              Swaply
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {user.role === "admin" ? (
                  // Admin solo ve Panel de Control
                  <>
                    <NavLink
                      active={currentPage === "admin"}
                      onClick={() => onNavigate("admin")}
                    >
                      <Shield className="w-4 h-4 mr-1 inline" />
                      Panel de Control
                    </NavLink>
                    <div className="flex items-center gap-2 ml-auto">
                      <ThemeColorPicker
                        currentColor={themeColor}
                        onColorChange={onColorChange}
                      />
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                      </motion.div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onLogout}
                        className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px]"
                        aria-label="Cerrar sesión"
                      >
                        <LogOut className="w-5 h-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  // Usuarios normales ven todo el menú
                  <>
                    <NavLink
                      active={currentPage === "marketplace"}
                      onClick={() => onNavigate("marketplace")}
                    >
                      Marketplace
                    </NavLink>
                    <NavLink
                      active={currentPage === "semanticSearch"}
                      onClick={() => onNavigate("semanticSearch")}
                    >
                      Búsqueda IA
                    </NavLink>
                    <NavLink
                      active={currentPage === "recommendations"}
                      onClick={() => onNavigate("recommendations")}
                    >
                      Para Ti
                    </NavLink>
                    <div className="flex items-center gap-2 ml-4">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onOpenNotifications}
                          className="relative min-w-[44px] min-h-[44px]"
                          aria-label={`Notificaciones${notificationCount > 0 ? ` (${notificationCount} sin leer)` : ''}`}
                        >
                          <Bell className="w-5 h-5" />
                          {notificationCount > 0 && (
                            <Badge className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 ${bgClasses} text-white text-xs`} aria-hidden="true">
                              {notificationCount}
                            </Badge>
                          )}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onOpenChat}
                          className="relative min-w-[44px] min-h-[44px]"
                          aria-label={`Mensajes${messageCount > 0 ? ` (${messageCount} sin leer)` : ''}`}
                        >
                          <MessageSquare className="w-5 h-5" />
                          {messageCount > 0 && (
                            <Badge className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 ${bgClasses} text-white text-xs`} aria-hidden="true">
                              {messageCount}
                            </Badge>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThemeColorPicker
                        currentColor={themeColor}
                        onColorChange={onColorChange}
                      />
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                      </motion.div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center outline-none"
                            aria-label="Menú de usuario"
                          >
                            <Avatar>
                              <AvatarFallback className={`bg-gradient-to-br ${gradientClasses} text-white`}>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onNavigate("dashboard")}>
                            <Package className="w-4 h-4 mr-2" />
                            Mi Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onNavigate("profile")}>
                            <User className="w-4 h-4 mr-2" />
                            Mi Perfil
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={onLogout} className="text-red-600">
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <NavLink
                  active={currentPage === "home"}
                  onClick={() => onNavigate("home")}
                >
                  Inicio
                </NavLink>
                <ThemeColorPicker
                  currentColor={themeColor}
                  onColorChange={onColorChange}
                />
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                </motion.div>
                <Button 
                  onClick={() => onNavigate("login")} 
                  variant="ghost"
                  className="min-h-[44px]"
                  aria-label="Iniciar sesión"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => onNavigate("register")}
                  className={`bg-gradient-to-r ${gradientClasses} hover:from-${themeColor}-700 hover:to-${themeColor === 'blue' ? 'cyan' : themeColor === 'purple' ? 'pink' : themeColor === 'red' ? 'rose' : themeColor === 'orange' ? 'amber' : 'emerald'}-700 shadow-lg ${shadowClasses} min-h-[44px]`}
                  aria-label="Registrarse en Swaply"
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            {user ? (
              <div className="flex flex-col gap-4">
                {user.role === "admin" ? (
                  <>
                    <Button
                      variant={currentPage === "admin" ? "secondary" : "ghost"}
                      onClick={() => {
                        onNavigate("admin");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Panel de Control
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onToggleTheme}
                      className="justify-start"
                    >
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 mr-2" />
                      ) : (
                        <Moon className="w-4 h-4 mr-2" />
                      )}
                      {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start text-muted-foreground"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant={currentPage === "marketplace" ? "secondary" : "ghost"}
                      onClick={() => {
                        onNavigate("marketplace");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Marketplace
                    </Button>
                    <Button
                      variant={currentPage === "semanticSearch" ? "secondary" : "ghost"}
                      onClick={() => {
                        onNavigate("semanticSearch");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Búsqueda IA
                    </Button>
                    <Button
                      variant={currentPage === "recommendations" ? "secondary" : "ghost"}
                      onClick={() => {
                        onNavigate("recommendations");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Para Ti
                    </Button>
                    <div className="border-t border-border my-2" />
                    <Button
                      variant={currentPage === "dashboard" ? "secondary" : "ghost"}
                      onClick={() => {
                        onNavigate("dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Mi Dashboard
                    </Button>
                    <Button
                      variant={currentPage === "profile" ? "secondary" : "ghost"}
                      onClick={() => {
                        onNavigate("profile");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onToggleTheme}
                      className="justify-start"
                    >
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 mr-2" />
                      ) : (
                        <Moon className="w-4 h-4 mr-2" />
                      )}
                      {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start text-muted-foreground"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onNavigate("login");
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => {
                    onNavigate("register");
                    setMobileMenuOpen(false);
                  }}
                  className={`bg-gradient-to-r ${gradientClasses}`}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

function NavLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`relative ${
        active ? "text-foreground" : "text-muted-foreground"
      } hover:text-foreground transition-colors`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
        />
      )}
    </motion.button>
  );
}
