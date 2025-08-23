import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatBotButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnreadMessages?: boolean;
}

const ChatBotButton: React.FC<ChatBotButtonProps> = ({ 
  isOpen, 
  onClick, 
  hasUnreadMessages = false 
}) => {
  const buttonVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      <Button
        onClick={onClick}
        className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 relative overflow-hidden group"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          )}
        </motion.div>
        
        {/* Notification Badge */}
        {hasUnreadMessages && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs text-white font-bold">!</span>
          </motion.div>
        )}
        
        {/* Pulse animation when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </Button>
    </motion.div>
  );
};

export default ChatBotButton;