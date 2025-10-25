'use client';

import { useState } from 'react';
import { AlertTriangle, FileText, MessageSquare, CheckCircle, Clock, Scale } from 'lucide-react';
import { api } from '../lib/api';

interface Dispute {
  id: string;
  circleId: string;
  circleName: string;
  type: 'PAYMENT_LATE' | 'PAYMENT_MISSING' | 'UNFAIR_TREATMENT' | 'CIRCLE_ADMIN' | 'OTHER';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'MEDIATION' | 'RESOLVED' | 'ESCALATED';
  description: string;
  evidence?: string[];
  aiSuggestion?: string;
  resolution?: string;
  submittedAt: Date;
  resolvedAt?: Date;
}

export default function DisputeResolution({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');
  const [disputeForm, setDisputeForm] = useState({
    circleId: '',
    type: 'PAYMENT_LATE' as const,
    description: '',
    evidence: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);

  const disputeTypes = [
    { value: 'PAYMENT_LATE', label: 'Late Payment Issue', description: 'Member consistently paying late' },
    { value: 'PAYMENT_MISSING', label: 'Missing Payment', description: 'Member hasn\'t paid their contribution' },
    { value: 'UNFAIR_TREATMENT', label: 'Unfair Treatment', description: 'Feeling treated unfairly by admin or members' },
    { value: 'CIRCLE_ADMIN', label: 'Admin Issues', description: 'Problems with circle administration' },
    { value: 'OTHER', label: 'Other', description: 'Other dispute not listed above' }
  ];

  const [mockDisputes, setMockDisputes] = useState<Dispute[]>([
    {
      id: '1',
      circleId: 'circle-123',
      circleName: 'Kingston Savings Circle',
      type: 'PAYMENT_LATE',
      status: 'RESOLVED',
      description: 'Member John consistently paying 2-3 days late, affecting circle schedule',
      aiSuggestion: 'Based on payment history analysis, suggest implementing auto-payment system for this member. Late payments appear to be due to forgetfulness rather than financial issues.',
      resolution: 'Member agreed to set up auto-payments. Circle admin adjusted payment window to accommodate member\'s pay schedule.',
      submittedAt: new Date('2024-01-10'),
      resolvedAt: new Date('2024-01-12')
    },
    {
      id: '2',
      circleId: 'circle-456',
      circleName: 'Spanish Town Circle',
      type: 'UNFAIR_TREATMENT',
      status: 'UNDER_REVIEW',
      description: 'Feel like admin is showing favoritism in draw order selection',
      aiSuggestion: 'Analysis shows draw selections follow random algorithm. Recommend transparency session to explain selection process.',
      submittedAt: new Date('2024-01-14')
    }
  ]);

  const submitDispute = async () => {
    if (!disputeForm.circleId || !disputeForm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.reportDispute(disputeForm.circleId, {
        type: disputeForm.type,
        description: disputeForm.description,
        evidence: disputeForm.evidence,
        userId
      });

      if (response.success) {
        const newDispute: Dispute = {
          id: response.data.disputeId,
          circleId: disputeForm.circleId,
          circleName: 'New Circle',
          type: disputeForm.type,
          status: 'SUBMITTED',
          description: disputeForm.description,
          submittedAt: new Date()
        };
        setMockDisputes(prev => [newDispute, ...prev]);
        alert('Dispute submitted successfully. You\'ll receive updates on the resolution process.');
        setDisputeForm({
          circleId: '',
          type: 'PAYMENT_LATE',
          description: '',
          evidence: []
        });
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Failed to submit dispute:', error);
      alert('Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return '#28a745';
      case 'UNDER_REVIEW': return '#ffc107';
      case 'MEDIATION': return '#17a2b8';
      case 'ESCALATED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircle size={16} />;
      case 'UNDER_REVIEW': return <Clock size={16} />;
      case 'MEDIATION': return <Scale size={16} />;
      case 'ESCALATED': return <AlertTriangle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <AlertTriangle size={28} style={{ color: '#ffc107', marginRight: '12px' }} />
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Dispute Resolution</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '1px solid #e9ecef' }}>
        <button
          onClick={() => setActiveTab('report')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'report' ? '3px solid #007bff' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'report' ? 'bold' : 'normal',
            color: activeTab === 'report' ? '#007bff' : '#666'
          }}
        >
          Report Issue
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid #007bff' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'history' ? 'bold' : 'normal',
            color: activeTab === 'history' ? '#007bff' : '#666'
          }}
        >
          My Disputes
        </button>
      </div>

      {activeTab === 'report' && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Report a Dispute</h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Circle *
              </label>
              <select
                value={disputeForm.circleId}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, circleId: e.target.value }))}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                <option value="">Select a circle</option>
                <option value="circle-123">Kingston Savings Circle</option>
                <option value="circle-456">Spanish Town Circle</option>
                <option value="circle-789">Montego Bay Circle</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Issue Type *
              </label>
              <div style={{ display: 'grid', gap: '10px' }}>
                {disputeTypes.map((type) => (
                  <label
                    key={type.value}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: disputeForm.type === type.value ? '#e3f2fd' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="disputeType"
                      value={type.value}
                      checked={disputeForm.type === type.value}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, type: e.target.value as any }))}
                      style={{ marginRight: '10px', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{type.label}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Description *
              </label>
              <textarea
                value={disputeForm.description}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please describe the issue in detail. Include dates, amounts, and any relevant information..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Scale size={20} style={{ color: '#007bff', marginRight: '8px' }} />
                <strong style={{ color: '#007bff' }}>AI-Powered Fair Resolution</strong>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#0066cc' }}>
                Our AI system will analyze your dispute and provide fair resolution suggestions based on:
                payment history, circle rules, similar cases, and community standards. Most disputes
                are resolved within 24-48 hours through mediation.
              </p>
            </div>

            <button
              onClick={submitDispute}
              disabled={submitting}
              style={{
                padding: '15px 30px',
                backgroundColor: submitting ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {mockDisputes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
              <CheckCircle size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
              <h3 style={{ margin: '0 0 10px 0' }}>No Disputes</h3>
              <p style={{ margin: 0 }}>You haven't reported any disputes. We hope it stays that way!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {mockDisputes.map((dispute) => (
                <div
                  key={dispute.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{dispute.circleName}</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        {disputeTypes.find(t => t.value === dispute.type)?.label}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(dispute.status),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusIcon(dispute.status)}
                      {dispute.status.replace('_', ' ')}
                    </div>
                  </div>

                  <p style={{ margin: '0 0 15px 0', color: '#2c3e50', lineHeight: '1.5' }}>
                    {dispute.description}
                  </p>

                  {dispute.aiSuggestion && (
                    <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <MessageSquare size={16} style={{ color: '#007bff', marginRight: '6px' }} />
                        <strong style={{ color: '#007bff', fontSize: '14px' }}>AI Analysis</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50' }}>
                        {dispute.aiSuggestion}
                      </p>
                    </div>
                  )}

                  {dispute.resolution && (
                    <div style={{ padding: '12px', backgroundColor: '#d4edda', borderRadius: '6px', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <CheckCircle size={16} style={{ color: '#28a745', marginRight: '6px' }} />
                        <strong style={{ color: '#28a745', fontSize: '14px' }}>Resolution</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
                        {dispute.resolution}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                    <span>Submitted: {dispute.submittedAt.toLocaleDateString()}</span>
                    {dispute.resolvedAt && (
                      <span>Resolved: {dispute.resolvedAt.toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Real-time Status Updates */}
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>  
                <MessageSquare size={16} style={{ color: '#007bff', marginRight: '8px' }} />
                <strong style={{ color: '#007bff', fontSize: '14px' }}>Live Updates</strong>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#0066cc' }}>
                You'll receive real-time notifications when your disputes are reviewed, assigned to mediators, or resolved. 
                Most disputes are handled within 24-48 hours.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}