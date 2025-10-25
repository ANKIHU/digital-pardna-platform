'use client';

import { useState } from 'react';
import { CheckCircle, User, Shield, Clock, Upload } from 'lucide-react';
import { api } from '../lib/api';
import KYCDocumentUpload from './KYCDocumentUpload';

interface Circle {
  id: string;
  name: string;
  amount: number;
  duration: number;
  currentMembers: number;
  maxMembers: number;
  nextDraw: string;
}

interface CircleJoinProcessProps {
  circle: Circle;
}

export default function CircleJoinProcess({ circle }: CircleJoinProcessProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    trn: '',
    nationalId: '',
    address: ''
  });

  const handleNext = async () => {
    setError('');
    
    if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    if (currentStep === 3) {
      setLoading(true);
      try {
        await api.submitKYC({
          trn: formData.trn,
          nationalId: formData.nationalId,
          level: 'SILVER'
        });
      } catch (err) {
        setError('KYC verification failed. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    
    if (currentStep === 4) {
      setLoading(true);
      try {
        await api.joinCircle(circle.id, {
          ...formData,
          kycLevel: 'SILVER'
        });
      } catch (err) {
        setError('Failed to submit join request. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { number: 1, title: 'Circle Details', icon: <User size={20} /> },
    { number: 2, title: 'Personal Info', icon: <User size={20} /> },
    { number: 3, title: 'KYC Verification', icon: <Shield size={20} /> },
    { number: 4, title: 'Submit Application', icon: <CheckCircle size={20} /> }
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
        Join Pardna Circle
      </h2>

      {/* Progress Steps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        {steps.map((step) => (
          <div key={step.number} style={{ textAlign: 'center', flex: 1 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: currentStep >= step.number ? '#007bff' : '#e9ecef',
                color: currentStep >= step.number ? 'white' : '#6c757d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}
            >
              {currentStep > step.number ? <CheckCircle size={20} /> : step.icon}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>{step.title}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{circle.name}</h3>
          <p style={{ margin: '5px 0', color: '#666' }}>Amount: ${circle.amount}</p>
          <p style={{ margin: '5px 0', color: '#666' }}>Duration: {circle.duration} months</p>
          <p style={{ margin: '5px 0', color: '#666' }}>Members: {circle.currentMembers}/{circle.maxMembers}</p>
          <p style={{ margin: '5px 0', color: '#666' }}>Next Draw: {circle.nextDraw}</p>
        </div>
        
        {error && (
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
            {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Circle Information</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              You're about to join <strong>{circle.name}</strong>. This circle requires a monthly contribution 
              of <strong>${circle.amount}</strong> for <strong>{circle.duration} months</strong>.
            </p>
            <p style={{ color: '#666', lineHeight: '1.6', marginTop: '15px' }}>
              By joining, you'll be part of a trusted financial community where members take turns 
              receiving the collective pot. Your turn will be determined by a fair draw system.
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Personal Information</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <input
                type="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>KYC Verification (SILVER Level)</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              To join this circle, you need SILVER level verification. Please upload your government-issued identification documents.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <KYCDocumentUpload 
                userId="user-123"
                verificationId="verification-456"
                onDocumentUploaded={(doc) => {
                  console.log('Document uploaded for circle join:', doc);
                }}
              />
            </div>
            
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#0066cc' }}>
                <Shield size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                Your documents are encrypted and securely stored in compliance with BOJ and Jamaican data protection laws.
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Review & Submit</h3>
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Application Summary</h4>
              <p style={{ margin: '5px 0', color: '#666' }}>Name: {formData.firstName} {formData.lastName}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>Email: {formData.email}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>Phone: {formData.phone}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>KYC Level: SILVER</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                <Clock size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                Your application will be reviewed by the circle administrator. You'll receive a notification once approved.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Back
            </button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={handleNext}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Processing...' : (currentStep === 4 ? 'Submit Application' : 'Next Step')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}