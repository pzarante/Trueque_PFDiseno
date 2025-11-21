import { motion, AnimatePresence } from "motion/react";
import { X, Send, Search, User, MoreVertical, Smile } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState, useEffect, useRef } from "react";
import { Badge } from "./ui/badge";
import { useThemeColor, getGradientClasses, getAccentBgClasses, getAccentBorderClasses } from "../hooks/useThemeColor";
import { userAPI } from "../services/api";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  userName: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  tradeId?: string | null;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  targetUserId?: string | null;
}


export function Chat({ isOpen, onClose, currentUser, targetUserId }: ChatProps) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const accentBgClasses = getAccentBgClasses(themeColor);
  const accentBorderClasses = getAccentBorderClasses(themeColor);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    if (isOpen && currentUser?.id) {
      if (!socketRef.current) {
        socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');
        
        socketRef.current.on('connect', () => {
          console.log('Socket conectado');
          if (currentUser?.id) {
            socketRef.current?.emit('user:connect', currentUser.id);
          }
        });

        socketRef.current.on('message:receive', async (data: any) => {
          const senderId = data.senderId || data.id_remitente;
          
          if (!senderId) return;
          
          const newMessage: Message = {
            id: data.id || data._id || Date.now().toString(),
            senderId: senderId,
            senderName: conversations.find(c => c.id === senderId)?.userName || "Usuario",
            text: data.message || data.mensaje || data.text || "",
            time: new Date(data.timestamp || data.fecha_envio || new Date()).toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isOwn: false,
          };
          
          if (selectedConversation === senderId) {
            setMessages(prev => {
              const exists = prev.find(m => m.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
          await loadConversations();
          
          if (selectedConversation === senderId) {
            await loadMessages(senderId);
          }
        });

        socketRef.current.on('message:sent', async (data: any) => {
          const receiverId = data.receiverId || data.destinatario || selectedConversation;
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          if (selectedConversation === receiverId) {
            await loadMessages(receiverId);
          }
          
          await loadConversations();
        });

        socketRef.current.on('message:error', (error: any) => {
          toast.error("Error al enviar mensaje", {
            description: error.error || "No se pudo enviar el mensaje",
          });
        });
      }
      
      loadConversations();
    }

    return () => {
      if (!isOpen && socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, currentUser?.id]);
  
  useEffect(() => {
    const handleChatOpened = () => {
      if (isOpen) {
        setTimeout(() => {
          loadConversations();
        }, 500);
      }
    };
    
    window.addEventListener('chat-opened', handleChatOpened);
    return () => {
      window.removeEventListener('chat-opened', handleChatOpened);
    };
  }, [isOpen]);
  
  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getConversations();
      const conversationsData = (response as any).data || [];
      
      const transformedConversations: Conversation[] = conversationsData.map((conv: any) => {
        const date = conv.time ? new Date(conv.time) : new Date();
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeStr = "Ahora";
        if (diffMins > 0 && diffMins < 60) {
          timeStr = `Hace ${diffMins} min`;
        } else if (diffHours > 0 && diffHours < 24) {
          timeStr = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays > 0) {
          timeStr = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        }
        
        return {
          id: conv.id || conv.userId,
          userName: conv.userName || "Usuario",
          lastMessage: conv.lastMessage || "Iniciar conversación sobre el trueque",
          time: timeStr,
          unread: conv.unread || 0,
          online: conv.online || false,
        };
      });
      
      setConversations(transformedConversations);
      
      if (targetUserId) {
        const targetConv = transformedConversations.find(c => c.id === targetUserId);
        if (targetConv) {
          setSelectedConversation(targetConv.id);
          loadMessages(targetConv.id);
        } else {
          try {
            const userResponse = await userAPI.getProfileById(targetUserId);
            const userData = (userResponse as any).data || userResponse;
            const userName = userData.name || userData.userName || "Usuario";
            
            const newConversation = {
              id: targetUserId,
              userName: userName,
              lastMessage: "Iniciar conversación",
              time: "Ahora",
              unread: 0,
              online: false
            };
            setConversations(prev => [newConversation, ...prev]);
            setSelectedConversation(targetUserId);
            loadMessages(targetUserId);
          } catch (error) {
            console.error("Error al cargar usuario:", error);
            const newConversation = {
              id: targetUserId,
              userName: "Usuario",
              lastMessage: "Iniciar conversación",
              time: "Ahora",
              unread: 0,
              online: false
            };
            setConversations(prev => [newConversation, ...prev]);
            setSelectedConversation(targetUserId);
            loadMessages(targetUserId);
          }
        }
      } else if (transformedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(transformedConversations[0].id);
        loadMessages(transformedConversations[0].id);
      }
    } catch (error: any) {
      console.error("Error al cargar conversaciones:", error);
      if (error.response?.status !== 500 && !error.message?.includes("mensajes")) {
        toast.error("Error al cargar conversaciones", {
          description: error.message || "No se pudieron cargar las conversaciones",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const loadMessages = async (conversationId: string): Promise<Message[] | null> => {
    if (!currentUser?.id) return null;
    
    const conversation = conversations.find(c => c.id === conversationId);
    
    try {
      const response = await userAPI.getMessages(conversationId);
      const messagesData = (response as any).data || [];
      
      const transformedMessages: Message[] = messagesData.map((msg: any) => {
        const isOwn = msg.id_remitente === currentUser.id || msg.senderId === currentUser.id;
        const date = new Date(msg.fecha_envio || msg.fechaEnvio || msg.timestamp || new Date());
        
        return {
          id: msg._id || msg.id || Date.now().toString(),
          senderId: msg.id_remitente || msg.senderId,
          senderName: isOwn ? "Tú" : (msg.senderName || conversation?.userName || "Usuario"),
          text: msg.mensaje || msg.message || msg.text || "",
          time: date.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: isOwn,
        };
      });
      
      const tempMessages = messages.filter(m => m.id.startsWith('temp_'));
      
      const uniqueMessages = new Map();
      
      tempMessages.forEach(msg => uniqueMessages.set(msg.id, msg));
      
      transformedMessages.forEach(msg => {
        const key = `${msg.text}_${msg.isOwn}_${msg.senderId}`;
        if (!Array.from(uniqueMessages.values()).some(m => `${m.text}_${m.isOwn}_${m.senderId}` === key)) {
          uniqueMessages.set(msg.id, msg);
        }
      });
      
      const finalMessages = Array.from(uniqueMessages.values()).sort((a, b) => {
        const timeA = a.time ? new Date(a.time).getTime() : 0;
        const timeB = b.time ? new Date(b.time).getTime() : 0;
        if (timeA === 0 || timeB === 0) {
          if (a.id.startsWith('temp_')) return -1;
          if (b.id.startsWith('temp_')) return 1;
        }
        return timeA - timeB;
      });
      
      setMessages(finalMessages);
      
      return transformedMessages;
    } catch (error: any) {
      console.error("Error al cargar mensajes:", error);
      return null;
    }
  };
  
  useEffect(() => {
    if (targetUserId) {
      const targetConv = conversations.find(c => c.id === targetUserId);
      if (targetConv) {
        if (selectedConversation !== targetUserId) {
          setSelectedConversation(targetUserId);
          loadMessages(targetUserId);
        }
      } else {
        setSelectedConversation(targetUserId);
        setMessages([]);
      }
    }
  }, [targetUserId, conversations]);
  
  useEffect(() => {
    if (selectedConversation && currentUser?.id) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !currentUser?.id) return;
    
    const conversation = conversations.find(c => c.id === selectedConversation);
    const messageContent = messageText.trim();
    const tempId = `temp_${Date.now()}`;
    
    const tempMessage: Message = {
      id: tempId,
      senderId: currentUser.id,
      senderName: "Tú",
      text: messageContent,
      time: new Date().toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setMessageText("");
    
    try {
      await userAPI.sendMessage({
        receiverId: selectedConversation,
        message: messageContent,
        tradeId: conversation?.tradeId || undefined,
      });
      
      if (socketRef.current) {
        socketRef.current.emit('message:send', {
          senderId: currentUser.id,
          receiverId: selectedConversation,
          message: messageContent,
          tradeId: conversation?.tradeId || null,
        });
      }
      
      console.log("Mensaje enviado, esperando guardado en DB...");
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Recargando mensajes desde DB...");
      await loadMessages(selectedConversation);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadConversations();
      
      console.log("Mensaje guardado y recargado");
    } catch (error: any) {
      console.error("Error al enviar mensaje:", error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "No se pudo enviar el mensaje";
      toast.error("Error al enviar mensaje", {
        description: errorMessage,
      });
    }
  };

  const selectedConv = conversations.find(
    (c) => c.id === selectedConversation
  );

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleConversationClick = (convId: string) => {
    setSelectedConversation(convId);
    loadMessages(convId);
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

          {/* Chat Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-background shadow-2xl z-50 flex"
          >
            {/* Conversations List */}
            <div className="w-80 border-r border-border flex flex-col">
              {/* Header */}
              <div className={`p-4 border-b border-border bg-gradient-to-br ${gradientClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-white">Mensajes</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              </div>

              {/* Conversations */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center p-4 text-white/60">
                      <p>No hay conversaciones</p>
                      <p className="text-sm mt-2">Inicia un trueque para ver conversaciones aquí</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleConversationClick(conv.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all mb-2 ${
                        selectedConversation === conv.id
                          ? `${accentBgClasses} border ${accentBorderClasses}`
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback className={`bg-gradient-to-br ${gradientClasses} text-white`}>
                              {conv.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conv.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium line-clamp-1">
                              {conv.userName}
                            </p>
                            {conv.unread > 0 && (
                              <Badge className={`bg-gradient-to-r ${gradientClasses} text-white h-5 px-2 border-0`}>
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conv.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback className={`bg-gradient-to-br ${gradientClasses} text-white`}>
                            {selectedConv.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConv.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{selectedConv.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedConv.online ? "En línea" : "Desconectado"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <p>No hay mensajes aún</p>
                          <p className="text-sm mt-2">Inicia la conversación</p>
                        </div>
                      )}
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${
                            message.isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              message.isOwn ? "order-2" : "order-1"
                            }`}
                          >
                            <div
                              className={`rounded-2xl p-3 ${
                                message.isOwn
                                  ? `bg-gradient-to-br ${gradientClasses} text-white`
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 px-3">
                              {message.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <Smile className="w-5 h-5" />
                      </Button>
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className={`bg-gradient-to-r ${gradientClasses} hover:opacity-90 shrink-0`}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Selecciona una conversación
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
