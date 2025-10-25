'use client';

import { Clock, User, Scale, CheckCircle, AlertTriangle } from 'lucide-react';

interface DisputeStatusTrackerProps {
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'MEDIATION' | 'RESOLVED' | 'ESCALATED';
  submittedAt: Date;
  assignedTo?: string;
  resolvedAt?: Date;
}

export default function DisputeStatusTracker({ status, submittedAt, assignedTo, resolvedAt }: DisputeStatusTrackerProps) {
  const steps = [
    { key: 'SUBMITTED', label: 'Submitted', icon: <Clock size={16} />, description: 'Dispute reported and logged' },
    { key: 'UNDER_REVIEW', label: 'Under Review', icon: <User size={16} />, description: 'Admin reviewing case details' },
    { key: 'MEDIATION', label: 'Mediation', icon: <Scale size={16} />, description: 'Active resolution in progress' },
    { key: 'RESOLVED', label: 'Resolved', icon: <CheckCircle size={16} />, description: 'Dispute successfully closed' }
  ];

  const getStepStatus = (stepKey: string) => {
    const currentIndex = steps.findIndex(s => s.key === status);
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    
    if (status === 'ESCALATED') return stepKey === 'SUBMITTED' ? 'completed' : 'error';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return '#28a745';
      case 'active': return '#007bff';
      case 'error': return '#dc3545';
      default: return '#e9ecef';
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Dispute Progress</h4>
      
      {status === 'ESCALATED' && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '6px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} style={{ color: '#721c24' }} />
          <span style={{ color: '#721c24', fontSize: '14px', fontWeight: 'bold' }}>
            Dispute has been escalated for senior review
          </span>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          left: '15px',
          top: '20px',
          bottom: '20px',
          width: '2px',
          backgroundColor: '#e9ecef'
        }} />

        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '25px', position: 'relative' }}>
              {/* Step Circle */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: getStepColor(stepStatus),
                color: stepStatus === 'pending' ? '#666' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px',
                zIndex: 1,
                position: 'relative'
              }}>
                {step.icon}
              </div>

              {/* Step Content */}
              <div style={{ flex: 1, paddingTop: '4px' }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  color: stepStatus === 'pending' ? '#666' : '#2c3e50',
                  marginBottom: '4px'
                }}>
                  {step.label}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  {step.description}
                </div>

                {/* Timestamps */}
                {step.key === 'SUBMITTED' && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {submittedAt.toLocaleString()}
                  </div>
                )}
                
                {step.key === 'UNDER_REVIEW' && assignedTo && stepStatus !== 'pending' && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Assigned to: {assignedTo}
                  </div>
                )}
                
                {step.key === 'RESOLVED' && resolvedAt && stepStatus === 'completed' && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Resolved: {resolvedAt.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated Timeline */}
      {status !== 'RESOLVED' && status !== 'ESCALATED' && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '6px' 
        }}>
          <div style={{ fontSize: '14px', color: '#0066cc' }}>
            <strong>Estimated Resolution:</strong> Most disputes are resolved within 24-48 hours. 
            Complex cases may take up to 5 business days.
          </div>
        </div>
      )}
    </div>
  );
}