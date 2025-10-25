'use client';

import CustomerDashboard from '../../components/CustomerDashboard';

export default function CustomerPage() {
  // Mock user ID - in real app, this would come from auth context
  const userId = 'user-123';

  return <CustomerDashboard userId={userId} />;
}