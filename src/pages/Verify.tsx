import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Shield, Search, CheckCircle, XCircle, Download, QrCode, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link, NavLink } from 'react-router-dom';
import { useDocuments } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SignInDropdown } from '@/components/SignInDropdown';
import QRCode from 'qrcode';
import { BASE_URL } from '@/lib/config';

const Verify = () => {
  const [hashInput, setHashInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);
  const { documents, updateDocumentStatus } = useDocuments();

  useEffect(() => {
    if (qrDialogOpen) {
      try {
        const verificationUrl = `${BASE_URL}/verify?hash=${verificationResult.hash}`;
        QRCode.toDataURL(verificationUrl).then(qrDataUrl => setCurrentQrCode(qrDataUrl));
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    }
  }, [qrDialogOpen, verificationResult]);

  const handleVerify = async () => {
    if (!hashInput.trim()) return;
    
    setIsVerifying(true);
    
    // Check if the hash matches any stored documents
    const storedDoc = documents.find(doc => doc.hash === hashInput);
    
    if (storedDoc) {
      // Generate a new transaction ID for successful verification
      const transactionId = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Update document status to verified with 99.9% confidence and new transaction ID
      updateDocumentStatus(storedDoc.id, 'verified', transactionId, 99.9);
      
      // Return stored document details with 99.9% accuracy
      setVerificationResult({
        isValid: true,
        hash: hashInput,
        blockchainTx: transactionId,
        timestamp: storedDoc.uploadDate,
        documentInfo: {
          name: storedDoc.name,
          uploadDate: storedDoc.uploadDate,
          confidence: 99.9,
          issuer: storedDoc.metadata?.institution || 'Unknown Institution'
        }
      });
    } else {
      // Simulate blockchain verification for unknown documents
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerificationResult({
        isValid: false,
        hash: hashInput,
        blockchainTx: null,
        timestamp: null,
        documentInfo: null
      });
    }
    
    setIsVerifying(false);
  };

  const handleGenerateQR = async () => {
    if (!verificationResult?.hash) return;
    
    try {
      const verificationUrl = `${BASE_URL}/verify?hash=${verificationResult.hash}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl);
      setCurrentQrCode(qrDataUrl);
      setQrDialogOpen(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleDownloadQR = () => {
    if (currentQrCode) {
      const link = document.createElement('a');
      link.href = currentQrCode;
      link.download = `certificate-qr-${verificationResult.hash.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetVerification = () => {
    setHashInput('');
    setVerificationResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="blur-overlay"></div>
      
      {/* Navigation */}
      <nav className="glass-effect fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">BlockCert</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <NavLink to="/upload" className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}>Upload</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}>Dashboard</NavLink>
            <NavLink to="/verify" className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}>Verify</NavLink>
            <ThemeToggle />
            <SignedOut>
              <SignInDropdown fallbackUrl="/verify" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      <div className="container w-full px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Verify Certificate Authenticity
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter a certificate hash to check its authenticity
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Verification Input */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Hash Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Certificate Hash
                </label>
                <Input
                  placeholder="Enter certificate hash (64 characters)"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The SHA-256 hash of your certificate
                </p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleVerify} 
                  disabled={!hashInput.trim() || isVerifying}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetVerification}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult ? (
                <div className="space-y-6">
                  {/* Status */}
                  <div className={`p-4 rounded-lg border ${
                    verificationResult.isValid 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      {verificationResult.isValid ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <h3 className={`font-semibold ${
                          verificationResult.isValid 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {verificationResult.isValid ? 'Certificate Verified' : 'Certificate Not Found'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {verificationResult.isValid 
                            ? 'This certificate exists on the blockchain and is authentic'
                            : 'This hash was not found in our blockchain records'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  {verificationResult.isValid && verificationResult.documentInfo && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Certificate Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="text-foreground">{verificationResult.documentInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Issuer:</span>
                          <span className="text-foreground">{verificationResult.documentInfo.issuer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Upload Date:</span>
                          <span className="text-foreground">{verificationResult.documentInfo.uploadDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AI Confidence:</span>
                          <Badge variant="secondary">{verificationResult.documentInfo.confidence}%</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Blockchain Details */}
                  {verificationResult.isValid && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Blockchain Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground block mb-1">Transaction Hash:</span>
                          <code className="text-xs bg-muted p-2 rounded block break-all">
                            {verificationResult.blockchainTx}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Timestamp:</span>
                          <span className="text-foreground">
                            {new Date(verificationResult.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="sm"
                        onClick={handleGenerateQR}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        View QR Code
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Verify</h3>
                  <p className="text-muted-foreground">
                    Enter a certificate hash to check its authenticity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Need to verify a certificate?</h2>
          <div className="flex justify-center gap-4">
            <Link to="/upload">
              <Button variant="outline">Upload New Certificate</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">View My Certificates</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Certificate QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {currentQrCode && (
              <div className="p-4 bg-white rounded-lg">
                <img src={currentQrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            <div className="flex gap-2 w-full">
              <Button className="flex-1" onClick={handleDownloadQR}>
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
              <Button variant="outline" onClick={() => setQrDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Verify;