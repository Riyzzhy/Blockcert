import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { CertificateService } from '../services/certificateService';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
    }
  }
});

// Create new certificate (requires authentication)
router.post('/', 
  ClerkExpressRequireAuth(),
  upload.single('document'),
  async (req, res) => {
    try {
      const { auth } = req;
      const certificateData = {
        ...req.body,
        documentUrl: req.file?.path,
        issuedTo: {
          ...JSON.parse(req.body.issuedTo),
          userId: auth.userId
        },
        issuedBy: JSON.parse(req.body.issuedBy)
      };

      const certificate = await CertificateService.createCertificate(certificateData);
      res.status(201).json(certificate);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get certificate by hash (public route)
router.get('/verify/:hash', async (req, res) => {
  try {
    const certificate = await CertificateService.getCertificateByHash(req.params.hash);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's certificates (requires authentication)
router.get('/user', 
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const { auth } = req;
      const certificates = await CertificateService.getCertificatesByUserId(auth.userId);
      res.json(certificates);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get institution's certificates (requires authentication)
router.get('/institution', 
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const { auth } = req;
      const certificates = await CertificateService.getCertificatesByInstitutionId(auth.userId);
      res.json(certificates);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Update certificate metadata (requires authentication)
router.patch('/:hash/metadata', 
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const certificate = await CertificateService.updateCertificateMetadata(
        req.params.hash,
        req.body.metadata
      );
      res.json(certificate);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Verify certificate (requires authentication)
router.post('/:hash/verify', 
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const certificate = await CertificateService.verifyCertificate(
        req.params.hash,
        req.body.blockchainData
      );
      res.json(certificate);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Search certificates (requires authentication)
router.get('/search', 
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const certificates = await CertificateService.searchCertificates(req.query);
      res.json(certificates);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete certificate (requires authentication)
router.delete('/:hash', 
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const success = await CertificateService.deleteCertificate(req.params.hash);
      if (!success) {
        return res.status(404).json({ error: 'Certificate not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router; 