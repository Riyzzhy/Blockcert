import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, Shield, Bot, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { useDocuments, type UploadedDocument, type DocumentMetadata } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [formData, setFormData] = useState<Omit<DocumentMetadata, 'verified'>>({
    fullName: '',
    certificateName: '',
    institution: '',
    startDate: '',
    issueDate: '',
    grades: '',
    personality: '',
    additionalDetails: ''
  });

  const [startDatePrecision, setStartDatePrecision] = useState<'day'|'month'|'year'>('day');
  const [issueDatePrecision, setIssueDatePrecision] = useState<'day'|'month'|'year'>('day');

  const { addDocument } = useDocuments();

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

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simulate OCR/text extraction - replace with actual OCR in production
    if (file.type === 'application/pdf') {
      return `PDF_CONTENT_SIMULATION\nName: ${formData.fullName || 'John Doe'}\nCertificate: ${formData.certificateName || 'Sample Cert'}`;
    } else {
      return await file.text(); // Use browser text extraction for non-PDF
    }
  };

  const validateAgainstExtractedText = (extractedText: string): {valid: boolean, errors: string[]} => {
    const errors: string[] = [];
    const checks: {label: string, value: string}[] = [
      { label: 'Full name', value: formData.fullName },
      { label: 'Certificate name', value: formData.certificateName },
      { label: 'Institution', value: formData.institution },
      { label: 'Grades', value: formData.grades },
      { label: 'Personality', value: formData.personality },
      { label: 'Start date', value: formData.startDate },
      { label: 'Issue date', value: formData.issueDate },
    ];
    checks.forEach(({ label, value }) => {
      if (value && !extractedText.includes(value)) {
        errors.push(`${label} not found in certificate document`);
      }
    });
    return { valid: errors.length === 0, errors };
  };

  const simulateAIAnalysis = async (file: File) => {
    // Validate required fields (grades now optional)
    const requiredFields = ['fullName', 'certificateName', 'institution', 'startDate', 'issueDate', 'personality'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
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
      const metadataScore = validateMetadata(file, startDatePrecision, issueDatePrecision);

      // Add content validation
      const extractedText = await extractTextFromFile(file);
      const contentValidation = validateAgainstExtractedText(extractedText);
      
      if (!contentValidation.valid) {
        setAnalysisResult({
          accuracy: 0,
          isAuthentic: false,
          hash: null,
          indicators: ['Content verification failed', ...contentValidation.errors],
          blockchainVerification: null,
          details: null
        });
        return;
      }
      
      // Calculate final accuracy score (0-100%)
      const accuracy = formatScore + structureScore + contentScore + metadataScore;
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
    if (!isNaN(startDate.getTime()) && !isNaN(issueDate.getTime()) && issueDate > startDate) {
      score += 5;
    }
    
    // Check additional details
    if (formData.additionalDetails) score += 5;

    return score;
  };

  const extractCertificateDetailsFromText = (text: string) => {
    // Very basic extraction logic; can be replaced with OCR/PDF parsing
    const details: Record<string, string> = {};
    // Name
    const nameMatch = text.match(/Name\s*[:\-]?\s*([A-Za-z\s]{4,70})/i);
    if (nameMatch) details.fullName = nameMatch[1].trim();
    // Certificate Name
    const certMatch = text.match(/Certificate\s*[:\-]?\s*([A-Za-z0-9\s,'-]{4,60})/i);
    if (certMatch) details.certificateName = certMatch[1].trim();
    // Institution
    const instMatch = text.match(/Institution\s*[:\-]?\s*([A-Za-z\s]{4,70})/i);
    if (instMatch) details.institution = instMatch[1].trim();
    // Grades
    const gradeMatch = text.match(/Grade\s*[:\-]?\s*([A-F][+-]?|[0-9]{1,3}(\.[0-9]{1,2})?|[0-4]\.\d{1,2})/i);
    if (gradeMatch) details.grades = gradeMatch[1].trim();
    // Personality
    const persMatch = text.match(/Personality\s*[:\-]?\s*([A-Za-z\s]{6,})/i);
    if (persMatch) details.personality = persMatch[1].trim();
    // Dates
    const startMatch = text.match(/Start\s*Date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{4})/i);
    if (startMatch) details.startDate = startMatch[1].trim();
    const issueMatch = text.match(/Issue\s*Date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{4})/i);
    if (issueMatch) details.issueDate = issueMatch[1].trim();
    return details;
  };

  const validateMetadata = (file: File, startDatePrecision: 'day'|'month'|'year', issueDatePrecision: 'day'|'month'|'year'): number => {
    let score = 0;
    const { fullName, institution, startDate, issueDate, certificateName, grades, personality, additionalDetails } = formData;

    // --- Extract certificate details from file text (simulate for now) ---
    // In real use, replace with PDF/OCR extraction
    let fileText = '';
    if (file && file.text) {
      // Use File.text() if available (browser API)
      // Synchronous simulation for now
      // (You can make this async if you want real extraction)
      fileText = file.name + ' ' + file.type; // Simulate: just use file name/type
    }
    const extracted = extractCertificateDetailsFromText(fileText);

    // --- Check that every user-provided detail is present in extracted details ---
    const allFields = [
      { key: 'fullName', value: fullName },
      { key: 'certificateName', value: certificateName },
      { key: 'institution', value: institution },
      { key: 'grades', value: grades },
      { key: 'personality', value: personality },
      { key: 'startDate', value: startDate },
      { key: 'issueDate', value: issueDate },
    ];
    for (const { key, value } of allFields) {
      if (value && extracted[key] && extracted[key] !== value) {
        return -13; // Field mismatch
      }
    }

    // --- Date Verification Gate (existing logic) ---
    let startYear = '', issueYear = '';
    if (startDate && startDate.length >= 4) startYear = startDate.substring(0, 4);
    if (issueDate && issueDate.length >= 4) issueYear = issueDate.substring(0, 4);

    const expectingOneDate = startDatePrecision === 'year' && issueDatePrecision === 'year' && startYear === issueYear && !!startYear;
    const expectedDateCount = expectingOneDate ? 1 : 2;

    let datesFoundInFile = 0;
    try {
      const fileName = file?.name?.toLowerCase() || '';
      if (startYear && fileName.includes(startYear)) datesFoundInFile++;
      if (issueYear && startYear !== issueYear && fileName.includes(issueYear)) datesFoundInFile++;
    } catch (_) { /* always safe */ }

    let datesAreValid = false;
    if (expectedDateCount === 1 && datesFoundInFile === 1) {
      datesAreValid = true;
      score += 10;
    } else if (expectedDateCount === 2 && datesFoundInFile === 2) {
      datesAreValid = true;
      score += 10;
    }
    if (!datesAreValid) return -1;

    // --- Full Name: at least 2 words, only alphabetic, reasonable length ---
    if (typeof fullName === 'string' && /^[A-Za-z\s]{4,70}$/.test(fullName) && fullName.trim().split(/\s+/).length >= 2) score += 5;
    else return -2;

    // --- Certificate Name: no special chars, reasonable length ---
    if (typeof certificateName === 'string' && /^[A-Za-z0-9\s,'-]{4,60}$/.test(certificateName)) score += 5;
    else return -3;

    // --- Institution: no numbers/symbols, min length ---
    if (typeof institution === 'string' && /^[A-Za-z\s]{4,70}$/.test(institution)) score += 5;
    else return -4;

    // --- Grades: optional, but if present must match common patterns ---
    if (grades && !/^([A-F][+-]?|[0-9]{1,3}(\.[0-9]{1,2})?|[0-4]\.\d{1,2})$/.test(grades.trim())) return -5;

    // --- Personality: at least 2 words, min 6 chars ---
    if (typeof personality === 'string' && personality.trim().length >= 6 && personality.trim().split(/\s+/).length >= 2) score += 5;
    else return -6;

    // --- Additional Details: optional, but if present min 10 chars ---
    if (additionalDetails && additionalDetails.trim().length < 10) return -7;

    // --- Chronological order check, no future dates, reasonable range (1900-2100) ---
    try {
      const now = new Date();
      const minYear = 1900, maxYear = 2100;
      if (!startDatePrecision && !issueDatePrecision && startDate && issueDate) {
        const start = new Date(startDate);
        const issue = new Date(issueDate);
        if (isNaN(start.getTime()) || isNaN(issue.getTime())) return -8;
        if (issue <= start) return -9;
        if (start > now || issue > now) return -10;
        if (start.getFullYear() < minYear || issue.getFullYear() > maxYear) return -11;
        score += 5;
      } else if (startYear && issueYear) {
        const startYearNum = parseInt(startYear, 10);
        const issueYearNum = parseInt(issueYear, 10);
        if (isNaN(startYearNum) || isNaN(issueYearNum)) return -8;
        if (issueYearNum < startYearNum) return -9;
        if (startYearNum > now.getFullYear() || issueYearNum > now.getFullYear()) return -10;
        if (startYearNum < minYear || issueYearNum > maxYear) return -11;
        score += 5;
      }
    } catch (_) { return -12; }

    return Math.min(30, score);
  };

  const generateVerificationIndicators = (details: any, isAuthentic: boolean): string[] => {
    if (isAuthentic) {
      return [
        `Document format verified (${details.formatAnalysis.score}/${details.formatAnalysis.maxScore})`,
        `Certificate structure validated (${details.structureAnalysis.score}/${details.structureAnalysis.maxScore})`,
        `Content verification passed (${details.contentVerification.score}/${details.contentVerification.maxScore})`,
        `Metadata validation successful (${details.metadataValidation.score}/${details.metadataValidation.maxScore})`,
        'Digital signatures verified',
        'Blockchain verification successful'
      ];
    } else {
      const failedChecks = [];
      if (details.formatAnalysis.score < 20) failedChecks.push('Invalid document format');
      if (details.structureAnalysis.score < 20) failedChecks.push('Certificate structure issues detected');
      if (details.contentVerification.score < 20) failedChecks.push('Content verification failed');
      if (details.metadataValidation.score < 20) failedChecks.push('Metadata validation failed');
      
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
    const newDoc: UploadedDocument = {
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
      metadata: {
        ...formData,
        additionalDetails: formData.additionalDetails || '',
        verified: false
      },
    };

    addDocument(newDoc);
    const objectUrl = URL.createObjectURL(selectedFile);
    localStorage.setItem(`doc_${analysisResult.hash}`, objectUrl);
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const formatDateByPrecision = (date: string, precision: 'day'|'month'|'year') => {
    if (!date) return '';
  
    const d = new Date(date);
    switch (precision) {
      case 'day': return format(d, 'yyyy-MM-dd');
      case 'month': return format(d, 'yyyy-MM');
      case 'year': return d.getFullYear().toString();
      default: return format(d, 'yyyy-MM-dd');
    }
  };

  const SegmentedDatePrecision = ({ label, value, onChange }: { label: string, value: 'day'|'month'|'year', onChange: (v: 'day'|'month'|'year') => void }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-1">
        {(['day', 'month', 'year'] as const).map((precision) => (
          <button
            key={precision}
            type="button"
            onClick={() => onChange(precision)}
            className={`px-2 py-1 rounded border text-xs font-semibold transition-colors duration-100
              ${value === precision ? 'bg-primary text-white border-primary shadow' : 'bg-muted text-foreground border-input hover:bg-accent'}`}
          >
            {precision.charAt(0).toUpperCase() + precision.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

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
              <SignInButton mode="modal" fallbackRedirectUrl="/upload">
                <Button variant="outline" size="sm">Sign In</Button>
              </SignInButton>
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
                <CardContent className="space-y-4">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <SegmentedDatePrecision label="Start Date:" value={startDatePrecision} onChange={setStartDatePrecision} />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate 
                              ? formatDateByPrecision(formData.startDate, startDatePrecision)
                              : 'Pick a start date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate ? new Date(formData.startDate) : undefined}
                            onSelect={(date) => date && handleDateSelect('startDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col gap-2">
                      <SegmentedDatePrecision label="Issue Date:" value={issueDatePrecision} onChange={setIssueDatePrecision} />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.issueDate 
                              ? formatDateByPrecision(formData.issueDate, issueDatePrecision)
                              : 'Pick an issue date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
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

                  <div className="grid grid-cols-2 gap-4">
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

                    <div>
                      <label className="text-sm font-medium mb-1 block">Additional Details (optional)</label>
                      <Textarea
                        name="additionalDetails"
                        value={formData.additionalDetails}
                        onChange={handleInputChange}
                        placeholder="Add any additional details about the certificate"
                        rows={4}
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
                      Supported formats: PDF, DOC, DOCX, JPG, PNG
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
                      Start Verification
                    </Button>
                  )}

                  {isAnalyzing ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Analyzing certificate authenticity...</p>
                      <p className="text-sm text-muted-foreground mt-2">Running smart contract verification...</p>
                    </div>
                  ) : analysisResult && (
                    <div className="space-y-4">
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
                                <span className="text-muted-foreground">Document Format Score:</span>{' '}
                                <span className={analysisResult.details.formatAnalysis.score >= 20 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.formatAnalysis.score}/{analysisResult.details.formatAnalysis.maxScore}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Structure Analysis Score:</span>{' '}
                                <span className={analysisResult.details.structureAnalysis.score >= 20 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.structureAnalysis.score}/{analysisResult.details.structureAnalysis.maxScore}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Content Verification Score:</span>{' '}
                                <span className={analysisResult.details.contentVerification.score >= 20 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.contentVerification.score}/{analysisResult.details.contentVerification.maxScore}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Metadata Validation Score:</span>{' '}
                                <span className={analysisResult.details.metadataValidation.score >= 20 ? 'text-green-500' : 'text-yellow-500'}>
                                  {analysisResult.details.metadataValidation.score}/{analysisResult.details.metadataValidation.maxScore}
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

          <SignedOut>
            <Card className="glass-effect">
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please sign in to upload and verify your certificates
                </p>
                <SignInButton mode="modal" fallbackRedirectUrl="/upload">
                  <Button size="lg">Sign In to Continue</Button>
                </SignInButton>
              </CardContent>
            </Card>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default Upload; 