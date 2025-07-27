import { Certificate, ICertificate } from '../models/Certificate';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class CertificateService {
  // Generate document hash
  private static generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate QR code
  private static async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Create new certificate
  static async createCertificate(data: Partial<ICertificate>): Promise<ICertificate> {
    try {
      // Generate document hash
      const documentString = JSON.stringify({
        title: data.title,
        issuedTo: data.issuedTo,
        issuedBy: data.issuedBy,
        issuedAt: new Date(),
        metadata: data.metadata
      });
      const documentHash = this.generateHash(documentString);

      // Generate verification URL
      const verificationUrl = `${process.env.FRONTEND_URL}/verify/${documentHash}`;

      // Generate QR code
      const qrCode = await this.generateQRCode(verificationUrl);

      // Create certificate
      const certificate = new Certificate({
        ...data,
        documentHash,
        qrCode,
        verificationStatus: 'pending'
      });

      await certificate.save();
      return certificate;
    } catch (error) {
      throw new Error(`Failed to create certificate: ${error}`);
    }
  }

  // Get certificate by hash
  static async getCertificateByHash(hash: string): Promise<ICertificate | null> {
    return Certificate.findOne({ documentHash: hash });
  }

  // Get certificates by user ID
  static async getCertificatesByUserId(userId: string): Promise<ICertificate[]> {
    return Certificate.find({ 'issuedTo.userId': userId });
  }

  // Get certificates by institution ID
  static async getCertificatesByInstitutionId(institutionId: string): Promise<ICertificate[]> {
    return Certificate.find({ 'issuedBy.institutionId': institutionId });
  }

  // Verify certificate
  static async verifyCertificate(hash: string, blockchainData: ICertificate['blockchainData']): Promise<ICertificate> {
    const certificate = await Certificate.findOne({ documentHash: hash });
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    certificate.verificationStatus = 'verified';
    certificate.verifiedAt = new Date();
    certificate.blockchainData = blockchainData;

    await certificate.save();
    return certificate;
  }

  // Update certificate metadata
  static async updateCertificateMetadata(
    hash: string,
    metadata: ICertificate['metadata']
  ): Promise<ICertificate> {
    const certificate = await Certificate.findOne({ documentHash: hash });
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    certificate.metadata = { ...certificate.metadata, ...metadata };
    await certificate.save();
    return certificate;
  }

  // Delete certificate
  static async deleteCertificate(hash: string): Promise<boolean> {
    const result = await Certificate.deleteOne({ documentHash: hash });
    return result.deletedCount === 1;
  }

  // Search certificates
  static async searchCertificates(query: {
    title?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<ICertificate[]> {
    const searchQuery: any = {};

    if (query.title) {
      searchQuery.title = { $regex: query.title, $options: 'i' };
    }
    if (query.status) {
      searchQuery.verificationStatus = query.status;
    }
    if (query.fromDate || query.toDate) {
      searchQuery.issuedAt = {};
      if (query.fromDate) {
        searchQuery.issuedAt.$gte = query.fromDate;
      }
      if (query.toDate) {
        searchQuery.issuedAt.$lte = query.toDate;
      }
    }

    return Certificate.find(searchQuery).sort({ issuedAt: -1 });
  }
} 