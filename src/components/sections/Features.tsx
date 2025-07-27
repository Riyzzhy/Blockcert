import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Bot, FileCheck, Users, Zap, Lock, QrCode, Download } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Immutable records stored on Polygon Mumbai testnet ensuring document authenticity",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Bot,
      title: "AI Document Analysis", 
      description: "Advanced AI scans uploaded documents for authenticity with confidence scoring",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: FileCheck,
      title: "Certificate Generation",
      description: "Auto-generate QR codes and certified downloadable files with verification links",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "User Dashboard",
      description: "Comprehensive dashboard for students and institutions to manage documents",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Real-time hash verification with blockchain transaction links",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Lock,
      title: "Secure Authentication",
      description: "OAuth2 integration with Google and Apple login for secure access",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: QrCode,
      title: "QR Code System",
      description: "Embedded QR codes link directly to verification results and blockchain records",
      gradient: "from-teal-500 to-green-500"
    },
    {
      icon: Download,
      title: "File Management",
      description: "Support for PDF and image uploads with Firebase/AWS S3 storage integration",
      gradient: "from-rose-500 to-pink-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful <span className="blockchain-text-gradient">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive blockchain academic system combines cutting-edge AI analysis 
            with immutable blockchain technology to ensure document authenticity.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="blockchain-card p-6 rounded-xl group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-6 group-hover:shadow-lg transition-shadow duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow"></div>
    </section>
  );
};

export default Features;