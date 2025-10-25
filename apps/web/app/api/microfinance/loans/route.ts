import { NextResponse } from 'next/server';

export async function GET() {
  const loans = [
    {
      id: '1',
      amount: 50000,
      purpose: 'Business expansion',
      interestRate: 8.5,
      term: 12,
      status: 'approved',
      monthlyPayment: 4500,
      remainingBalance: 45000,
      nextPaymentDate: '2024-11-15',
      appliedDate: '2024-09-01'
    },
    {
      id: '2',
      amount: 25000,
      purpose: 'Equipment purchase',
      interestRate: 7.2,
      term: 6,
      status: 'pending',
      monthlyPayment: 4400,
      remainingBalance: 25000,
      nextPaymentDate: null,
      appliedDate: '2024-10-20'
    }
  ];

  return NextResponse.json({ loans });
}