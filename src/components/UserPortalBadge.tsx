import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Building2 } from 'lucide-react';

export function UserPortalBadge() {
  const [portalType, setPortalType] = useState<string | null>(null);

  useEffect(() => {
    const storedPortal = localStorage.getItem('selectedPortal');
    if (storedPortal) {
      setPortalType(storedPortal);
    }
  }, []);

  if (!portalType) return null;

  return (
    <Badge variant="secondary" className="ml-2 gap-1">
      {portalType === 'institution' ? (
        <>
          <Building2 className="w-3 h-3" />
          <span>Institution</span>
        </>
      ) : (
        <>
          <User className="w-3 h-3" />
          <span>User</span>
        </>
      )}
    </Badge>
  );
} 