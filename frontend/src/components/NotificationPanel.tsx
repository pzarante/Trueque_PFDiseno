import { motion, AnimatePresence } from "motion/react";
import { X, Bell, Package, MessageSquare, Award, CheckCircle, Check, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useThemeColor, getGradientClasses } from "../hooks/useThemeColor";
import { Trade } from "../App";
import { Product } from "./ProductCard";

interface Notification {
  id: string;
  type: "message" | "trade" | "achievement" | "system" | "product" | "trade_request" | "trade_accepted" | "trade_rejected" | "trade_cancelled";
  title: string;
  description: string;
  time: string;
  read: boolean;
  tradeId?: string;
  actionable?: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onAcceptTrade?: (tradeId: string) => void;
  onRejectTrade?: (tradeId: string) => void;
  onCancelTrade?: (tradeId: string) => void;
  currentUserId?: string;
  trades?: Trade[];
  products?: Product[];
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  onAcceptTrade,
  onRejectTrade,
  onCancelTrade,
  currentUserId,
  trades = [],
  products = [],
}: NotificationPanelProps) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-5 h-5" />;
      case "trade":
        return <Package className="w-5 h-5" />;
      case "product":
        return <Package className="w-5 h-5" />;
      case "achievement":
        return <Award className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case "message":
        return "from-blue-600 to-cyan-600";
      case "trade":
        return "from-purple-600 to-pink-600";
      case "product":
        return "from-green-600 to-emerald-600";
      case "achievement":
        return "from-yellow-600 to-orange-600";
      default:
        return "from-blue-600 to-cyan-600";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className={`p-6 border-b border-border bg-gradient-to-br ${gradientClasses}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl text-white">Notificaciones</h2>
                    <p className="text-xs text-white/80">
                      {unreadCount > 0
                        ? `${unreadCount} sin leer`
                        : "Todo al día"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-white hover:bg-white/20 text-xs"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No tienes notificaciones</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => {
                    const trade = notification.tradeId ? trades.find(t => t.id === notification.tradeId) : null;
                    const isReceiver = trade && trade.receiverId === currentUserId;
                    const isInitiator = trade && trade.initiatorId === currentUserId;
                    const canAcceptReject = notification.actionable && isReceiver && trade?.status === "pending";
                    const canCancel = notification.type === "trade_request" && isInitiator && trade?.status === "pending";
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={(e) => {
                          // Don't trigger click if clicking on action buttons
                          if ((e.target as HTMLElement).closest('button')) return;
                          
                          if (onNotificationClick && !notification.actionable) {
                            onNotificationClick(notification);
                          } else {
                            onMarkAsRead(notification.id);
                          }
                        }}
                        className={`p-4 rounded-xl border ${!notification.actionable ? 'cursor-pointer' : ''} transition-all hover:shadow-lg ${
                          notification.read
                            ? "bg-card border-border"
                            : "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${getGradient(
                              notification.type
                            )} rounded-xl flex items-center justify-center shrink-0 shadow-lg`}
                          >
                            <div className="text-white">
                              {getIcon(notification.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-medium line-clamp-1">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              {notification.time}
                            </p>
                            
                            {/* Action buttons for trade requests */}
                            {canAcceptReject && onAcceptTrade && onRejectTrade && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAcceptTrade(notification.tradeId!);
                                  }}
                                  className={`flex-1 bg-gradient-to-r ${gradientClasses} text-white hover:opacity-90`}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aceptar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRejectTrade(notification.tradeId!);
                                  }}
                                  className="flex-1"
                                >
                                  <XIcon className="w-4 h-4 mr-1" />
                                  Rechazar
                                </Button>
                              </div>
                            )}
                            
                            {/* Cancel button for initiator */}
                            {canCancel && onCancelTrade && (
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCancelTrade(notification.tradeId!);
                                  }}
                                  className="w-full"
                                >
                                  <XIcon className="w-4 h-4 mr-1" />
                                  Anular Propuesta
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
