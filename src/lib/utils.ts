import { useState, useEffect } from 'react';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ---------------------------
// Utility function
// ---------------------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------
// Types
// ---------------------------

export interface DocumentMetadata {
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
}

export interface UploadedDocument {
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
  metadata: DocumentMetadata;
}

export interface DocumentsContextType {
  documents: UploadedDocument[];
  addDocument: (doc: UploadedDocument) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: UploadedDocument['status'], blockchainTx?: string, confidence?: number) => void;
}

// ---------------------------
// Hook
// ---------------------------

const STORAGE_KEY = 'documents';

export const useDocuments = (): DocumentsContextType => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // Load on mount
  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem(STORAGE_KEY);
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      }
    } catch (err) {
      console.error('Failed to read documents from localStorage:', err);
      // Keep state as empty array; app will still function in-memory.
    }
  }, []);

  // Helper to persist safely
  const persist = (docs: UploadedDocument[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch (err) {
      console.error('Failed to write documents to localStorage:', err);
      // Fallback: nothing else to do, but UI remains usable with in-memory state.
    }
  };

  const addDocument = (doc: UploadedDocument) => {
    setDocuments(prev => {
      const updated = [...prev, doc];
      persist(updated);
      return updated;
    });
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => {
      const updated = prev.filter(doc => doc.id !== id);
      persist(updated);
      return updated;
    });
  };

  const updateDocumentStatus = (id: string, status: UploadedDocument['status'], blockchainTx?: string, confidence?: number) => {
    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === id) {
          return { ...doc, status, blockchainTx, confidence };
        }
        return doc;
      });
      persist(updated);
      return updated;
    });
  };

  return { documents, addDocument, removeDocument, updateDocumentStatus };
};
