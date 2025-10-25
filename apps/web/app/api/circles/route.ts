import { NextResponse } from 'next/server';

export async function GET() {
  const circles = [
    {
      id: '1',
      name: 'Family Savings Circle',
      description: 'Monthly family savings for emergencies',
      memberCount: 8,
      maxMembers: 10,
      contributionAmount: 5000,
      frequency: 'monthly',
      status: 'active',
      nextPayoutDate: '2024-11-15',
      totalPool: 40000,
      currentRound: 3,
      isAdmin: true
    },
    {
      id: '2', 
      name: 'Business Investment Group',
      description: 'Quarterly business investment circle',
      memberCount: 12,
      maxMembers: 15,
      contributionAmount: 15000,
      frequency: 'quarterly',
      status: 'active',
      nextPayoutDate: '2024-12-01',
      totalPool: 180000,
      currentRound: 1,
      isAdmin: false
    }
  ];

  return NextResponse.json({ circles });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newCircle = {
    id: Date.now().toString(),
    ...body,
    memberCount: 1,
    status: 'active',
    currentRound: 1,
    isAdmin: true,
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({ circle: newCircle });
}