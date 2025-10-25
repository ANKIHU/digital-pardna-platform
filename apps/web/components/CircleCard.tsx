'use client';

import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface CircleCardProps {
  circle: {
    id: string;
    name: string;
    amount: number;
    currentMembers: number;
    maxMembers: number;
    nextPaymentDate: string;
    myTurn: number;
    status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
    trustScore: number;
  };
  onViewDetails?: (circleId: string) => void;
  onMakePayment?: (circleId: string) => void;
}

export default function CircleCard({ circle, onViewDetails, onMakePayment }: CircleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'COMPLETED': return '#007bff';
      case 'PENDING': return '#ffc107';
      default: return '#6c757d';
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
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{circle.name}</h3>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {circle.currentMembers}/{circle.maxMembers} members • My turn: #{circle.myTurn}
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: getStatusColor(circle.status),
          color: 'white'
        }}>
          {circle.status}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={16} style={{ color: '#28a745' }} />
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Amount</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>
              {formatCurrency(circle.amount)}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: '#007bff' }} />
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Next Payment</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' }}>
              {new Date(circle.nextPaymentDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <TrendingUp size={16} style={{ color: '#ffc107' }} />
        <div>
          <span style={{ fontSize: '12px', color: '#666' }}>Circle Health: </span>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffc107' }}>
            {circle.trustScore}% Good
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onViewDetails?.(circle.id)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#2c3e50'
          }}
        >
          View Details
        </button>
        {circle.status === 'ACTIVE' && (
          <button
            onClick={() => onMakePayment?.(circle.id)}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Pay Now
          </button>
        )}
      </div>
    </div>
  );
}