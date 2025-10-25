'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

interface RevenueMetrics {
  totalRevenue: number;
  subscriptionRevenue: number;
  transactionFees: number;
  premiumServices: number;
  monthlyGrowth: number;
}

interface SubscriptionMetrics {
  totalSubscriptions: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  churnRate: number;
  conversionRate: number;
}

export default function BillingAdminDashboard() {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 125000,
    subscriptionRevenue: 75000,
    transactionFees: 43750,
    premiumServices: 6250,
    monthlyGrowth: 15.3
  });

  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics>({
    totalSubscriptions: 3250,
    freeUsers: 2500,
    proUsers: 650,
    enterpriseUsers: 100,
    churnRate: 4.2,
    conversionRate: 12.8
  });

  const [recentTransactions, setRecentTransactions] = useState([
    { id: '1', user: 'Marcus Johnson', amount: 25, type: 'Pro Subscription', date: '2024-01-15' },
    { id: '2', user: 'Sarah Williams', amount: 50, type: 'Platform Fee', date: '2024-01-15' },
    { id: '3', user: 'David Brown', amount: 100, type: 'Enterprise Subscription', date: '2024-01-14' },
    { id: '4', user: 'Lisa Davis', amount: 1.99, type: 'Instant Transfer', date: '2024-01-14' }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Billing Administration</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      {/* Revenue Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <DollarSign size={24} style={{ color: '#28a745', marginRight: '10px' }} />
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Total Revenue</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
            {formatCurrency(revenueMetrics.totalRevenue)}
          </div>
          <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center' }}>
            <TrendingUp size={16} style={{ marginRight: '5px', color: '#28a745' }} />
            +{formatPercentage(revenueMetrics.monthlyGrowth)} from last month
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <CreditCard size={24} style={{ color: '#007bff', marginRight: '10px' }} />
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Subscription Revenue</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
            {formatCurrency(revenueMetrics.subscriptionRevenue)}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {formatPercentage((revenueMetrics.subscriptionRevenue / revenueMetrics.totalRevenue) * 100)} of total revenue
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <TrendingUp size={24} style={{ color: '#ffc107', marginRight: '10px' }} />
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Transaction Fees</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107', marginBottom: '5px' }}>
            {formatCurrency(revenueMetrics.transactionFees)}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            1% platform fee on payouts
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Users size={24} style={{ color: '#17a2b8', marginRight: '10px' }} />
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Active Subscriptions</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8', marginBottom: '5px' }}>
            {subscriptionMetrics.totalSubscriptions.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {formatPercentage(subscriptionMetrics.conversionRate)} conversion rate
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Subscription Plan Distribution</h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>Free Plan</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{subscriptionMetrics.freeUsers.toLocaleString()} users</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>JMD $0</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatPercentage((subscriptionMetrics.freeUsers / subscriptionMetrics.totalSubscriptions) * 100)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>Pro Plan</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{subscriptionMetrics.proUsers.toLocaleString()} users</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                  {formatCurrency(subscriptionMetrics.proUsers * 25)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatPercentage((subscriptionMetrics.proUsers / subscriptionMetrics.totalSubscriptions) * 100)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>Enterprise Plan</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{subscriptionMetrics.enterpriseUsers.toLocaleString()} users</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  {formatCurrency(subscriptionMetrics.enterpriseUsers * 100)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatPercentage((subscriptionMetrics.enterpriseUsers / subscriptionMetrics.totalSubscriptions) * 100)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Key Metrics</h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545', marginBottom: '5px' }}>
                {formatPercentage(subscriptionMetrics.churnRate)}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Monthly Churn Rate</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
                {formatPercentage(subscriptionMetrics.conversionRate)}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Free to Paid Conversion</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
                {formatCurrency(revenueMetrics.totalRevenue / subscriptionMetrics.totalSubscriptions)}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Average Revenue Per User</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Recent Billing Transactions</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#666', fontWeight: 'bold' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                  <td style={{ padding: '12px', color: '#2c3e50' }}>{transaction.user}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{transaction.type}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td style={{ padding: '12px', color: '#666' }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <AlertTriangle size={24} style={{ color: '#856404' }} />
        <div>
          <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '5px' }}>
            Revenue Target Alert
          </div>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            Monthly revenue is 85% of target (JMD $147K). Consider promotional campaigns to boost subscriptions.
          </div>
        </div>
      </div>
    </div>
  );
}