'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { api } from '../lib/api';

interface JoinRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  kycLevel: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

interface JoinRequestManagementProps {
  circleId: string;
}

export default function JoinRequestManagement({ circleId }: JoinRequestManagementProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJoinRequests();
  }, [circleId]);

  const loadJoinRequests = async () => {
    try {
      const data = await api.getJoinRequests(circleId);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await api.approveJoinRequest(circleId, requestId);
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'APPROVED' } : req
      ));
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      // Add reject endpoint to API
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'REJECTED' } : req
      ));
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading join requests...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Join Requests</h2>
      
      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No join requests at this time.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {requests.map((request) => (
            <div
              key={request.id}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <User size={20} style={{ marginRight: '8px', color: '#007bff' }} />
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>
                      {request.firstName} {request.lastName}
                    </h3>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                    <p style={{ margin: 0, color: '#666' }}>
                      <strong>Email:</strong> {request.email}
                    </p>
                    <p style={{ margin: 0, color: '#666' }}>
                      <strong>Phone:</strong> {request.phone}
                    </p>
                    <p style={{ margin: 0, color: '#666' }}>
                      <strong>KYC Level:</strong> {request.kycLevel}
                    </p>
                    <p style={{ margin: 0, color: '#666' }}>
                      <strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <div
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: 
                          request.status === 'APPROVED' ? '#d4edda' :
                          request.status === 'REJECTED' ? '#f8d7da' : '#fff3cd',
                        color:
                          request.status === 'APPROVED' ? '#155724' :
                          request.status === 'REJECTED' ? '#721c24' : '#856404'
                      }}
                    >
                      {request.status === 'PENDING' && <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                      {request.status === 'APPROVED' && <CheckCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                      {request.status === 'REJECTED' && <XCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                      {request.status}
                    </div>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApprove(request.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}