import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { CareerType, CareerDetails } from '@/lib/careerTypes';

interface CareerDetailsFormProps {
  careerType: CareerType;
  careerDetails: CareerDetails;
  onChange: (details: CareerDetails) => void;
  className?: string;
}

export const CareerDetailsForm: React.FC<CareerDetailsFormProps> = ({
  careerType,
  careerDetails,
  onChange,
  className = ''
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const handleInputChange = (field: keyof CareerDetails, value: string) => {
    onChange({
      ...careerDetails,
      [field]: value
    });
  };

  const handleDateSelect = (field: 'startDate' | 'endDate', date: Date) => {
    onChange({
      ...careerDetails,
      [field]: format(date, 'yyyy-MM-dd')
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const skills = careerDetails.skills || [];
      onChange({
        ...careerDetails,
        skills: [...skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const skills = careerDetails.skills || [];
    onChange({
      ...careerDetails,
      skills: skills.filter((_, i) => i !== index)
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      const achievements = careerDetails.achievements || [];
      onChange({
        ...careerDetails,
        achievements: [...achievements, newAchievement.trim()]
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    const achievements = careerDetails.achievements || [];
    onChange({
      ...careerDetails,
      achievements: achievements.filter((_, i) => i !== index)
    });
  };

  const formVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`space-y-4 overflow-hidden ${className}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              {careerType === 'internship' ? 'Internship Position' : 'Job Position'} *
            </label>
            <Input
              value={careerDetails.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder={careerType === 'internship' ? 'e.g., Software Engineering Intern' : 'e.g., Senior Software Engineer'}
              required
              className="bg-card border-input"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Company *</label>
            <Input
              value={careerDetails.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Enter company name"
              required
              className="bg-card border-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal bg-card border-input ${
                    !careerDetails.startDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {careerDetails.startDate ? format(new Date(careerDetails.startDate), 'PPP') : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={careerDetails.startDate ? new Date(careerDetails.startDate) : undefined}
                  onSelect={(date) => date && handleDateSelect('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">
              {careerType === 'internship' ? 'End Date' : 'End Date (if applicable)'}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal bg-card border-input ${
                    !careerDetails.endDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {careerDetails.endDate ? format(new Date(careerDetails.endDate), 'PPP') : <span>Pick end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={careerDetails.endDate ? new Date(careerDetails.endDate) : undefined}
                  onSelect={(date) => date && handleDateSelect('endDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {careerType === 'internship' && (
            <div>
              <label className="text-sm font-medium mb-1 block">Duration</label>
              <Input
                value={careerDetails.duration || ''}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 3 months"
                className="bg-card border-input"
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <Textarea
            value={careerDetails.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={`Describe your ${careerType} role, responsibilities, and key projects...`}
            rows={3}
            className="bg-card border-input"
          />
        </div>

        {/* Skills Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">Skills & Technologies</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g., React, Python, etc.)"
                className="flex-1 bg-card border-input"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {careerDetails.skills && careerDetails.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {careerDetails.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">Key Achievements</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add an achievement or accomplishment"
                className="flex-1 bg-card border-input"
                onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
              />
              <Button type="button" onClick={addAchievement} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {careerDetails.achievements && careerDetails.achievements.length > 0 && (
              <div className="space-y-2">
                {careerDetails.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-start gap-2 p-2 bg-muted rounded-md"
                  >
                    <span className="text-sm flex-1">{achievement}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};