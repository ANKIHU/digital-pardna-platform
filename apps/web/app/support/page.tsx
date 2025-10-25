'use client';

import DisputeResolution from '../../components/DisputeResolution';

export default function SupportPage() {
  // Mock user ID - in real app, this would come from auth context
  const userId = 'user-123';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '20px' }}>
      <DisputeResolution userId={userId} />
    </div>
  );
}