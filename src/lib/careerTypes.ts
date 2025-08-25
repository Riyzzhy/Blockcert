export type CareerType = 'internship' | 'job';

export interface CareerDetails {
  type: CareerType;
  position: string;
  company: string;
  duration?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  skills?: string[];
  achievements?: string[];
}

export interface EnhancedDocumentMetadata {
  fullName: string;
  certificateName: string;
  institution: string;
  startDate: string;
  issueDate: string;
  grades?: string;
  personality: string;
  additionalDetails?: string;
  verified: boolean;
  certificationStamp?: string;
  certificationDate?: string;
  certificationSystem?: string;
  
  // Career-specific fields
  careerType?: CareerType;
  careerDetails?: CareerDetails;
  
  // Security fields
  securityCodes?: {
    sessionId: string;
    forwardCode: string;
    backwardCode: string;
    expiresAt: Date;
  };
}

export interface EnhancedUploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  status: 'pending_verification' | 'verified' | 'failed';
  confidence: number;
  hash: string;
  analysis: string[];
  blockchainTx?: string;
  file: File;
  blob?: Blob;
  metadata: EnhancedDocumentMetadata;
  
  // Career categorization
  careerCategory: CareerType;
  careerDetails?: CareerDetails;
  
  // Security tracking
  securitySession?: {
    sessionId: string;
    createdAt: Date;
    ipAddress?: string;
  };
}