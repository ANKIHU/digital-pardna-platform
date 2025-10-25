import { NextResponse } from 'next/server';

export async function GET() {
  const analytics = {
    totalCircles: 25,
    activeMembers: 180,
    totalVolume: 2500000,
    monthlyGrowth: 15.2,
    circlesByStatus: {
      active: 20,
      pending: 3,
      completed: 2
    },
    revenueMetrics: {
      monthlyRevenue: 125000,
      yearlyRevenue: 1200000,
      averageCircleSize: 12
    },
    userEngagement: {
      dailyActiveUsers: 85,
      weeklyActiveUsers: 150,
      monthlyActiveUsers: 180
    }
  };

  return NextResponse.json(analytics);
}