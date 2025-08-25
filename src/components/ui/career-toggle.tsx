import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap } from 'lucide-react';
import { CareerType } from '@/lib/careerTypes';

interface CareerToggleProps {
  value: CareerType;
  onChange: (value: CareerType) => void;
  className?: string;
}

export const CareerToggle: React.FC<CareerToggleProps> = ({ 
  value, 
  onChange, 
  className = '' 
}) => {
  const toggleVariants = {
    internship: {
      x: 0,
      transition: { type: "spring", stiffness: 500, damping: 30 }
    },
    job: {
      x: '100%',
      transition: { type: "spring", stiffness: 500, damping: 30 }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-muted rounded-lg p-1 relative">
        {/* Sliding background */}
        <motion.div
          className="absolute top-1 bottom-1 w-1/2 bg-primary rounded-md shadow-sm"
          variants={toggleVariants}
          animate={value}
        />
        
        {/* Internship Option */}
        <button
          type="button"
          onClick={() => onChange('internship')}
          className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 w-1/2 justify-center ${
            value === 'internship' 
              ? 'text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Internship</span>
        </button>
        
        {/* Job Option */}
        <button
          type="button"
          onClick={() => onChange('job')}
          className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 w-1/2 justify-center ${
            value === 'job' 
              ? 'text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job</span>
        </button>
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {value === 'internship' 
          ? 'Certificate will be verified for internship applications'
          : 'Certificate will be verified for job applications'
        }
      </p>
    </div>
  );
};