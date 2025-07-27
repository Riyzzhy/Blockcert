import React from 'react';
import { motion, Transition } from 'framer-motion';

interface ToggleSwitchProps {
  isChecked: boolean;
  onToggle: (isChecked: boolean) => void;
}

const spring: Transition = { 
  type: 'spring',
  stiffness: 700,
  damping: 30
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, onToggle }) => {
  return (
    <div 
      className={`relative w-12 h-7 flex items-center rounded-full cursor-pointer ${isChecked ? 'bg-green-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}
      onClick={() => onToggle(!isChecked)}
      data-ischecked={isChecked}
    >
      <motion.div 
        className="w-6 h-6 bg-white rounded-full shadow-md m-0.5"
        layout
        transition={spring}
      />
    </div>
  );
};

export default ToggleSwitch;
