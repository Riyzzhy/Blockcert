import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatBotContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messageCount: number;
  incrementMessageCount: () => void;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};

interface ChatBotProviderProps {
  children: ReactNode;
}

export const ChatBotProvider: React.FC<ChatBotProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const incrementMessageCount = () => {
    setMessageCount(prev => prev + 1);
  };

  return (
    <ChatBotContext.Provider value={{
      isOpen,
      setIsOpen,
      messageCount,
      incrementMessageCount
    }}>
      {children}
    </ChatBotContext.Provider>
  );
};