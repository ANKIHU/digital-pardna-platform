'use client';

import KYCDocumentUpload from '../../components/KYCDocumentUpload';

export default function KYCPage() {
  // Mock user data - in real app, this would come from auth context
  const userId = 'user-123';
  const verificationId = 'verification-456';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '20px' }}>
      <KYCDocumentUpload 
        userId={userId}
        verificationId={verificationId}
        onDocumentUploaded={(doc) => {
          console.log('Document uploaded:', doc);
        }}
      />
    </div>
  );
}