import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Building2, User, LogOut, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface SignInDropdownProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  fallbackUrl?: string;
}

export function SignInDropdown({
  variant = "outline",
  size = "sm",
  className,
  fallbackUrl = "/"
}: SignInDropdownProps) {
  const { user, isSignedIn } = useUser();
  const { signOut, openSignIn } = useClerk();
  const [portalType, setPortalType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedPortal = localStorage.getItem('selectedPortal');
    if (storedPortal) {
      setPortalType(storedPortal);
    }
  }, []);

  const handleSignIn = async (type: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem('selectedPortal', type);
      setPortalType(type);
      await openSignIn({
        redirectUrl: fallbackUrl,
        appearance: {
          elements: {
            rootBox: type === 'institution' ? 'bg-blockchain-blue-dark' : 'bg-card'
          }
        }
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Sign in</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] p-2">
        <DropdownMenuLabel className="text-center font-normal">
          Choose your portal
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-2 p-2">
          <Card 
            className="p-3 cursor-pointer hover:bg-accent transition-colors duration-200"
            onClick={() => handleSignIn('user')}
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">User Portal</span>
                <span className="text-sm text-muted-foreground">For students and individuals</span>
              </div>
            </div>
          </Card>
          <Card 
            className="p-3 cursor-pointer hover:bg-accent transition-colors duration-200"
            onClick={() => handleSignIn('institution')}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">Institution Portal</span>
                <span className="text-sm text-muted-foreground">For academic institutions</span>
              </div>
            </div>
          </Card>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 