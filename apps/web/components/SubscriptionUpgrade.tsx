'use client';

import { useState } from 'react';
import { Check, Crown, Zap, X } from 'lucide-react';
import { api } from '../lib/api';

interface SubscriptionUpgradeProps {
  currentPlan: string;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
}

export default function SubscriptionUpgrade({ currentPlan, onClose, onUpgrade }: SubscriptionUpgradeProps) {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [processing, setProcessing] = useState(false);

  const plans = [
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 25,
      popular: true,
      features: [
        '5 Active Circles',
        '25 Members per Circle',
        'JMD $200K Monthly Volume',
        'Priority Support',
        'Advanced Analytics',
        'Auto-Payment Setup'
      ],
      limits: { circles: 5, members: 25, volume: 200000 }
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 100,
      popular: false,
      features: [
        'Unlimited Circles',
        'Unlimited Members',
        'Unlimited Volume',
        '24/7 Dedicated Support',
        'Custom Features',
        'White-label Options',
        'API Access',
        'Advanced Reporting'
      ],
      limits: { circles: -1, members: -1, volume: -1 }
    }
  ];

  const handleUpgrade = async () => {
    setProcessing(true);
    try {
      await onUpgrade(selectedPlan);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          padding: '30px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Upgrade Your Plan</h2>
            <p style={{ margin: 0, color: '#666' }}>Choose the plan that fits your needs</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  padding: '30px',
                  border: selectedPlan === plan.id ? '3px solid #007bff' : '2px solid #e9ecef',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: selectedPlan === plan.id ? '#f8f9fa' : 'white'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <Crown size={14} />
                    MOST POPULAR
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '24px' }}>{plan.name}</h3>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
                    {formatCurrency(plan.price)}
                  </div>
                  <div style={{ fontSize: '16px', color: '#666' }}>per month</div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  {plan.features.map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '12px'
                    }}>
                      <Check size={16} style={{ color: '#28a745', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', color: '#2c3e50' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                {selectedPlan === plan.id && (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Zap size={16} style={{ color: '#007bff' }} />
                    <span style={{ fontSize: '14px', color: '#0066cc', fontWeight: 'bold' }}>
                      Selected Plan
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Billing Information */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Billing Information</h4>
            <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Plan:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {plans.find(p => p.id === selectedPlan)?.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Monthly Price:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {formatCurrency(plans.find(p => p.id === selectedPlan)?.price || 0)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Billing Cycle:</span>
                <span style={{ fontWeight: 'bold' }}>Monthly</span>
              </div>
              <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #dee2e6' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                <span style={{ fontWeight: 'bold' }}>Total:</span>
                <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                  {formatCurrency(plans.find(p => p.id === selectedPlan)?.price || 0)}/month
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#2c3e50'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              disabled={processing}
              style={{
                padding: '12px 24px',
                backgroundColor: processing ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <Zap size={16} />
                  Upgrade Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}