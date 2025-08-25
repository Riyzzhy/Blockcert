import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  User, 
  Send, 
  Minimize2, 
  Maximize2, 
  X,
  Upload,
  Search,
  LayoutDashboard,
  Shield,
  Briefcase,
  GraduationCap,
  Lock,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { ChatBotService } from './ChatBotService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: 'navigate' | 'message' | 'external';
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ChatBotWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBotWindow: React.FC<ChatBotWindowProps> = ({ isOpen, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const chatService = ChatBotService.getInstance();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message when chatbot opens for the first time
      setTimeout(() => {
        addBotMessage(
          "👋 Welcome to BlockCert! I'm your AI assistant for:\n\n🔒 **Advanced Security** - Time-window codes & blockchain protection\n💼 **Career Applications** - Internship/Job certificate management\n📤 **Smart Uploads** - AI-powered document verification\n🔍 **Instant Verification** - Real-time authenticity checking\n\nHow can I help you today?",
          getWelcomeQuickActions()
        );
      }, 500);
    }
  }, [isOpen]);

  const getWelcomeQuickActions = (): QuickAction[] => [
    { label: 'Upload Certificate', action: 'navigate', value: '/upload', icon: Upload },
    { label: 'Verify Document', action: 'navigate', value: '/verify', icon: Search },
    { label: 'View Dashboard', action: 'navigate', value: '/dashboard', icon: LayoutDashboard },
    { label: 'Security Features', action: 'message', value: 'What are forward & backward security codes?', icon: Lock },
    { label: 'How it Works', action: 'message', value: 'How does BlockCert work?', icon: HelpCircle }
  ];

  const addBotMessage = (content: string, quickActions?: QuickAction[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'bot',
      timestamp: new Date(),
      quickActions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(userMessage);
      setIsTyping(false);
      addBotMessage(response.content, response.quickActions);
    } catch (error) {
      setIsTyping(false);
      addBotMessage("I'm sorry, I encountered an error. Please try again or contact support if the problem persists.");
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    switch (action.action) {
      case 'navigate':
        navigate(action.value);
        onClose();
        break;
      case 'message':
        addUserMessage(action.label);
        setIsTyping(true);
        setTimeout(async () => {
          try {
            const response = await chatService.sendMessage(action.value);
            setIsTyping(false);
            addBotMessage(response.content, response.quickActions);
          } catch (error) {
            setIsTyping(false);
            addBotMessage("I'm sorry, I encountered an error. Please try again.");
          }
        }, 800);
        break;
      case 'external':
        if (action.value.startsWith('#')) {
          const element = document.querySelector(action.value);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            onClose();
          }
        } else {
          window.open(action.value, '_blank');
        }
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const chatVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed bottom-24 right-6 z-40"
      variants={chatVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className={`w-96 shadow-2xl border-0 overflow-hidden glass-effect ${
        isMinimized ? 'h-16' : 'h-[500px]'
      } transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-glow p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">BlockCert Assistant</h3>
                <p className="text-xs opacity-90">
                  {isTyping ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-primary-foreground hover:bg-white/20 w-8 h-8 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-primary-foreground hover:bg-white/20 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-[436px]"
            >
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      } rounded-lg p-3 shadow-sm`}>
                        <div className="flex items-start gap-2">
                          {message.sender === 'bot' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            
                            {/* Quick Actions */}
                            {message.quickActions && message.quickActions.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="grid grid-cols-1 gap-2">
                                  {message.quickActions.map((action, index) => (
                                    <motion.button
                                      key={index}
                                      onClick={() => handleQuickAction(action)}
                                      className="flex items-center gap-2 p-2 rounded-md bg-background/50 hover:bg-background/80 text-foreground text-xs transition-colors duration-200 border border-border/50"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      {action.icon && <action.icon className="w-3 h-3" />}
                                      {action.label}
                                      {action.action === 'external' && <ExternalLink className="w-3 h-3 ml-auto" />}
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {message.sender === 'user' && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start"
                      >
                        <div className="bg-muted text-muted-foreground rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4" />
                            <div className="flex gap-1">
                              <motion.div
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about BlockCert..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quick Navigation Buttons */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction({ label: 'Upload', action: 'navigate', value: '/upload', icon: Upload })}
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction({ label: 'Verify', action: 'navigate', value: '/verify', icon: Search })}
                      className="text-xs"
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Verify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction({ label: 'Dashboard', action: 'navigate', value: '/dashboard', icon: LayoutDashboard })}
                      className="text-xs"
                    >
                      <LayoutDashboard className="w-3 h-3 mr-1" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction({ label: 'Security', action: 'message', value: 'What are forward & backward security codes?', icon: Lock })}
                      className="text-xs"
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Security
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default ChatBotWindow;