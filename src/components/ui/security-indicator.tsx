import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Lock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SecurityCodes, SecurityManager } from '@/lib/security';

interface SecurityIndicatorProps {
  securityCodes?: SecurityCodes;
  onRefresh?: (newCodes: SecurityCodes) => void;
  className?: string;
}

export const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({ 
  securityCodes, 
  onRefresh,
  className = '' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!securityCodes) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(securityCodes.expiresAt).getTime();
      const remaining = Math.max(0, expiry - now);
      
      setTimeRemaining(remaining);
      setIsExpired(remaining === 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [securityCodes]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSecurityLevel = (): { level: string; color: string; icon: React.ComponentType } => {
    if (!securityCodes) {
      return { level: 'No Security', color: 'text-red-500', icon: AlertTriangle };
    }
    
    if (isExpired) {
      return { level: 'Expired', color: 'text-red-500', icon: AlertTriangle };
    }
    
    if (timeRemaining > 15 * 60 * 1000) { // > 15 minutes
      return { level: 'High Security', color: 'text-green-500', icon: CheckCircle };
    } else if (timeRemaining > 5 * 60 * 1000) { // > 5 minutes
      return { level: 'Medium Security', color: 'text-yellow-500', icon: Clock };
    } else {
      return { level: 'Low Security', color: 'text-orange-500', icon: AlertTriangle };
    }
  };

  const handleRefresh = async () => {
    if (!securityCodes || !onRefresh) return;
    
    setIsRefreshing(true);
    try {
      const newCodes = SecurityManager.refreshSecurityCodes(securityCodes.sessionId);
      if (newCodes) {
        onRefresh(newCodes);
      } else {
        // Generate completely new codes
        const freshCodes = SecurityManager.generateSecurityCodes(
          securityCodes.userId,
          window.location.hostname,
          navigator.userAgent
        );
        onRefresh(freshCodes);
      }
    } catch (error) {
      console.error('Failed to refresh security codes:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const security = getSecurityLevel();
  const SecurityIcon = security.icon;

  if (!securityCodes) {
    return (
      <Card className={`p-4 border-red-200 bg-red-50 dark:bg-red-950/20 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            Security codes not initialized
          </span>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-3">
          {/* Security Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SecurityIcon className={`w-5 h-5 ${security.color}`} />
              <span className="font-medium">{security.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isExpired ? 'destructive' : 'secondary'}>
                {isExpired ? 'Expired' : 'Active'}
              </Badge>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Time remaining: {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Security Codes Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Session ID:</span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {securityCodes.sessionId.slice(0, 8)}...
              </code>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Forward:</span>
                <code className="block bg-muted px-1 py-0.5 rounded mt-1">
                  {securityCodes.forwardCode.slice(0, 8)}...
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Backward:</span>
                <code className="block bg-muted px-1 py-0.5 rounded mt-1">
                  {securityCodes.backwardCode.slice(0, 8)}...
                </code>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Time-bound • Non-reusable • Blockchain-verified</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};