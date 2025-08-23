import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatBotButton from './ChatBotButton';
import ChatBotWindow from './ChatBotWindow';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatBotButton 
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)} 
      />
      
      <AnimatePresence>
        {isOpen && (
          <ChatBotWindow 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;