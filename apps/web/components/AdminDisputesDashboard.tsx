'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, User, MessageSquare, Scale } from 'lucide-react';
import { api } from '../lib/api';

interface Dispute {
  id: string;
  circleId: string;
  circleName: string;
  reportedBy: string;
  reporterName: string;
  type: 'PAYMENT_LATE' | 'PAYMENT_MISSING' | 'UNFAIR_TREATMENT' | 'CIRCLE_ADMIN' | 'OTHER';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'MEDIATION' | 'RESOLVED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  aiSuggestion?: string;
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  submittedAt: string;
  resolvedAt?: string;
}

export default function AdminDisputesDashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'RESOLVED'>('ALL');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);

  const mockDisputes: Dispute[] = [
    {
      id: '1',
      circleId: 'circle-123',
      circleName: 'Kingston Savings Circle',
      reportedBy: 'user-456',
      reporterName: 'Sarah Williams',
      type: 'PAYMENT_LATE',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      description: 'Member John consistently paying 2-3 days late, affecting circle schedule and causing stress for other members.',
      aiSuggestion: 'Analysis shows payment delays correlate with payday schedule. Recommend adjusting payment date or implementing auto-pay.',
      assignedTo: 'admin-1',
      assignedToName: 'Admin Marcus',
      submittedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      circleId: 'circle-456',
      circleName: 'Spanish Town Circle',
      type: 'UNFAIR_TREATMENT',
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      reportedBy: 'user-789',
      reporterName: 'David Brown',
      description: 'Circle admin showing favoritism in draw order selection. Feel like the process is not fair.',
      aiSuggestion: 'Draw history analysis shows random distribution. Recommend transparency session to explain selection algorithm.',
      submittedAt: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      circleId: 'circle-789',
      circleName: 'Montego Bay Circle',
      type: 'PAYMENT_MISSING',
      status: 'RESOLVED',
      priority: 'URGENT',
      reportedBy: 'user-321',
      reporterName: 'Lisa Davis',
      description: 'Member has not made payment for 2 weeks and is not responding to messages.',
      resolution: 'Member contacted and payment plan established. Auto-pay set up to prevent future issues.',
      assignedTo: 'admin-2',
      assignedToName: 'Admin Jennifer',
      submittedAt: '2024-01-10T09:15:00Z',
      resolvedAt: '2024-01-12T14:20:00Z'
    }
  ];

  useEffect(() => {
    setDisputes(mockDisputes);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return '#28a745';
      case 'UNDER_REVIEW': return '#ffc107';
      case 'MEDIATION': return '#17a2b8';
      case 'ESCALATED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      default: return '#28a745';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircle size={16} />;
      case 'UNDER_REVIEW': return <Clock size={16} />;
      case 'MEDIATION': return <Scale size={16} />;
      case 'ESCALATED': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleStatusUpdate = async (disputeId: string, newStatus: string, resolution?: string) => {
    try {
      await api.updateDisputeStatus(disputeId, newStatus, resolution);
      setDisputes(prev => prev.map(d => 
        d.id === disputeId ? { ...d, status: newStatus as any, resolution } : d
      ));
    } catch (error) {
      console.error('Failed to update dispute:', error);
    }
  };

  const handleAssign = async (disputeId: string, adminId: string) => {
    try {
      await api.assignDispute(disputeId, adminId);
      setDisputes(prev => prev.map(d => 
        d.id === disputeId ? { ...d, assignedTo: adminId, assignedToName: 'Current Admin' } : d
      ));
    } catch (error) {
      console.error('Failed to assign dispute:', error);
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    switch (filter) {
      case 'PENDING': return ['SUBMITTED', 'UNDER_REVIEW'].includes(dispute.status);
      case 'ASSIGNED': return dispute.assignedTo && dispute.status !== 'RESOLVED';
      case 'RESOLVED': return dispute.status === 'RESOLVED';
      default: return true;
    }
  });

  const stats = {
    total: disputes.length,
    pending: disputes.filter(d => ['SUBMITTED', 'UNDER_REVIEW'].includes(d.status)).length,
    resolved: disputes.filter(d => d.status === 'RESOLVED').length,
    urgent: disputes.filter(d => d.priority === 'URGENT' && d.status !== 'RESOLVED').length
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Disputes Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
          >
            <option value="ALL">All Disputes</option>
            <option value="PENDING">Pending Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>{stats.total}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Disputes</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107', marginBottom: '5px' }}>{stats.pending}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Pending Review</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>{stats.resolved}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Resolved</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545', marginBottom: '5px' }}>{stats.urgent}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Urgent</div>
        </div>
      </div>

      {/* Disputes List */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {filteredDisputes.map((dispute) => (
          <div
            key={dispute.id}
            style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: dispute.priority === 'URGENT' ? '2px solid #dc3545' : '1px solid #e9ecef'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>{dispute.circleName}</h3>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: getPriorityColor(dispute.priority),
                    color: 'white'
                  }}>
                    {dispute.priority}
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: getStatusColor(dispute.status),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {getStatusIcon(dispute.status)}
                    {dispute.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Reported by: <strong>{dispute.reporterName}</strong> • 
                  Type: <strong>{dispute.type.replace('_', ' ')}</strong> • 
                  {new Date(dispute.submittedAt).toLocaleDateString()}
                  {dispute.assignedToName && (
                    <span> • Assigned to: <strong>{dispute.assignedToName}</strong></span>
                  )}
                </div>
              </div>
            </div>

            <p style={{ margin: '0 0 15px 0', color: '#2c3e50', lineHeight: '1.5' }}>
              {dispute.description}
            </p>

            {dispute.aiSuggestion && (
              <div style={{ padding: '12px', backgroundColor: '#e8f4fd', borderRadius: '6px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <MessageSquare size={16} style={{ color: '#007bff', marginRight: '6px' }} />
                  <strong style={{ color: '#007bff', fontSize: '14px' }}>AI Analysis & Suggestion</strong>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#0066cc' }}>
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

            {/* Action Buttons */}
            {dispute.status !== 'RESOLVED' && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {!dispute.assignedTo && (
                  <button
                    onClick={() => handleAssign(dispute.id, 'current-admin')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Assign to Me
                  </button>
                )}
                
                {dispute.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleStatusUpdate(dispute.id, 'UNDER_REVIEW')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Start Review
                  </button>
                )}
                
                {dispute.status === 'UNDER_REVIEW' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(dispute.id, 'MEDIATION')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Start Mediation
                    </button>
                    <button
                      onClick={() => {
                        const resolution = prompt('Enter resolution:');
                        if (resolution) handleStatusUpdate(dispute.id, 'RESOLVED', resolution);
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Resolve
                    </button>
                  </>
                )}
                
                {dispute.status === 'MEDIATION' && (
                  <button
                    onClick={() => {
                      const resolution = prompt('Enter final resolution:');
                      if (resolution) handleStatusUpdate(dispute.id, 'RESOLVED', resolution);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Close Dispute
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDisputes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          <AlertTriangle size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
          <h3 style={{ margin: '0 0 10px 0' }}>No Disputes Found</h3>
          <p style={{ margin: 0 }}>
            {filter === 'ALL' ? 'No disputes have been reported.' : `No ${filter.toLowerCase()} disputes at this time.`}
          </p>
        </div>
      )}
    </div>
  );
}