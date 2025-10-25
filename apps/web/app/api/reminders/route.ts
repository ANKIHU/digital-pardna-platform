import { NextResponse } from 'next/server';

export async function GET() {
  const reminders = [
    {
      id: '1',
      type: 'payment_due',
      title: 'Payment Due Tomorrow',
      message: 'Your contribution of $5,000 for Family Savings Circle is due tomorrow.',
      priority: 'high',
      dueDate: '2024-11-15',
      circleId: '1',
      isRead: false
    },
    {
      id: '2',
      type: 'payout_ready',
      title: 'Payout Available',
      message: 'Your payout of $40,000 is ready for collection.',
      priority: 'medium',
      dueDate: '2024-11-20',
      circleId: '2',
      isRead: false
    }
  ];

  return NextResponse.json({ reminders });
}