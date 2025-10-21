import { motion, AnimatePresence } from "motion/react";
import { X, Send, Search, User, MoreVertical, Smile } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { useThemeColor, getGradientClasses, getAccentBgClasses, getAccentBorderClasses } from "../hooks/useThemeColor";

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
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    userName: "María López",
    lastMessage: "Perfecto, quedamos mañana entonces",
    time: "Hace 5 min",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    userName: "Carlos Ruiz",
    lastMessage: "¿La guitarra todavía está disponible?",
    time: "Hace 1 hora",
    unread: 0,
    online: false,
  },
  {
    id: "3",
    userName: "Ana García",
    lastMessage: "Gracias por el intercambio!",
    time: "Hace 2 horas",
    unread: 1,
    online: true,
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    senderId: "2",
    senderName: "María López",
    text: "Hola! Me interesa tu bicicleta",
    time: "10:30 AM",
    isOwn: false,
  },
  {
    id: "2",
    senderId: "1",
    senderName: "Tú",
    text: "Hola! Claro, está disponible. ¿Qué tienes para intercambiar?",
    time: "10:32 AM",
    isOwn: true,
  },
  {
    id: "3",
    senderId: "2",
    senderName: "María López",
    text: "Tengo una guitarra acústica en muy buen estado",
    time: "10:35 AM",
    isOwn: false,
  },
  {
    id: "4",
    senderId: "1",
    senderName: "Tú",
    text: "Me parece interesante! ¿Podemos vernos mañana?",
    time: "10:38 AM",
    isOwn: true,
  },
  {
    id: "5",
    senderId: "2",
    senderName: "María López",
    text: "Perfecto, quedamos mañana entonces",
    time: "10:40 AM",
    isOwn: false,
  },
];

export function Chat({ isOpen, onClose, currentUser }: ChatProps) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const accentBgClasses = getAccentBgClasses(themeColor);
  const accentBorderClasses = getAccentBorderClasses(themeColor);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    MOCK_CONVERSATIONS[0].id
  );
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: currentUser?.id || "1",
        senderName: "Tú",
        text: messageText,
        time: new Date().toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
    }
  };

  const selectedConv = MOCK_CONVERSATIONS.find(
    (c) => c.id === selectedConversation
  );

  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  {filteredConversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedConversation(conv.id)}
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
                  ))}
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
