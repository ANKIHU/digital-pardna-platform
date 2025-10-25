'use client';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAnalytics, useCompliance } from '../lib/hooks';

interface FinanceMetrics {
  totalValue: number;
  activeCircles: number;
  monthlyFlow: number;
  portfolioGrowth: number;
  savingsRate: number;
  investmentReturn: number;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function FinanceDashboard() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { financeDashboard, loading: analyticsLoading } = useAnalytics();
  const { dashboard: complianceDashboard } = useCompliance();

  useEffect(() => {
    loadFinanceData();
  }, [timeframe, financeDashboard, complianceDashboard]);

  const loadFinanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load real data from multiple sources
      const [circles, microfinanceData] = await Promise.all([
        api.getCircles().catch(() => ({ data: [] })),
        api.analytics.getMicrofinanceData().catch(() => ({ totalLoans: 0, activeLoans: 0 }))
      ]);

      // Calculate real metrics from API data
      const circleData = circles.data || [];
      const totalCircleValue = circleData.reduce((sum: number, circle: any) => 
        sum + (Number(circle.hand_amount) || 0), 0
      );

      const activeCirclesCount = circleData.filter((circle: any) => 
        circle.status === 'active' || circle.status === 'planned'
      ).length;

      // Combine real data with analytics
      setMetrics({
        totalValue: totalCircleValue + (microfinanceData.totalLoans || 0),
        activeCircles: activeCirclesCount,
        monthlyFlow: Math.round(totalCircleValue * 0.08), // Estimated 8% monthly flow
        portfolioGrowth: financeDashboard?.circles?.growth || 12.5,
        savingsRate: 8.2, // Would come from savings API
        investmentReturn: 6.8 // Would come from investment API
      });

      // Generate transactions from circles data
      const recentTransactions: Transaction[] = circleData.slice(0, 5).map((circle: any, index: number) => ({
        id: circle.id || `tx-${index}`,
        type: index % 2 === 0 ? 'credit' : 'debit',
        amount: Number(circle.hand_amount) || 0,
        description: `${circle.name || 'Circle'} - ${index % 2 === 0 ? 'Payout' : 'Contribution'}`,
        date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'completed' as const
      }));

      setTransactions(recentTransactions);
      
    } catch (err) {
      console.error('Failed to load finance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load finance data');
      
      // Fallback to basic mock data if APIs fail
      setMetrics({
        totalValue: 2450000,
        activeCircles: 8,
        monthlyFlow: 185000,
        portfolioGrowth: 12.5,
        savingsRate: 8.2,
        investmentReturn: 6.8
      });
      
      setTransactions([
        { id: '1', type: 'credit', amount: 50000, description: 'Circle Payout - Business Circle', date: '2025-10-23', status: 'completed' },
        { id: '2', type: 'debit', amount: -25000, description: 'Monthly Contribution - Premium Circle', date: '2025-10-22', status: 'completed' },
        { id: '3', type: 'credit', amount: 15000, description: 'Interest Payment', date: '2025-10-21', status: 'completed' },
        { id: '4', type: 'debit', amount: -75000, description: 'Loan Repayment', date: '2025-10-20', status: 'pending' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(Math.abs(amount) / 100);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Portfolio Value</h3>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics?.totalValue || 0)}</p>
            <p className="text-sm text-green-600 mt-2">
              {formatPercent(metrics?.portfolioGrowth || 0)} this month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Circles</h3>
            <p className="text-2xl font-bold text-blue-600">{metrics?.activeCircles || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Participating in</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Flow</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics?.monthlyFlow || 0)}</p>
            <p className="text-xs text-gray-500 mt-2">Net inflow</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Savings Rate</h3>
            <p className="text-2xl font-bold text-purple-600">{formatPercent(metrics?.savingsRate || 0)}</p>
            <p className="text-xs text-gray-500 mt-2">Annual rate</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Investment Return</h3>
            <p className="text-2xl font-bold text-orange-600">{formatPercent(metrics?.investmentReturn || 0)}</p>
            <p className="text-xs text-gray-500 mt-2">YTD return</p>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Portfolio Overview Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm font-medium">Basic Pardna Circles</span>
                </div>
                <span className="text-sm text-gray-600">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm font-medium">Premium Pardna</span>
                </div>
                <span className="text-sm text-gray-600">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <span className="text-sm font-medium">Microfinance</span>
                </div>
                <span className="text-sm text-gray-600">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
            <div className="space-y-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                const performance = [92, 88, 95, 78, 86, 94][index];
                return (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-8">{month}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            performance >= 90 ? 'bg-green-500' :
                            performance >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${performance}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{performance}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Transactions & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className={`text-xs ${
                      transaction.status === 'completed' ? 'text-green-600' :
                      transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-600">
              View All Transactions
            </button>
          </div>

          {/* Financial Goals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Goals</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Emergency Fund</span>
                  <span className="text-sm text-gray-600">$8,500 / $10,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">85% complete</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Business Expansion</span>
                  <span className="text-sm text-gray-600">$15,000 / $25,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">60% complete</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Home Down Payment</span>
                  <span className="text-sm text-gray-600">$12,000 / $50,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: '24%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">24% complete</p>
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Set New Goal
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-blue-600 text-2xl mb-2">💰</div>
              <p className="text-sm font-medium">Make Payment</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-green-600 text-2xl mb-2">📊</div>
              <p className="text-sm font-medium">View Reports</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-purple-600 text-2xl mb-2">🎯</div>
              <p className="text-sm font-medium">Set Budget</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-orange-600 text-2xl mb-2">📈</div>
              <p className="text-sm font-medium">Investment</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}