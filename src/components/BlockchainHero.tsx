"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Shield, Upload, Search, LayoutDashboard, Menu, X, Tag, Info, Mail } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Link, NavLink } from 'react-router-dom';
import { SignInDropdown } from './SignInDropdown';
import { UserPortalBadge } from './UserPortalBadge';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

const BlockchainHero: React.FC = () => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const [isScrolled, setIsScrolled] = useState<boolean>(false);

   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (latest) => {
       setIsScrolled(latest > 10);
   });

   // Simplified animated background
   useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;

     const ctx = canvas.getContext('2d');
     if (!ctx) return;

     const resizeCanvas = () => {
       canvas.width = window.innerWidth;
       canvas.height = window.innerHeight;
     };

     resizeCanvas();
     window.addEventListener('resize', resizeCanvas);

     const particles: { x: number; y: number; vx: number; vy: number; opacity: number }[] = [];
     for (let i = 0; i < 50; i++) {
       particles.push({
         x: Math.random() * canvas.width,
         y: Math.random() * canvas.height,
         vx: (Math.random() - 0.5) * 0.5,
         vy: (Math.random() - 0.5) * 0.5,
         opacity: Math.random() * 0.5 + 0.1
       });
     }

     const animate = () => {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
       particles.forEach(particle => {
         particle.x += particle.vx;
         particle.y += particle.vy;
         
         if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
         if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
         
         ctx.beginPath();
         ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
         ctx.fillStyle = `hsl(var(--primary) / ${particle.opacity})`;
         ctx.fill();
       });
       
       requestAnimationFrame(animate);
     };

     animate();

     return () => {
       window.removeEventListener('resize', resizeCanvas);
     };
   }, []);

   const headerVariants = {
       top: {
           backgroundColor: "rgba(255, 255, 255, 0.1)",
           backdropFilter: "blur(8px)",
           boxShadow: 'none',
       },
       scrolled: {
           backgroundColor: "rgba(255, 255, 255, 0.2)",
           backdropFilter: "blur(20px)",
           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
       }
   };

  return (
    <div className="relative bg-background min-h-screen flex flex-col overflow-x-hidden">
        <div className="blur-overlay"></div>
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-30" />
        
        <motion.header
            variants={headerVariants}
            initial="top"
            animate={isScrolled ? "scrolled" : "top"}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="glass-effect fixed top-0 w-full z-50 border-b border-white/10"
        >
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold text-foreground">BlockCert</span>
                </Link>
                
                <div className="hidden md:flex items-center space-x-8">
                    <NavLink to="/upload" className={({ isActive }) => isActive ? 'text-primary font-medium flex items-center space-x-1' : 'text-muted-foreground hover:text-foreground flex items-center space-x-1'}>
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                    </NavLink>
                    <SignedIn>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-primary font-medium flex items-center space-x-1' : 'text-muted-foreground hover:text-foreground flex items-center space-x-1'}>
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Dashboard</span>
                        </NavLink>
                    </SignedIn>
                    <NavLink to="/verify" className={({ isActive }) => isActive ? 'text-primary font-medium flex items-center space-x-1' : 'text-muted-foreground hover:text-foreground flex items-center space-x-1'}>
                        <Search className="h-4 w-4" />
                        <span>Verify</span>
                    </NavLink>
                    <a href="#pricing" className="text-muted-foreground hover:text-foreground flex items-center space-x-1">
                        <Tag className="h-4 w-4" />
                        <span>Pricing</span>
                    </a>
                    <a href="#about" className="text-muted-foreground hover:text-foreground flex items-center space-x-1">
                        <Info className="h-4 w-4" />
                        <span>About</span>
                    </a>
                    <a href="#contact" className="text-muted-foreground hover:text-foreground flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>Contact</span>
                    </a>
                </div>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <SignedOut>
                        <SignInDropdown 
                            variant="outline" 
                            size="sm" 
                            className="glass-effect border-white/20"
                            fallbackUrl="/"
                        />
                    </SignedOut>
                    <SignedIn>
                        <div className="flex items-center">
                            <UserPortalBadge />
                            <UserButton />
                        </div>
                    </SignedIn>

                    <motion.button
                        className="md:hidden text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </motion.button>
                </div>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden glass-effect border-t border-white/10"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            <NavLink to="/upload" className={({ isActive }) => isActive ? 'text-primary font-medium flex items-center space-x-1' : 'text-muted-foreground hover:text-foreground flex items-center space-x-1'}>
                                <Upload className="h-4 w-4" />
                                <span>Upload</span>
                            </NavLink>
                            <SignedIn>
                                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-primary font-medium flex items-center space-x-1' : 'text-muted-foreground hover:text-foreground flex items-center space-x-1'}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </NavLink>
                            </SignedIn>
                            <NavLink to="/verify" className={({ isActive }) => isActive ? 'text-primary font-medium flex items-center space-x-1' : 'text-muted-foreground hover:text-foreground flex items-center space-x-1'}>
                                <Search className="h-4 w-4" />
                                <span>Verify</span>
                            </NavLink>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>

        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mb-8"
                >
                    <span className="glass-effect text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
                        ✨ AI-Powered Document Verification
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
                >
                    Blockchain Academic
                    <br />
                    <span className="blockchain-text-gradient">Verification System</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Leverage AI-powered analysis and blockchain technology to verify academic documents. 
                    Upload, verify, and securely store your certificates with immutable proof of authenticity.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                >
                    <Link to="/upload">
                        <Button size="lg" className="w-full sm:w-auto glass-effect bg-primary/90 hover:bg-primary backdrop-blur-sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                        </Button>
                    </Link>
                    <Link to="/verify">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto glass-effect border-white/20">
                            <Search className="h-4 w-4 mr-2" />
                            Verify Hash
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
                >
                    <div className="glass-morphism p-6 rounded-lg">
                        <Shield className="h-8 w-8 text-primary mx-auto mb-3 animate-pulse-glow" />
                        <h3 className="font-semibold mb-2">Blockchain Security</h3>
                        <p className="text-sm text-muted-foreground">Immutable records on blockchain</p>
                    </div>
                    
                    <div className="glass-morphism p-6 rounded-lg">
                        <Upload className="h-8 w-8 text-primary mx-auto mb-3 animate-bounce-soft" />
                        <h3 className="font-semibold mb-2">AI Analysis</h3>
                        <p className="text-sm text-muted-foreground">Smart authenticity detection</p>
                    </div>
                    
                    <div className="glass-morphism p-6 rounded-lg">
                        <Search className="h-8 w-8 text-primary mx-auto mb-3 animate-float" />
                        <h3 className="font-semibold mb-2">Instant Verification</h3>
                        <p className="text-sm text-muted-foreground">Real-time document checking</p>
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="text-xs text-muted-foreground mt-12"
                >
                    AI Analysis • Blockchain Storage • Instant Verification
                </motion.p>
            </motion.div>
        </main>
    </div>
  );
};

export default BlockchainHero;