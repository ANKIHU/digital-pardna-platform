'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, TrendingUp, Bell, MessageCircle, Shield } from 'lucide-react';
import { api } from '../lib/api';
import SmartReminders from './SmartReminders';
import WhatsAppAssistant from './WhatsAppAssistant';

interface Circle {
  id: string;
  name: string;
  amount: number;
  currentMembers: number;
  maxMembers: number;
  nextPaymentDate: string;
  myTurn: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
  trustScore: number;
}

interface UserStats {
  totalCircles: number;
  activeCircles: number;
  completedCircles: number;
  totalContributed: number;
  totalReceived: number;
  trustScore: number;
  paymentStreak: number;
  nextPayment: {
    amount: number;
    dueDate: string;
    circleName: string;
  } | null;
}

export default function CustomerDashboard({ userId }: { userId: string }) {
  const [userStats, setUserStats] = useState<UserStats>({
    totalCircles: 3,
    activeCircles: 2,
    completedCircles: 1,
    totalContributed: 15000,
    totalReceived: 5000,
    trustScore: 750,
    paymentStreak: 15,
    nextPayment: {
      amount: 5000,
      dueDate: '2024-01-16',
      circleName: 'Kingston Savings Circle'
    }
  });

  const [circles, setCircles] = useState<Circle[]>([
    {
      id: '1',
      name: 'Kingston Savings Circle',
      amount: 5000,
      currentMembers: 10,
      maxMembers: 12,
      nextPaymentDate: '2024-01-16',
      myTurn: 8,
      status: 'ACTIVE',
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
      status: 'ACTIVE',
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
      status: 'COMPLETED',
      trustScore: 88
    }
  ]);

  const [showReminders, setShowReminders] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'COMPLETED': return '#007bff';
      case 'PENDING': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 750) return '#28a745';
    if (score >= 650) return '#ffc107';
    return '#dc3545';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>Welcome back!</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Here's your pardna circle overview</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowReminders(!showReminders)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Bell size={16} />
            Reminders
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Users size={24} style={{ color: '#007bff', marginRight: '10px' }} />
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Active Circles</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
            {userStats.activeCircles}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {userStats.totalCircles} total • {userStats.completedCircles} completed
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <DollarSign size={24} style={{ color: '#28a745', marginRight: '10px' }} />
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Total Contributed</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
            {formatCurrency(userStats.totalContributed)}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Received: {formatCurrency(userStats.totalReceived)}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Shield size={24} style={{ color: getTrustScoreColor(userStats.trustScore), marginRight: '10px' }} />
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Trust Score</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: getTrustScoreColor(userStats.trustScore), marginBottom: '5px' }}>
            {userStats.trustScore}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {userStats.paymentStreak} day payment streak
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Calendar size={24} style={{ color: '#ffc107', marginRight: '10px' }} />
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Next Payment</h3>
          </div>
          {userStats.nextPayment ? (
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107', marginBottom: '5px' }}>
                {formatCurrency(userStats.nextPayment.amount)}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Due {new Date(userStats.nextPayment.dueDate).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {userStats.nextPayment.circleName}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '16px', color: '#666' }}>No upcoming payments</div>
          )}
        </div>
      </div>

      {/* Next Payment Alert */}
      {userStats.nextPayment && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Bell size={20} style={{ color: '#856404', marginRight: '10px' }} />
          <div>
            <strong style={{ color: '#856404' }}>Payment Reminder: </strong>
            <span style={{ color: '#856404' }}>
              Your {formatCurrency(userStats.nextPayment.amount)} payment for {userStats.nextPayment.circleName} is due on {new Date(userStats.nextPayment.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Circles Grid */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>My Circles</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {circles.map((circle) => (
            <div
              key={circle.id}
              style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}
            >
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Monthly Amount</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {formatCurrency(circle.amount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Next Payment</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {new Date(circle.nextPaymentDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Circle Health</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: getTrustScoreColor(circle.trustScore) }}>
                    {circle.trustScore}% Good
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  View Details
                </button>
                {circle.status === 'ACTIVE' && (
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    Make Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <button style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Users size={20} style={{ color: '#007bff' }} />
            <span>Join New Circle</span>
          </button>
          <button style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <TrendingUp size={20} style={{ color: '#28a745' }} />
            <span>Improve Trust Score</span>
          </button>
          <button style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <MessageCircle size={20} style={{ color: '#ffc107' }} />
            <span>Get Help</span>
          </button>
        </div>
      </div>

      {/* Smart Reminders Modal */}
      {showReminders && (
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
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Smart Reminders</h3>
              <button
                onClick={() => setShowReminders(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <SmartReminders userId={userId} />
          </div>
        </div>
      )}

      {/* WhatsApp Assistant */}
      <WhatsAppAssistant userId={userId} />
    </div>
  );
}