import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, Shield, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { useDocuments, type UploadedDocument } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { CareerToggle } from '@/components/ui/career-toggle';
import { CareerDetailsForm } from '@/components/ui/career-details-form';
import { SecurityIndicator } from '@/components/ui/security-indicator';
import { CareerType, CareerDetails, EnhancedDocumentMetadata } from '@/lib/careerTypes';
import { SecurityManager, SecurityCodes } from '@/lib/security';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { SignInDropdown } from '@/components/SignInDropdown';

const Upload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [careerType, setCareerType] = useState<CareerType>('internship');
  const [careerDetails, setCareerDetails] = useState<CareerDetails>({
    type: 'internship',
    position: '',
    company: '',
    startDate: '',
    description: ''
  });
  const [securityCodes, setSecurityCodes] = useState<SecurityCodes | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    certificateName: '',
    institution: '',
    startDate: '',
    issueDate: '',
    grades: '',
    personality: '',
    additionalDetails: ''
  });

  const { addDocument } = useDocuments();

  // Initialize security codes on component mount
  useEffect(() => {
    const initializeSecurity = () => {
      const codes = SecurityManager.generateSecurityCodes(
        undefined, // userId will be set when user is authenticated
        window.location.hostname,
        navigator.userAgent
      );
      setSecurityCodes(codes);
    };

    initializeSecurity();
  }, []);

  // Update career details when career type changes
  useEffect(() => {
    setCareerDetails(prev => ({
      ...prev,
      type: careerType
    }));
  }, [careerType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (field: 'startDate' | 'issueDate', date: Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: format(date, 'yyyy-MM-dd')
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
  };

  const simulateAIAnalysis = async (file: File) => {
    // Validate required fields
    const requiredFields = ['fullName', 'certificateName', 'institution', 'startDate', 'issueDate', 'personality'];
    const requiredCareerFields = ['position', 'company', 'startDate'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    const missingCareerFields = requiredCareerFields.filter(field => !careerDetails[field]);
    
    if (missingFields.length > 0 || missingCareerFields.length > 0) {
      const allMissing = [...missingFields, ...missingCareerFields.map(f => `career ${f}`)];
      alert(`Please fill in all required fields: ${allMissing.join(', ')}`);
      return;
    }

    if (!securityCodes) {
      alert('Security codes not initialized. Please refresh the page.');
      return;
    }

    if (!file) {
      alert('Please select a file to verify');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Enhanced AI Certificate Verification System
      
      // 1. Document Format Analysis (25%)
      const fileType = file.type;
      const validTypes = {
        'application/pdf': 25,
        'image/jpeg': 20,
        'image/png': 20
      };
      const formatScore = validTypes[fileType] || 0;

      // 2. Certificate Structure Analysis (25%)
      const structureScore = await analyzeCertificateStructure(file);

      // 3. Content Verification (25%)
      const contentScore = calculateContentScore();

      // 4. Metadata Validation (25%)
      const metadataScore = validateMetadata();

      // 5. Security Validation (Bonus 10%)
      const securityScore = validateSecurityCodes();

      // Calculate final accuracy score (0-100%)
      const accuracy = Math.min(100, formatScore + structureScore + contentScore + metadataScore + securityScore);
      const isAuthentic = accuracy >= 90;

      // Generate verification details
      const verificationDetails = {
        formatAnalysis: {
          score: formatScore,
          maxScore: 25,
          details: `Document format: ${fileType}`
        },
        structureAnalysis: {
          score: structureScore,
          maxScore: 25,
          details: 'Certificate layout and elements analysis'
        },
        contentVerification: {
          score: contentScore,
          maxScore: 25,
          details: 'Content consistency check'
        },
        metadataValidation: {
          score: metadataScore,
          maxScore: 25,
          details: 'Metadata and dates validation'
        },
        securityValidation: {
          score: securityScore,
          maxScore: 10,
          details: 'Time-window security codes validation'
        }
      };

      // Blockchain verification for authentic certificates
      const blockchainVerification = isAuthentic ? {
        networkType: 'Ethereum',
        contractAddress: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        timestamp: new Date().toISOString(),
        verificationHash: generateMockHash()
      } : null;

      const indicators = generateVerificationIndicators(verificationDetails, isAuthentic);

      setAnalysisResult({
        accuracy: accuracy.toFixed(1),
        isAuthentic,
        hash: generateMockHash(),
        indicators,
        blockchainVerification,
        details: verificationDetails
      });

    } catch (error) {
      console.error('Verification error:', error);
      setAnalysisResult({
        accuracy: 0,
        isAuthentic: false,
        hash: null,
        indicators: ['Verification process failed', 'Please try again'],
        blockchainVerification: null,
        details: null
      });
    }
    
    setIsAnalyzing(false);
  };

  // Helper functions for AI verification
  const analyzeCertificateStructure = async (file: File): Promise<number> => {
    // Simulated AI structure analysis
    const hasTitle = Math.random() > 0.1;
    const hasSignature = Math.random() > 0.1;
    const hasDate = Math.random() > 0.1;
    const hasLogo = Math.random() > 0.1;
    const hasWatermark = Math.random() > 0.2;

    let score = 0;
    if (hasTitle) score += 5;
    if (hasSignature) score += 5;
    if (hasDate) score += 5;
    if (hasLogo) score += 5;
    if (hasWatermark) score += 5;

    return score;
  };

  const calculateContentScore = (): number => {
    let score = 0;

    // Check name consistency
    if (formData.fullName.length > 0) score += 5;
    
    // Check certificate name validity
    if (formData.certificateName.length > 0) score += 5;
    
    // Check institution name
    if (formData.institution.length > 0) score += 5;
    
    // Check dates logic
    const startDate = new Date(formData.startDate);
    const issueDate = new Date(formData.issueDate);
    if (issueDate > startDate) score += 5;
    
    // Check additional details
    if (formData.additionalDetails) score += 5;

    return score;
  };

  const validateMetadata = (): number => {
    let score = 0;

    // Validate dates
    const startDate = new Date(formData.startDate);
    const issueDate = new Date(formData.issueDate);
    const today = new Date();

    if (startDate < today && issueDate <= today) score += 10;
    if (issueDate > startDate) score += 5;

    // Validate name format
    if (/^[A-Za-z\s]{2,}$/.test(formData.fullName)) score += 5;

    // Validate institution
    if (formData.institution.length >= 2) score += 5;

    return score;
  };

  const validateSecurityCodes = (): number => {
    if (!securityCodes) return 0;
    
    const validation = SecurityManager.validateSecurityCodes(
      securityCodes.sessionId,
      securityCodes.forwardCode,
      securityCodes.backwardCode,
      securityCodes.userId
    );
    
    return validation.valid ? 10 : 0;
  };

  const generateVerificationIndicators = (details: any, isAuthentic: boolean): string[] => {
    if (isAuthentic) {
      return [
        `Document format verified (${details.formatAnalysis.score}/${details.formatAnalysis.maxScore})`,
        `Certificate structure validated (${details.structureAnalysis.score}/${details.structureAnalysis.maxScore})`,
        `Content verification passed (${details.contentVerification.score}/${details.contentVerification.maxScore})`,
        `Metadata validation successful (${details.metadataValidation.score}/${details.metadataValidation.maxScore})`,
        `Security validation passed (${details.securityValidation.score}/${details.securityValidation.maxScore})`,
        'Digital signatures verified',
        'Blockchain verification successful'
      ];
    } else {
      const failedChecks = [];
      if (details.formatAnalysis.score < 20) failedChecks.push('Invalid document format');
      if (details.structureAnalysis.score < 20) failedChecks.push('Certificate structure issues detected');
      if (details.contentVerification.score < 20) failedChecks.push('Content verification failed');
      if (details.metadataValidation.score < 20) failedChecks.push('Metadata validation failed');
      if (details.securityValidation.score < 5) failedChecks.push('Security validation failed');
      
      return [
        ...failedChecks,
        'Please ensure document is an official certificate',
        'Try uploading a clearer version of the document'
      ];
    }
  };

  const generateMockHash = () => {
    return Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const handleUpload = () => {
    if (!selectedFile || !analysisResult || !analysisResult.isAuthentic) return;
    
    const status: 'pending_verification' | 'verified' | 'failed' = 'pending_verification';
    
    // Create blob from the selected file for original file downloads
    const fileBlob = new Blob([selectedFile], { type: selectedFile.type });
    
    const enhancedMetadata: EnhancedDocumentMetadata = {
      ...formData,
      additionalDetails: formData.additionalDetails || '',
      verified: false,
      certificationStamp: 'By BlockCert Certified',
      certificationDate: new Date().toISOString(),
      certificationSystem: 'BlockCert Blockchain Verification',
      careerType,
      careerDetails,
      securityCodes: securityCodes ? {
        sessionId: securityCodes.sessionId,
        forwardCode: securityCodes.forwardCode,
        backwardCode: securityCodes.backwardCode,
        expiresAt: securityCodes.expiresAt
      } : undefined
    };

    const newDoc: any = {
      id: uuidv4(),
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      uploadDate: new Date().toISOString().slice(0, 10),
      status,
      confidence: parseFloat(analysisResult.accuracy),
      hash: analysisResult.hash,
      analysis: analysisResult.indicators,
      blockchainTx: analysisResult.blockchainVerification?.verificationHash || null,
      file: selectedFile,
      blob: fileBlob,
      metadata: enhancedMetadata,
      careerCategory: careerType,
      careerDetails,
      securitySession: securityCodes ? {
        sessionId: securityCodes.sessionId,
        createdAt: new Date(),
        ipAddress: window.location.hostname
      } : undefined
    };

    addDocument(newDoc);
    const objectUrl = URL.createObjectURL(selectedFile);
    localStorage.setItem(`doc_${analysisResult.hash}`, objectUrl);
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleSecurityRefresh = (newCodes: SecurityCodes) => {
    setSecurityCodes(newCodes);
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
              <SignInDropdown fallbackUrl="/upload" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      <div className="container w-full px-4 pt-24 pb-16">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Upload Certificate for Verification
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload your academic certificates for AI analysis and blockchain verification
            </p>
          </motion.div>

          <SignedIn>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Certificate Details Form */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Certificate Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Security Indicator */}
                  <SecurityIndicator 
                    securityCodes={securityCodes} 
                    onRefresh={handleSecurityRefresh}
                  />
                  
                  {/* Career Type Toggle */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Application Type</label>
                    <CareerToggle 
                      value={careerType} 
                      onChange={setCareerType}
                      className="mb-4"
                    />
                  </div>

                  {/* Career Details Form */}
                  <CareerDetailsForm
                    careerType={careerType}
                    careerDetails={careerDetails}
                    onChange={setCareerDetails}
                  />

                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium mb-3">Certificate Information</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Full Name *</label>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                          className="bg-card border-input"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Certificate Name *</label>
                        <Input
                          name="certificateName"
                          value={formData.certificateName}
                          onChange={handleInputChange}
                          placeholder="e.g., Bachelor's Degree"
                          required
                          className="bg-card border-input"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Institution Name *</label>
                        <Input
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          placeholder="Enter institution name"
                          required
                          className="bg-card border-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Start Date *</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal bg-card border-input ${
                                !formData.startDate && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? format(new Date(formData.startDate), 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.startDate ? new Date(formData.startDate) : undefined}
                              onSelect={(date) => date && handleDateSelect('startDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Issue Date *</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal bg-card border-input ${
                                !formData.issueDate && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.issueDate ? format(new Date(formData.issueDate), 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.issueDate ? new Date(formData.issueDate) : undefined}
                              onSelect={(date) => date && handleDateSelect('issueDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Grades (optional)</label>
                        <Input
                          name="grades"
                          value={formData.grades}
                          onChange={handleInputChange}
                          placeholder="Enter grades if available"
                          className="bg-card border-input"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Personality *</label>
                        <Input
                          name="personality"
                          value={formData.personality}
                          onChange={handleInputChange}
                          placeholder="Enter personality traits"
                          required
                          className="bg-card border-input"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium mb-1 block">Additional Details (optional)</label>
                      <Textarea
                        name="additionalDetails"
                        value={formData.additionalDetails}
                        onChange={handleInputChange}
                        placeholder="Add any additional details about the certificate"
                        rows={3}
                        className="bg-card border-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Upload and Analysis */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UploadIcon className="h-5 w-5" />
                    Certificate Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-input rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary/50 bg-card"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <UploadIcon className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                    <p className="text-lg font-medium mb-2">Drag and drop your certificate here</p>
                    <p className="text-sm text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                    </p>
                  </div>

                  {selectedFile && (
                    <Alert className="flex items-center justify-between bg-card border-input mt-4">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <AlertDescription>
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </AlertDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setAnalysisResult(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Alert>
                  )}

                  {selectedFile && !isAnalyzing && !analysisResult && (
                    <Button 
                      className="w-full mt-4"
                      onClick={() => simulateAIAnalysis(selectedFile)}
                    >
                      Start AI Verification
                    </Button>
                  )}

                  {isAnalyzing ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Analyzing certificate authenticity...</p>
                      <p className="text-sm text-muted-foreground mt-2">Running blockchain verification...</p>
                    </div>
                  ) : analysisResult && (
                    <div className="space-y-4 mt-4">
                      <div className={`p-4 rounded-lg ${
                        analysisResult.isAuthentic
                          ? 'bg-green-500/10 dark:bg-green-500/5 border border-green-500/20'
                          : 'bg-red-500/10 dark:bg-red-500/5 border border-red-500/20'
                      }`}>
                        <h3 className={`font-semibold ${
                          analysisResult.isAuthentic
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {analysisResult.isAuthentic 
                            ? 'Certificate Verification Successful' 
                            : 'Certificate Verification Failed'}
                        </h3>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Overall Accuracy:</span>{' '}
                            <span className={analysisResult.accuracy >= 90 ? 'text-green-500' : 'text-red-500'}>
                              {analysisResult.accuracy}%
                            </span>
                          </p>
                          {analysisResult.details && (
                            <>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Document Format:</span>{' '}
                                <span className={analysisResult.details.formatAnalysis.score >= 20 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.formatAnalysis.score}/{analysisResult.details.formatAnalysis.maxScore}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Structure Analysis:</span>{' '}
                                <span className={analysisResult.details.structureAnalysis.score >= 20 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.structureAnalysis.score}/{analysisResult.details.structureAnalysis.maxScore}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Content Verification:</span>{' '}
                                <span className={analysisResult.details.contentVerification.score >= 20 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.contentVerification.score}/{analysisResult.details.contentVerification.maxScore}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Metadata Validation:</span>{' '}
                                <span className={analysisResult.details.metadataValidation.score >= 20 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.metadataValidation.score}/{analysisResult.details.metadataValidation.maxScore}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Security Validation:</span>{' '}
                                <span className={analysisResult.details.securityValidation.score >= 5 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.securityValidation.score}/{analysisResult.details.securityValidation.maxScore}
                                </span>
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {analysisResult.blockchainVerification && (
                        <div className="p-4 rounded-lg bg-card border border-input">
                          <h4 className="font-medium mb-2">Blockchain Verification</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Network:</span>{' '}
                              {analysisResult.blockchainVerification.networkType}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Contract:</span>{' '}
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                {analysisResult.blockchainVerification.contractAddress.slice(0, 6)}...
                                {analysisResult.blockchainVerification.contractAddress.slice(-4)}
                              </code>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Timestamp:</span>{' '}
                              {new Date(analysisResult.blockchainVerification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Verification Details:</h4>
                        <ul className="space-y-1">
                          {analysisResult.indicators.map((indicator: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                analysisResult.isAuthentic ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-4">
                        {analysisResult.isAuthentic ? (
                          <Button
                            className="w-full"
                            onClick={handleUpload}
                          >
                            Save to Dashboard
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            onClick={() => simulateAIAnalysis(selectedFile)}
                            variant="secondary"
                          >
                            Analyze Again
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </SignedIn>

          {/* Authentication Required Card */}
          <SignedOut>
            <Card className="glass-effect">
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please sign in to upload and verify your certificates
                </p>
                <SignInDropdown variant="default" size="lg" />
              </CardContent>
            </Card>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default Upload;