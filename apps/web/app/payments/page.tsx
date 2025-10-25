'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import PaymentForm from '../../components/PaymentForm';

interface Payment {
  id: string;
  circleId: string;
  circleName: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidDate?: string;
  method?: string;
}

export default function PaymentsPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const mockPayments: Payment[] = [
    {
      id: '1',
      circleId: 'circle-123',
      circleName: 'Kingston Savings Circle',
      amount: 5000,
      dueDate: '2024-01-16',
      status: 'PENDING'
    },
    {
      id: '2',
      circleId: 'circle-456',
      circleName: 'Spanish Town Circle',
      amount: 3000,
      dueDate: '2024-01-20',
      status: 'PENDING'
    },
    {
      id: '3',
      circleId: 'circle-123',
      circleName: 'Kingston Savings Circle',
      amount: 5000,
      dueDate: '2024-01-01',
      status: 'PAID',
      paidDate: '2023-12-30',
      method: 'Mobile Money'
    },
    {
      id: '4',
      circleId: 'circle-789',
      circleName: 'Montego Bay Circle',
      amount: 10000,
      dueDate: '2024-01-05',
      status: 'OVERDUE'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'OVERDUE': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle size={16} />;
      case 'PENDING': return <Clock size={16} />;
      case 'OVERDUE': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleMakePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  const handlePaymentComplete = (paymentId: string) => {
    setShowPaymentForm(false);
    setSelectedPayment(null);
    alert('Payment completed successfully!');
  };

  const pendingPayments = mockPayments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE');
  const completedPayments = mockPayments.filter(p => p.status === 'PAID');

  if (showPaymentForm && selectedPayment) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '20px' }}>
        <PaymentForm
          circleId={selectedPayment.circleId}
          amount={selectedPayment.amount}
          circleName={selectedPayment.circleName}
          onPaymentComplete={handlePaymentComplete}
          onCancel={() => setShowPaymentForm(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>My Payments</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <DollarSign size={32} style={{ color: '#ffc107', marginBottom: '10px' }} />
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
            {formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0))}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Pending Payments</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <CheckCircle size={32} style={{ color: '#28a745', marginBottom: '10px' }} />
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {completedPayments.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Completed This Month</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <Calendar size={32} style={{ color: '#007bff', marginBottom: '10px' }} />
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>15</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Day Payment Streak</div>
        </div>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Upcoming Payments</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingPayments.map((payment) => (
              <div
                key={payment.id}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  border: payment.status === 'OVERDUE' ? '2px solid #dc3545' : '1px solid #e9ecef'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{payment.circleName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <DollarSign size={16} style={{ color: '#28a745' }} />
                        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={16} style={{ color: '#666' }} />
                        <span style={{ color: '#666' }}>
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: getStatusColor(payment.status),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      width: 'fit-content'
                    }}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMakePayment(payment)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: payment.status === 'OVERDUE' ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {payment.status === 'OVERDUE' ? 'Pay Now (Overdue)' : 'Pay Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Payment History</h2>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {completedPayments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <CheckCircle size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
              <p>No payment history yet. Make your first payment to see it here!</p>
            </div>
          ) : (
            <div>
              {completedPayments.map((payment, index) => (
                <div
                  key={payment.id}
                  style={{
                    padding: '20px',
                    borderBottom: index < completedPayments.length - 1 ? '1px solid #e9ecef' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{payment.circleName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px', color: '#666' }}>
                      <span>Amount: {formatCurrency(payment.amount)}</span>
                      <span>Paid: {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'N/A'}</span>
                      <span>Method: {payment.method || 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#28a745',
                    fontWeight: 'bold'
                  }}>
                    <CheckCircle size={16} />
                    PAID
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}