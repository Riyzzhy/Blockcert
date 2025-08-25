import React, { useState } from 'react';
import { useDocuments } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Search, Filter, Eye, Download, QrCode, Trash2, CheckCircle, AlertTriangle, FileText, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { SignInDropdown } from '@/components/SignInDropdown';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';
import { BASE_URL } from '@/lib/config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { documents, removeDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);

  // Calculate document statistics
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter(doc => doc.status === 'verified').length;
  const pendingDocs = documents.filter(doc => doc.status === 'pending_verification').length;

  // Filter documents based on search and status
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.metadata?.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.metadata?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDocument = (docId: string) => {
    navigate(`/document/${docId}`);
  };

  const handleDownload = async (doc: any, format: string = 'pdf') => {
    // Check if certificate is verified before allowing download
    if (doc.status === 'pending_verification' || doc.status === 'pending') {
      alert('Certificate must be verified first before downloading. Please verify the certificate.');
      return;
    }

    // Handle original file download with BlockCert stamp overlay
    if (format === 'original') {
      if (doc.blob || doc.file) {
        const fileBlob = doc.blob || doc.file;
        
        // For image files, add stamp overlay directly on the image
        if (fileBlob.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            // Create canvas with same dimensions as image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Add BlockCert stamp overlay
            const stampHeight = Math.max(60, img.height * 0.08);
            const stampWidth = Math.max(300, img.width * 0.4);
            
            // Semi-transparent background for stamp
            ctx.fillStyle = 'rgba(30, 64, 175, 0.9)';
            ctx.fillRect(img.width - stampWidth - 20, 20, stampWidth, stampHeight);
            
            // White text for stamp
            ctx.fillStyle = 'white';
            ctx.font = `bold ${Math.max(14, stampHeight * 0.25)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('✓ BY BLOCKCERT CERTIFIED', 
              img.width - stampWidth/2 - 20, 
              20 + stampHeight * 0.4);
            
            // Add smaller details
            ctx.font = `${Math.max(10, stampHeight * 0.18)}px Arial`;
            ctx.fillText(`ID: ${doc.id.substring(0, 8)}... | ${new Date().toLocaleDateString()}`, 
              img.width - stampWidth/2 - 20, 
              20 + stampHeight * 0.7);
            
            // Convert canvas to blob and download
            canvas.toBlob((stampedBlob) => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(stampedBlob);
              link.download = `BlockCert-${doc.name}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }, fileBlob.type);
          };
          
          img.src = URL.createObjectURL(fileBlob);
        } 
        // For PDF files, create a stamped version
        else if (fileBlob.type === 'application/pdf') {
          // Create HTML wrapper with embedded PDF and stamp
          const stampedHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlockCert Certified - ${doc.name}</title>
<style>
  body { 
    margin: 0; 
    padding: 0; 
    font-family: Arial, sans-serif; 
    position: relative;
    background: #f5f5f5;
  }
  .certification-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    color: white;
    padding: 10px 20px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    z-index: 1000;
    font-size: 14px;
    font-weight: bold;
  }
  .pdf-container {
    width: 100%;
    height: 100vh;
    border: none;
    margin-top: 50px;
  }
  .stamp-corner {
    position: fixed;
    top: 60px;
    right: 20px;
    background: rgba(30, 64, 175, 0.95);
    color: white;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
    z-index: 1001;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  @media print {
    .certification-overlay, .stamp-corner {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
  }
</style>
</head>
<body>
  <div class="certification-overlay">
    ✓ BY BLOCKCERT CERTIFIED - ${doc.name} - Verified: ${new Date().toLocaleDateString()}
  </div>
  <div class="stamp-corner">
    ID: ${doc.id.substring(0, 8)}...<br>
    ${doc.blockchainTx ? `TX: ${doc.blockchainTx.substring(0, 8)}...` : ''}
  </div>
  <embed src="${URL.createObjectURL(fileBlob)}" type="application/pdf" class="pdf-container">
</body>
</html>`;
          
          const stampedBlob = new Blob([stampedHTML], { type: 'text/html' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(stampedBlob);
          link.download = `BlockCert-${doc.name.replace('.pdf', '.html')}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        } 
        // For other file types, create downloadable file with stamp info
        else {
          // Create a text file with stamp information alongside original file
          const stampInfo = `
BLOCKCERT CERTIFICATION STAMP
=============================
✓ BY BLOCKCERT CERTIFIED

Original File: ${doc.name}
Certificate ID: ${doc.id}
Hash ID: ${doc.hash}
${doc.blockchainTx ? `Transaction ID: ${doc.blockchainTx}` : ''}
Verification Status: ${doc.status.toUpperCase()}
Confidence: ${doc.confidence}%
Certification Date: ${new Date().toLocaleDateString()}
Institution: ${doc.metadata?.institution || 'Not specified'}

This file has been verified and certified by BlockCert blockchain verification system.
Original file is attached/referenced above.
`;
          
          // Create a zip-like approach by creating HTML page with download links
          const stampedHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlockCert Certified - ${doc.name}</title>
<style>
  body { 
    margin: 0; 
    padding: 20px; 
    font-family: Arial, sans-serif; 
    background: #f5f5f5;
  }
  .certification-header {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    color: white;
    padding: 20px;
    text-align: center;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  .stamp {
    font-size: 1.5em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 10px;
  }
  .file-container {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
  }
  .download-btn {
    display: inline-block;
    padding: 15px 30px;
    background: #1e40af;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    margin: 10px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .download-btn:hover {
    background: #1d4ed8;
  }
  .cert-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: left;
    white-space: pre-line;
    font-family: monospace;
    font-size: 12px;
  }
</style>
</head>
<body>
  <div class="certification-header">
    <div class="stamp">✓ BY BLOCKCERT CERTIFIED</div>
    <div>Original File with Blockchain Verification</div>
  </div>
  
  <div class="file-container">
    <h3>📄 ${doc.name}</h3>
    <p>This file has been certified by BlockCert blockchain verification system.</p>
    
    <a href="${URL.createObjectURL(fileBlob)}" download="${doc.name}" class="download-btn">
      📥 Download Original File
    </a>
    
    <div class="cert-info">${stampInfo}</div>
  </div>
</body>
</html>`;
          
          const stampedBlob = new Blob([stampedHTML], { type: 'text/html' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(stampedBlob);
          link.download = `BlockCert-${doc.name.split('.')[0]}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
      } else {
        alert('Original file not available for download.');
      }
      return;
    }

    // Create comprehensive certificate document
    const generateCertificateHTML = () => {
      const currentDate = new Date().toLocaleDateString();
      const verificationUrl = `${BASE_URL}/verify?hash=${doc.hash}`;
      
      return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Certificate - ${doc.metadata?.certificateName || doc.name}</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: 'Georgia', serif; 
        line-height: 1.6;
        color: #2c3e50;
        background: #ffffff;
        padding: 40px 20px;
    }
    .certificate-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .certificate-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 30px;
        text-align: center;
        position: relative;
    }
    .certificate-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
        opacity: 0.3;
    }
    .certificate-title {
        font-size: 2.2em;
        font-weight: bold;
        margin-bottom: 8px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        position: relative;
        z-index: 1;
    }
    .certificate-subtitle {
        font-size: 1.1em;
        opacity: 0.9;
        margin-bottom: 12px;
        position: relative;
        z-index: 1;
    }
    .verification-badge {
        display: inline-block;
        padding: 8px 16px;
        background: ${doc.status === 'verified' ? '#10b981' : doc.status === 'pending_verification' ? '#f59e0b' : '#ef4444'};
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        position: relative;
        z-index: 1;
    }
    .certificate-body {
        padding: 30px;
    }
    .section {
        margin-bottom: 25px;
    }
    .section-title {
        font-size: 1.4em;
        font-weight: bold;
        color: #1e40af;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e5e7eb;
        position: relative;
    }
    .section-title::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 50px;
        height: 2px;
        background: #1e40af;
    }
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 15px;
        margin-bottom: 15px;
    }
    .info-item {
        background: #f8fafc;
        padding: 15px;
        border-radius: 8px;
        border-left: 3px solid #1e40af;
    }
    .info-label {
        font-weight: 600;
        color: #374151;
        font-size: 0.85em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 5px;
    }
    .info-value {
        color: #111827;
        font-size: 1em;
        word-wrap: break-word;
    }
    .verification-section {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #0ea5e9;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        position: relative;
    }
    .verification-section::before {
        content: '🔒';
        position: absolute;
        top: -12px;
        left: 20px;
        background: white;
        padding: 0 8px;
        font-size: 1.2em;
    }
    .hash-display {
        font-family: 'Courier New', monospace;
        background: rgba(255,255,255,0.8);
        padding: 12px;
        border-radius: 6px;
        word-break: break-all;
        font-size: 0.8em;
        border: 1px solid #cbd5e1;
        margin: 8px 0;
    }
    .confidence-meter {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
    }
    .confidence-bar {
        flex: 1;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }
    .confidence-fill {
        height: 100%;
        background: ${doc.confidence > 90 ? '#10b981' : doc.confidence > 70 ? '#f59e0b' : '#ef4444'};
        width: ${doc.confidence}%;
        transition: width 0.3s ease;
    }
    .certificate-footer {
        background: #f8fafc;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 0.9em;
    }
    
    /* Print-specific styles */
    @media print {
        body { 
            background: white !important; 
            padding: 0 !important; 
        }
        .certificate-container {
            box-shadow: none !important;
            border: 1px solid #000 !important;
            page-break-inside: avoid;
        }
        .certificate-header {
            background: #1e40af !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        .verification-section {
            background: #f0f9ff !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
    }
</style>
</head>
<body>
<div class="certificate-container">
    <div class="certificate-header">
        <div class="certificate-title">Digital Certificate</div>
        <div class="certificate-subtitle">Blockchain-Verified Credential</div>
        <div class="verification-badge">${doc.status.toUpperCase()}</div>
    </div>
    
    <div class="certificate-body">
        <div class="section">
            <div class="section-title">Certificate Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Full Name</div>
                    <div class="info-value">${doc.metadata?.fullName || 'Not specified'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Certificate Name</div>
                    <div class="info-value">${doc.metadata?.certificateName || doc.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Institution</div>
                    <div class="info-value">${doc.metadata?.institution || 'Not specified'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Issue Date</div>
                    <div class="info-value">${doc.metadata?.issueDate || 'Not specified'}</div>
                </div>
                ${doc.metadata?.startDate ? `
                <div class="info-item">
                    <div class="info-label">Start Date</div>
                    <div class="info-value">${doc.metadata.startDate}</div>
                </div>
                ` : ''}
                ${doc.metadata?.grades ? `
                <div class="info-item">
                    <div class="info-label">Grades</div>
                    <div class="info-value">${doc.metadata.grades}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">Personality</div>
                    <div class="info-value">${doc.metadata?.personality || 'Not specified'}</div>
                </div>
                ${doc.metadata?.additionalDetails ? `
                <div class="info-item">
                    <div class="info-label">Additional Details</div>
                    <div class="info-value">${doc.metadata.additionalDetails}</div>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="section">
            <div class="section-title">File Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">File Name</div>
                    <div class="info-value">${doc.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">File Type</div>
                    <div class="info-value">${doc.type}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">File Size</div>
                    <div class="info-value">${(doc.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Upload Date</div>
                    <div class="info-value">${new Date(doc.uploadDate).toLocaleDateString()}</div>
                </div>
            </div>
        </div>

        <div class="verification-section">
            <div class="section-title">Verification Details</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">${doc.status}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Hash_ID</div>
                    <div class="hash-display">${doc.hash}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Certificate_ID</div>
                    <div class="hash-display">${doc.id}</div>
                </div>
                ${doc.blockchainTx ? `
                <div class="info-item">
                    <div class="info-label">Transaction_ID</div>
                    <div class="hash-display">${doc.blockchainTx}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">Verification URL</div>
                    <div class="info-value"><a href="${verificationUrl}" target="_blank">${verificationUrl}</a></div>
                </div>
            </div>
            
            <div class="info-item">
                <div class="info-label">Confidence Level</div>
                <div class="confidence-meter">
                    <div class="confidence-bar">
                        <div class="confidence-fill"></div>
                    </div>
                    <span class="info-value">${doc.confidence}%</span>
                </div>
            </div>
        </div>

        ${doc.analysis ? `
        <div class="section">
            <div class="section-title">AI Analysis Results</div>
            <div class="info-item">
                <div class="info-value">${doc.analysis}</div>
            </div>
        </div>
        ` : ''}
    </div>
    
    <div class="certificate-footer">
        <p>This certificate was generated on ${currentDate}</p>
        <p>Verify authenticity at: <a href="${verificationUrl}" target="_blank">${verificationUrl}</a></p>
        <p>Powered by Blockchain Certificate Verification System</p>
    </div>
</div>
</body>
</html>`;
    };

    switch (format) {
      case 'html':
        const htmlContent = generateCertificateHTML();
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlLink = document.createElement('a');
        htmlLink.href = htmlUrl;
        htmlLink.download = `${doc.metadata?.certificateName || doc.name}-certificate.html`;
        document.body.appendChild(htmlLink);
        htmlLink.click();
        document.body.removeChild(htmlLink);
        URL.revokeObjectURL(htmlUrl);
        break;

      case 'pdf':
        // Direct PDF download using browser print
        const printWindow = window.open('', 'Print Certificate', 'height=800,width=1000');
        if (printWindow) {
          printWindow.document.write(generateCertificateHTML());
          printWindow.document.close();
          
          // Wait for content to load then trigger print
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 500);
          };
        }
        break;

      case 'json':
        const certificateData = {
          certificateInfo: {
            fullName: doc.metadata?.fullName || 'Not specified',
            certificateName: doc.metadata?.certificateName || doc.name,
            institution: doc.metadata?.institution || 'Not specified',
            issueDate: doc.metadata?.issueDate || 'Not specified',
            startDate: doc.metadata?.startDate || 'Not specified',
            grades: doc.metadata?.grades || 'Not specified',
            personality: doc.metadata?.personality || 'Not specified',
            additionalDetails: doc.metadata?.additionalDetails || 'Not specified'
          },
          fileInfo: {
            fileName: doc.name,
            fileType: doc.type,
            fileSize: `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
            uploadDate: new Date(doc.uploadDate).toLocaleDateString()
          },
          verification: {
            status: doc.status,
            confidence: `${doc.confidence}%`,
            blockchainHash: doc.hash,
            transactionId: doc.blockchainTx || 'Not available',
            verificationUrl: `${BASE_URL}/verify?hash=${doc.hash}`
          },
          analysis: doc.analysis || 'No analysis available',
          generatedAt: new Date().toLocaleString()
        };

        const jsonBlob = new Blob([JSON.stringify(certificateData, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `${doc.metadata?.certificateName || doc.name}-data.json`;
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);
        break;
    }
  };

  const handleGenerateQR = async (doc: any) => {
    try {
      const verificationUrl = `${BASE_URL}/verify?hash=${doc.hash}`;
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
      link.download = `qr-${currentQrCode.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (docId: string) => {
    setSelectedDocId(docId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocId) {
      removeDocument(selectedDocId);
      setDeleteDialogOpen(false);
      setSelectedDocId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">verified</Badge>;
      case 'pending_verification':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">pending</Badge>;
      default:
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">failed</Badge>;
    }
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
              <SignInDropdown fallbackUrl="/dashboard" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      <div className="container w-full px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Link to="/upload">
            <Button>
              Upload New Certificate
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Certificates</p>
                <h2 className="text-3xl font-bold mt-2">{totalDocs}</h2>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-75" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <h2 className="text-3xl font-bold mt-2">{verifiedDocs}</h2>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-75" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h2 className="text-3xl font-bold mt-2">{pendingDocs}</h2>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-75" />
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter ? `Filter: ${statusFilter}` : 'Filter'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All Certificates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('verified')}>
                Verified Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending_verification')}>
                Pending Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{doc.name}</h3>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on {doc.uploadDate} • {doc.metadata?.institution}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Hash:</span>{' '}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {doc.hash.slice(0, 8)}...{doc.hash.slice(-8)}
                        </code>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Confidence:</span>{' '}
                        <span className={doc.confidence > 90 ? 'text-green-500' : doc.confidence > 70 ? 'text-yellow-500' : 'text-red-500'}>
                          {doc.confidence}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="View Certificate"
                      onClick={() => handleViewDocument(doc.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(doc, 'pdf')}>
                          Download as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(doc, 'html')}>
                          Download as HTML
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(doc, 'json')}>
                          Download as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(doc, 'original')}>
                          Download Original File
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Generate QR Code"
                      onClick={() => handleGenerateQR(doc)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Delete" 
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No certificates found</h3>
              <p className="text-muted-foreground">
                {documents.length === 0
                  ? "You haven't uploaded any certificates yet"
                  : "No certificates match your search criteria"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the certificate
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

export default Dashboard;