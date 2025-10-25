'use client';

import CircleJoinProcess from '../../components/CircleJoinProcess';

export default function JoinPage() {
  // Mock circle data - in real app, this would come from URL params or API
  const mockCircle = {
    id: 'circle-123',
    name: 'Kingston Savings Circle',
    amount: 500,
    duration: 12,
    currentMembers: 8,
    maxMembers: 12,
    nextDraw: 'January 15, 2024'
  };

  return <CircleJoinProcess circle={mockCircle} />;
}