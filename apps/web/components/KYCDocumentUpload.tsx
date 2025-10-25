'use client';

import { useState, useRef } from 'react';
import { Upload, File, Check, X, Eye, Trash2, Camera } from 'lucide-react';
import { api } from '../lib/api';

interface KYCDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  confidence?: number;
  authenticity?: number;
  uploadedAt: string;
}

interface KYCDocumentUploadProps {
  userId: string;
  verificationId: string;
  onDocumentUploaded?: (document: KYCDocument) => void;
}

export default function KYCDocumentUpload({ userId, verificationId, onDocumentUploaded }: KYCDocumentUploadProps) {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'NATIONAL_ID', label: 'National ID', required: true },
    { value: 'PROOF_OF_ADDRESS', label: 'Proof of Address', required: true },
    { value: 'PROOF_OF_INCOME', label: 'Proof of Income', required: true },
    { value: 'SELFIE', label: 'Selfie', required: true },
    { value: 'PASSPORT', label: 'Passport', required: false },
    { value: 'DRIVERS_LICENSE', label: 'Driver\'s License', required: false }
  ];

  const handleFileSelect = async (files: FileList, documentType: string) => {
    if (!files.length) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('verificationId', verificationId);
      formData.append('documentType', documentType);
      formData.append('compress', 'true');

      const response = await api.uploadKYCDocument(formData);
      
      if (response.success) {
        const newDoc: KYCDocument = {
          id: response.data.documentId,
          documentType,
          fileName: response.data.fileName,
          fileSize: response.data.fileSize,
          processingStatus: response.data.processingStatus,
          uploadedAt: new Date().toISOString()
        };
        
        setDocuments(prev => [...prev, newDoc]);
        onDocumentUploaded?.(newDoc);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files, documentType);
  };

  const handlePreview = async (documentId: string, fileName: string) => {
    try {
      const response = await api.getKYCDocumentDownload(documentId, 'preview');
      if (response.success) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.deleteKYCDocument(documentId, 'User requested deletion');
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#28a745';
      case 'PROCESSING': return '#ffc107';
      case 'FAILED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'SELFIE': return <Camera size={20} />;
      default: return <File size={20} />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>KYC Document Upload</h2>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {documentTypes.map((docType) => {
          const existingDoc = documents.find(doc => doc.documentType === docType.value);
          
          return (
            <div
              key={docType.value}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: existingDoc ? '2px solid #28a745' : '1px solid #e9ecef'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#2c3e50' }}>
                    {docType.label}
                    {docType.required && <span style={{ color: '#dc3545', marginLeft: '5px' }}>*</span>}
                  </h4>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    {docType.value === 'SELFIE' ? 'Clear photo of your face' : 'Upload clear, readable document'}
                  </p>
                </div>
                {existingDoc && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Check size={20} style={{ color: '#28a745' }} />
                    <span style={{ color: '#28a745', fontSize: '14px', fontWeight: 'bold' }}>Uploaded</span>
                  </div>
                )}
              </div>

              {existingDoc ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getDocumentIcon(existingDoc.documentType)}
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{existingDoc.fileName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {(existingDoc.fileSize / 1024 / 1024).toFixed(2)} MB • 
                        <span style={{ color: getStatusColor(existingDoc.processingStatus), marginLeft: '5px' }}>
                          {existingDoc.processingStatus}
                        </span>
                        {existingDoc.confidence && (
                          <span style={{ marginLeft: '5px' }}>• {Math.round(existingDoc.confidence * 100)}% confidence</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handlePreview(existingDoc.id, existingDoc.fileName)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(existingDoc.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={(e) => handleDrop(e, docType.value)}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    border: `2px dashed ${dragOver ? '#007bff' : '#ddd'}`,
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    backgroundColor: dragOver ? '#f8f9fa' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = docType.value === 'SELFIE' ? 'image/*' : 'image/*,application/pdf,.doc,.docx';
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) handleFileSelect(files, docType.value);
                    };
                    input.click();
                  }}
                >
                  <Upload size={32} style={{ color: '#007bff', marginBottom: '10px' }} />
                  <div style={{ color: '#2c3e50', fontWeight: 'bold', marginBottom: '5px' }}>
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {docType.value === 'SELFIE' ? 'JPG, PNG (max 10MB)' : 'JPG, PNG, PDF, DOC, DOCX (max 10MB)'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Summary */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Upload Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {documents.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Documents Uploaded</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {documents.filter(d => d.processingStatus === 'COMPLETED').length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Processed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {documents.filter(d => d.processingStatus === 'PROCESSING').length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Processing</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
              {(documents.reduce((sum, doc) => sum + doc.fileSize, 0) / 1024 / 1024).toFixed(1)}MB
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Size</div>
          </div>
        </div>
      </div>
    </div>
  );
}