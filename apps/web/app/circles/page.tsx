'use client';

import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import CircleCard from '../../components/CircleCard';
import ChatBot from '../../components/ChatBot';

export default function CirclesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAmount, setFilterAmount] = useState('');

  const mockCircles = [
    {
      id: '1',
      name: 'Kingston Savings Circle',
      amount: 5000,
      currentMembers: 10,
      maxMembers: 12,
      nextPaymentDate: '2024-01-16',
      myTurn: 8,
      status: 'ACTIVE' as const,
      trustScore: 85
    },
    {
      id: '2',
      name: 'Spanish Town Circle',
      amount: 3000,
      currentMembers: 8,
      maxMembers: 8,
      nextPaymentDate: '2024-01-20',
      myTurn: 3,
      status: 'ACTIVE' as const,
      trustScore: 92
    },
    {
      id: '3',
      name: 'Montego Bay Circle',
      amount: 10000,
      currentMembers: 15,
      maxMembers: 15,
      nextPaymentDate: '2024-01-10',
      myTurn: 15,
      status: 'COMPLETED' as const,
      trustScore: 88
    }
  ];

  const handleViewDetails = (circleId: string) => {
    console.log('View details for circle:', circleId);
  };

  const handleMakePayment = (circleId: string) => {
    console.log('Make payment for circle:', circleId);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>My Circles</h1>
        <button style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Plus size={16} />
          Join New Circle
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            placeholder="Search circles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 45px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        <select
          value={filterAmount}
          onChange={(e) => setFilterAmount(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px',
            minWidth: '150px'
          }}
        >
          <option value="">All Amounts</option>
          <option value="0-5000">Under $5,000</option>
          <option value="5000-10000">$5,000 - $10,000</option>
          <option value="10000+">Over $10,000</option>
        </select>
      </div>

      {/* Circles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {mockCircles.map((circle) => (
          <CircleCard
            key={circle.id}
            circle={circle}
            onViewDetails={handleViewDetails}
            onMakePayment={handleMakePayment}
          />
        ))}
      </div>

      <ChatBot userId="user-123" />
    </div>
  );
}