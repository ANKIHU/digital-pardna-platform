import { NextResponse } from 'next/server';

export async function GET() {
  const disputes = [
    {
      id: '1',
      circleId: '1',
      circleName: 'Family Savings Circle',
      reportedBy: 'John Smith',
      type: 'payment_delay',
      description: 'Member has not made payment for 2 months',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-10-20T10:00:00Z',
      assignedTo: null
    },
    {
      id: '2',
      circleId: '2', 
      circleName: 'Business Investment Group',
      reportedBy: 'Sarah Johnson',
      type: 'payout_dispute',
      description: 'Disagreement about payout calculation',
      status: 'in_review',
      priority: 'medium',
      createdAt: '2024-10-18T14:30:00Z',
      assignedTo: 'Admin User'
    }
  ];

  return NextResponse.json({ disputes });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newDispute = {
    id: Date.now().toString(),
    ...body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    assignedTo: null
  };

  return NextResponse.json({ dispute: newDispute });
}