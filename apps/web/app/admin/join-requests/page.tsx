'use client';

import JoinRequestManagement from '../../../components/JoinRequestManagement';

export default function JoinRequestsPage() {
  // Mock circle ID - in real app, this would come from URL params or user context
  const circleId = 'circle-123';

  return <JoinRequestManagement circleId={circleId} />;
}