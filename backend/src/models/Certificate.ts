import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  title: string;
  description: string;
  issuedTo: {
    name: string;
    email: string;
    userId: string;
  };
  issuedBy: {
    name: string;
    institutionId: string;
  };
  documentHash: string;
  documentUrl: string;
  qrCode: string;
  metadata: {
    degree?: string;
    program?: string;
    graduationDate?: Date;
    grade?: string;
    achievements?: string[];
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  issuedAt: Date;
  expiresAt?: Date;
  verifiedAt?: Date;
  blockchainData?: {
    transactionHash: string;
    blockNumber: number;
    timestamp: number;
  };
}

const CertificateSchema = new Schema<ICertificate>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  issuedTo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    userId: { type: String, required: true }
  },
  issuedBy: {
    name: { type: String, required: true },
    institutionId: { type: String, required: true }
  },
  documentHash: { type: String, required: true, unique: true },
  documentUrl: { type: String, required: true },
  qrCode: { type: String, required: true },
  metadata: {
    degree: String,
    program: String,
    graduationDate: Date,
    grade: String,
    achievements: [String]
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  verifiedAt: Date,
  blockchainData: {
    transactionHash: String,
    blockNumber: Number,
    timestamp: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
CertificateSchema.index({ 'issuedTo.userId': 1 });
CertificateSchema.index({ 'issuedBy.institutionId': 1 });
CertificateSchema.index({ documentHash: 1 }, { unique: true });
CertificateSchema.index({ verificationStatus: 1 });

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema); 