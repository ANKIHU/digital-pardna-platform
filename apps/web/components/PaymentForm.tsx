'use client';

import { useState } from 'react';
import { CreditCard, Smartphone, Building, Check } from 'lucide-react';
import { api } from '../lib/api';

interface PaymentFormProps {
  circleId: string;
  amount: number;
  circleName: string;
  onPaymentComplete?: (paymentId: string) => void;
  onCancel?: () => void;
}

export default function PaymentForm({ circleId, amount, circleName, onPaymentComplete, onCancel }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CARD'>('MOBILE_MONEY');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    bankAccount: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    pin: ''
  });

  const paymentMethods = [
    {
      id: 'MOBILE_MONEY',
      name: 'Mobile Money',
      icon: <Smartphone size={20} />,
      description: 'Pay with Digicel or Flow mobile money'
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Bank Transfer',
      icon: <Building size={20} />,
      description: 'Transfer from your bank account'
    },
    {
      id: 'CARD',
      name: 'Debit/Credit Card',
      icon: <CreditCard size={20} />,
      description: 'Pay with your card'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const paymentData = {
        amount,
        method: paymentMethod,
        ...formData
      };

      const response = await api.createPayment(circleId, paymentData);
      
      if (response.success) {
        onPaymentComplete?.(response.data.paymentId);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
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
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Make Payment</h2>
        <p style={{ margin: '0 0 5px 0', color: '#666' }}>{circleName}</p>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
          {formatCurrency(amount)}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Payment Method Selection */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
            Payment Method
          </label>
          <div style={{ display: 'grid', gap: '10px' }}>
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  border: '2px solid',
                  borderColor: paymentMethod === method.id ? '#007bff' : '#e9ecef',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === method.id ? '#f8f9fa' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  style={{ marginRight: '12px' }}
                />
                <div style={{ marginRight: '12px', color: '#007bff' }}>
                  {method.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{method.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{method.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div style={{ marginBottom: '25px' }}>
          {paymentMethod === 'MOBILE_MONEY' && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                placeholder="876-XXX-XXXX"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Mobile Money PIN
                </label>
                <input
                  type="password"
                  value={formData.pin}
                  onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                  placeholder="Enter your PIN"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'BANK_TRANSFER' && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                Bank Account Number
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                placeholder="Enter account number"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    value={formData.cvv}
                    onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f4fd',
          borderRadius: '6px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Check size={20} style={{ color: '#007bff' }} />
          <div style={{ fontSize: '14px', color: '#0066cc' }}>
            Your payment is secured with 256-bit encryption and processed through licensed Jamaican financial institutions.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '15px',
              backgroundColor: '#f8f9fa',
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
            type="submit"
            disabled={processing}
            style={{
              flex: 2,
              padding: '15px',
              backgroundColor: processing ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {processing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
          </button>
        </div>
      </form>
    </div>
  );
}