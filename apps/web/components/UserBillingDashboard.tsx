'use client';

import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { api } from '../lib/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  limits: {
    circles: number;
    members: number;
    volume: number;
  };
}

interface BillingRecord {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  type: 'SUBSCRIPTION' | 'TRANSACTION_FEE' | 'PREMIUM_SERVICE';
}

export default function UserBillingDashboard({ userId }: { userId: string }) {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>({
    id: 'free',
    name: 'Free Plan',
    price: 0,
    currency: 'JMD',
    features: ['1 Circle', '10 Members', 'Basic Support'],
    limits: { circles: 1, members: 10, volume: 50000 }
  });

  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 25,
      currency: 'JMD',
      features: ['5 Circles', '25 Members', 'Priority Support', 'Advanced Analytics'],
      limits: { circles: 5, members: 25, volume: 200000 }
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 100,
      currency: 'JMD',
      features: ['Unlimited Circles', 'Unlimited Members', '24/7 Support', 'Custom Features'],
      limits: { circles: -1, members: -1, volume: -1 }
    }
  ]);

  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([
    {
      id: '1',
      amount: 50,
      description: 'Platform fee (1% of JMD $5,000 payout)',
      date: '2024-01-15',
      status: 'PAID',
      type: 'TRANSACTION_FEE'
    },
    {
      id: '2',
      amount: 1.99,
      description: 'Instant transfer fee',
      date: '2024-01-14',
      status: 'PAID',
      type: 'PREMIUM_SERVICE'
    }
  ]);

  const [usage, setUsage] = useState({
    circles: 1,
    members: 8,
    volume: 15000
  });

  const [payoutCalculation, setPayoutCalculation] = useState({
    amount: 5000,
    platformFee: 50,
    instantFee: 1.99,
    total: 4948.01
  });

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await api.upgradeSubscription('current-subscription-id', planId);
      if (response.success) {
        alert('Plan upgraded successfully!');
        // Refresh current plan
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    }
  };

  const calculatePayout = async (amount: number, transferType: 'standard' | 'instant') => {
    try {
      const response = await api.calculatePayoutFees(amount, transferType);
      setPayoutCalculation(response.data);
    } catch (error) {
      console.error('Fee calculation failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Billing & Subscription</h1>

      {/* Current Plan */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Current Plan: {currentPlan.name}</h2>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {formatCurrency(currentPlan.price)}/month
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Check size={20} style={{ color: '#28a745' }} />
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>Active</span>
          </div>
        </div>

        {/* Usage Limits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Circles</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {usage.circles}/{currentPlan.limits.circles === -1 ? '∞' : currentPlan.limits.circles}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${getUsagePercentage(usage.circles, currentPlan.limits.circles)}%`, 
                  height: '100%', 
                  backgroundColor: getUsagePercentage(usage.circles, currentPlan.limits.circles) > 80 ? '#dc3545' : '#007bff'
                }} 
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Members</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {usage.members}/{currentPlan.limits.members === -1 ? '∞' : currentPlan.limits.members}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${getUsagePercentage(usage.members, currentPlan.limits.members)}%`, 
                  height: '100%', 
                  backgroundColor: getUsagePercentage(usage.members, currentPlan.limits.members) > 80 ? '#dc3545' : '#007bff'
                }} 
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Monthly Volume</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {formatCurrency(usage.volume)}/{currentPlan.limits.volume === -1 ? '∞' : formatCurrency(currentPlan.limits.volume)}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${getUsagePercentage(usage.volume, currentPlan.limits.volume)}%`, 
                  height: '100%', 
                  backgroundColor: getUsagePercentage(usage.volume, currentPlan.limits.volume) > 80 ? '#dc3545' : '#007bff'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Plan Features</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {currentPlan.features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#e8f4fd',
                  color: '#0066cc',
                  borderRadius: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Check size={14} />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Calculator */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Payout Fee Calculator</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Payout Amount</label>
            <input
              type="number"
              value={payoutCalculation.amount}
              onChange={(e) => {
                const amount = parseFloat(e.target.value) || 0;
                calculatePayout(amount, 'standard');
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Fee Breakdown</h4>
            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payout Amount:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(payoutCalculation.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Platform Fee (1%):</span>
                <span style={{ color: '#dc3545' }}>-{formatCurrency(payoutCalculation.platformFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Instant Transfer Fee:</span>
                <span style={{ color: '#dc3545' }}>-{formatCurrency(payoutCalculation.instantFee)}</span>
              </div>
              <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #dee2e6' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                <span>You Receive:</span>
                <span style={{ color: '#28a745' }}>{formatCurrency(payoutCalculation.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} style={{ color: '#856404' }} />
            <div style={{ fontSize: '14px', color: '#856404' }}>
              <strong>Transparent Pricing:</strong> Standard transfers are FREE (3-5 business days). 
              Instant transfers include a JMD $1.99 convenience fee for immediate processing.
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      {currentPlan.id === 'free' && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Upgrade Your Plan</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  padding: '25px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{plan.name}</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', marginBottom: '15px' }}>
                  {formatCurrency(plan.price)}<span style={{ fontSize: '16px', color: '#666' }}>/month</span>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  {plan.features.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Check size={16} style={{ color: '#28a745' }} />
                      <span style={{ fontSize: '14px' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Upgrade to {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing History */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Billing History</h3>
        
        {billingHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <CreditCard size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
            <p>No billing history yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {billingHistory.map((record) => (
              <div
                key={record.id}
                style={{
                  padding: '20px',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                    {record.description}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {new Date(record.date).toLocaleDateString()} • {record.type.replace('_', ' ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {formatCurrency(record.amount)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: record.status === 'PAID' ? '#28a745' : record.status === 'FAILED' ? '#dc3545' : '#ffc107'
                  }}>
                    {record.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}