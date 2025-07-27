import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Shield, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="relative min-h-screen">
          {/* Blurred content */}
          <div className="absolute inset-0 filter blur-md pointer-events-none">
            {children}
          </div>
          
          {/* Login message overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 text-center space-y-4 animate-fade-in">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please sign in to access this feature. Choose between User or Institution portal to continue.
              </p>
              <Button 
                size="lg"
                className="w-full"
                onClick={() => navigate("/sign-in")}
              >
                <Shield className="mr-2 h-5 w-5" />
                Sign In to Continue
              </Button>
            </Card>
          </div>
        </div>
      </SignedOut>
    </>
  );
} 