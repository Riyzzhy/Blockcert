import { useState } from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Building2 } from 'lucide-react';

const portalTypes = [
  {
    id: 'user',
    title: 'User Portal',
    description: 'For students and individuals',
    icon: User
  },
  {
    id: 'institution',
    title: 'Institution Portal',
    description: 'For academic institutions',
    icon: Building2
  }
];

export default function SignIn() {
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);

  const handlePortalSelect = (portalId: string) => {
    setSelectedPortal(portalId);
    localStorage.setItem('selectedPortal', portalId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {!selectedPortal ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-2xl font-bold text-center">Choose your portal</h1>
            <div className="grid gap-4">
              {portalTypes.map((portal) => (
                <motion.div
                  key={portal.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:bg-accent transition-colors duration-200"
                    onClick={() => handlePortalSelect(portal.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <portal.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{portal.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {portal.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg shadow-lg overflow-hidden"
          >
            <ClerkSignIn />
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setSelectedPortal(null)}
              >
                Choose Different Portal
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 