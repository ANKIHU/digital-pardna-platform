export interface KYCDocument {
  id: string;
  verificationId: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  storageHash: string;
  encryptionKey: string;
  extractedData?: any;
  confidence?: number;
  authenticity?: number;
  processingStatus: DocumentProcessingStatus;
  accessLog?: any;
  retentionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  PASSPORT = 'PASSPORT',
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT',
  PROOF_OF_INCOME = 'PROOF_OF_INCOME',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  SELFIE = 'SELFIE'
}

export enum DocumentProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

export interface KYCAuditLog {
  id: string;
  verificationId: string;
  action: KYCAuditAction;
  performedBy: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export enum KYCAuditAction {
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VIEWED = 'DOCUMENT_VIEWED',
  DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  VERIFICATION_STARTED = 'VERIFICATION_STARTED',
  VERIFICATION_COMPLETED = 'VERIFICATION_COMPLETED',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED'
}

export interface DocumentUploadResponse {
  success: boolean;
  data?: {
    documentId: string;
    fileName: string;
    fileSize: number;
    processingStatus: DocumentProcessingStatus;
  };
  error?: string;
}

export interface DocumentDownloadResponse {
  success: boolean;
  data?: {
    downloadUrl: string;
    expiresIn: number;
    fileName: string;
    fileSize: number;
  };
  error?: string;
}