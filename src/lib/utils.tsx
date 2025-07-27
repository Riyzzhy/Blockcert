import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React, { createContext, useContext, useState } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface DocumentMetadata {
  fullName: string;
  certificateName: string;  // Changed from documentName
  institution: string;
  startDate: string;
  issueDate: string;
  grades: string;
  personality: string;
  additionalDetails?: string;
  verified: boolean;
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
  metadata: DocumentMetadata;
}

interface DocumentContextType {
  documents: UploadedDocument[];
  addDocument: (doc: UploadedDocument) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: UploadedDocument['status'], blockchainTx?: string, confidence?: number) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentProvider');
  return ctx;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const addDocument = (doc: UploadedDocument) => setDocuments(docs => [...docs, doc]);
  
  const removeDocument = (id: string) => setDocuments(docs => docs.filter(d => d.id !== id));
  
  const updateDocumentStatus = (id: string, status: UploadedDocument['status'], blockchainTx?: string, confidence?: number) => {
    setDocuments(docs => docs.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status,
          blockchainTx,
          confidence: confidence !== undefined ? confidence : d.confidence,
          metadata: {
            ...d.metadata,
            verified: status === 'verified'
          }
        };
      }
      return d;
    }));
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, removeDocument, updateDocumentStatus }}>
      {children}
    </DocumentContext.Provider>
  );
};
