'use client';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface BOJReport {
  id: string;
  reportType: 'kyc_summary' | 'transaction_monitoring' | 'suspicious_activity' | 'quarterly_filing';
  period: string;
  status: 'draft' | 'pending_review' | 'submitted' | 'approved' | 'rejected';
  dueDate: string;
  submittedDate?: string;
  totalTransactions: number;
  totalValue: number;
  flaggedTransactions: number;
  complianceScore: number;
}

interface NHTIntegration {
  id: string;
  employeeId: string;
  employeeName: string;
  trn: string;
  contributionAmount: number;
  contributionMonth: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastUpdated: string;
  contributionHistory: number;
}

interface ComplianceMetrics {
  kycCompletionRate: number;
  amlAlertsResolved: number;
  reportingCompliance: number;
  riskAssessmentScore: number;
  lastAuditDate: string;
  nextAuditDue: string;
}

interface SuspiciousActivity {
  id: string;
  userId: string;
  userName: string;
  activityType: 'large_cash' | 'unusual_pattern' | 'velocity_threshold' | 'cross_border' | 'multiple_accounts';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedDate: string;
  investigationStatus: 'pending' | 'investigating' | 'filed_sar' | 'cleared' | 'escalated';
  assignedTo?: string;
}

export default function ComplianceManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [bojReports, setBojReports] = useState<BOJReport[]>([]);
  const [nhtIntegrations, setNhtIntegrations] = useState<NHTIntegration[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      const [bojRes, nhtRes] = await Promise.all([
        api.getBOJReports(),
        api.getNHTIntegration()
      ]);
      
      setBojReports(bojRes.reports || mockBojReports);
      setNhtIntegrations(nhtRes.integrations || mockNhtIntegrations);
      setComplianceMetrics(mockComplianceMetrics);
      setSuspiciousActivities(mockSuspiciousActivities);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      setBojReports(mockBojReports);
      setNhtIntegrations(mockNhtIntegrations);
      setComplianceMetrics(mockComplianceMetrics);
      setSuspiciousActivities(mockSuspiciousActivities);
    } finally {
      setLoading(false);
    }
  };

  const mockBojReports: BOJReport[] = [
    {
      id: '1',
      reportType: 'quarterly_filing',
      period: 'Q3 2024',
      status: 'submitted',
      dueDate: '2024-10-31',
      submittedDate: '2024-10-25',
      totalTransactions: 15847,
      totalValue: 245673000,
      flaggedTransactions: 23,
      complianceScore: 94
    },
    {
      id: '2',
      reportType: 'suspicious_activity',
      period: 'October 2024',
      status: 'pending_review',
      dueDate: '2024-11-05',
      totalTransactions: 8934,
      totalValue: 178234000,
      flaggedTransactions: 12,
      complianceScore: 87
    },
    {
      id: '3',
      reportType: 'kyc_summary',
      period: 'October 2024',
      status: 'draft',
      dueDate: '2024-11-10',
      totalTransactions: 0,
      totalValue: 0,
      flaggedTransactions: 0,
      complianceScore: 0
    }
  ];

  const mockNhtIntegrations: NHTIntegration[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      trn: '100-123-456',
      contributionAmount: 12500,
      contributionMonth: '2024-10',
      status: 'completed',
      lastUpdated: '2024-10-28T09:00:00Z',
      contributionHistory: 125000
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Sarah Wilson',
      trn: '100-234-567',
      contributionAmount: 15000,
      contributionMonth: '2024-10',
      status: 'processing',
      lastUpdated: '2024-10-28T14:30:00Z',
      contributionHistory: 180000
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: 'Michael Brown',
      trn: '100-345-678',
      contributionAmount: 10000,
      contributionMonth: '2024-10',
      status: 'failed',
      lastUpdated: '2024-10-27T16:45:00Z',
      contributionHistory: 95000
    }
  ];

  const mockComplianceMetrics: ComplianceMetrics = {
    kycCompletionRate: 94.2,
    amlAlertsResolved: 87.5,
    reportingCompliance: 96.8,
    riskAssessmentScore: 8.7,
    lastAuditDate: '2024-08-15',
    nextAuditDue: '2025-02-15'
  };

  const mockSuspiciousActivities: SuspiciousActivity[] = [
    {
      id: '1',
      userId: 'USR001',
      userName: 'Robert Taylor',
      activityType: 'large_cash',
      riskLevel: 'high',
      description: 'Multiple large cash transactions exceeding $500K JMD in single day',
      detectedDate: '2024-10-28T10:30:00Z',
      investigationStatus: 'investigating',
      assignedTo: 'Compliance Team A'
    },
    {
      id: '2',
      userId: 'USR002',
      userName: 'Lisa Anderson',
      activityType: 'unusual_pattern',
      riskLevel: 'medium',
      description: 'Transaction pattern deviating significantly from historical behavior',
      detectedDate: '2024-10-27T14:15:00Z',
      investigationStatus: 'pending',
    },
    {
      id: '3',
      userId: 'USR003',
      userName: 'David Miller',
      activityType: 'velocity_threshold',
      riskLevel: 'critical',
      description: 'Transaction velocity exceeding regulatory thresholds',
      detectedDate: '2024-10-26T09:45:00Z',
      investigationStatus: 'filed_sar',
      assignedTo: 'Senior Compliance Officer'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'cleared': 
        return 'bg-green-100 text-green-800';
      case 'submitted':
      case 'processing':
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'pending_review':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'filed_sar':
      case 'escalated':
        return 'bg-purple-100 text-purple-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-400 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Regulatory Compliance</h1>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              File SAR
            </button>
          </div>
        </div>

        {/* Compliance Metrics */}
        {complianceMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">KYC Completion</h3>
              <p className="text-2xl font-bold text-green-600">{complianceMetrics.kycCompletionRate}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${complianceMetrics.kycCompletionRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">AML Alerts Resolved</h3>
              <p className="text-2xl font-bold text-blue-600">{complianceMetrics.amlAlertsResolved}%</p>
              <p className="text-xs text-gray-500">This quarter</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Reporting Compliance</h3>
              <p className="text-2xl font-bold text-purple-600">{complianceMetrics.reportingCompliance}%</p>
              <p className="text-xs text-green-600">On-time submissions</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Risk Assessment</h3>
              <p className="text-2xl font-bold text-orange-600">{complianceMetrics.riskAssessmentScore}/10</p>
              <p className="text-xs text-gray-500">Overall risk score</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Compliance Overview' },
                { id: 'boj-reports', label: 'BOJ Reports' },
                { id: 'nht-integration', label: 'NHT Integration' },
                { id: 'suspicious-activity', label: 'Suspicious Activity' },
                { id: 'audit-trail', label: 'Audit Trail' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🏛️ Bank of Jamaica (BOJ) Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Active Reports</span>
                        <span className="font-medium">{bojReports.filter(r => r.status !== 'approved').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overdue Submissions</span>
                        <span className="font-medium text-red-600">
                          {bojReports.filter(r => new Date(r.dueDate) < new Date() && r.status === 'draft').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Rating</span>
                        <span className="font-medium text-green-600">Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Submission</span>
                        <span className="font-medium">Oct 25, 2024</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🏠 National Housing Trust (NHT) Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Active Employees</span>
                        <span className="font-medium">{nhtIntegrations.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This Month's Contributions</span>
                        <span className="font-medium">{formatCurrency(nhtIntegrations.reduce((sum, emp) => sum + emp.contributionAmount, 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Status</span>
                        <span className="font-medium text-blue-600">
                          {nhtIntegrations.filter(emp => emp.status === 'completed').length}/{nhtIntegrations.length} Complete
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Integration Health</span>
                        <span className="font-medium text-green-600">Operational</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🚨 Recent Alerts & Actions Required</h3>
                  <div className="space-y-3">
                    {suspiciousActivities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(activity.riskLevel)}`}>
                              {activity.riskLevel.toUpperCase()}
                            </span>
                            <span className="font-medium">{activity.userName}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(activity.investigationStatus)}`}>
                            {activity.investigationStatus.replace('_', ' ').toUpperCase()}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BOJ Reports Tab */}
            {activeTab === 'boj-reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Bank of Jamaica Reporting</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create New Report
                  </button>
                </div>

                <div className="space-y-4">
                  {bojReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-6 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium">
                              {report.reportType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Report
                            </h4>
                            <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Period: {report.period}</p>
                          <p className="text-sm text-gray-600">Due: {report.dueDate}</p>
                          {report.submittedDate && (
                            <p className="text-sm text-green-600">Submitted: {report.submittedDate}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Compliance Score</p>
                          <p className={`text-2xl font-bold ${getComplianceScoreColor(report.complianceScore)}`}>
                            {report.complianceScore}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Total Transactions</p>
                          <p className="font-medium">{report.totalTransactions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Value</p>
                          <p className="font-medium">{formatCurrency(report.totalValue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Flagged Transactions</p>
                          <p className="font-medium text-red-600">{report.flaggedTransactions}</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        {report.status === 'draft' && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Continue Editing
                          </button>
                        )}
                        <button className="px-4 py-2 border rounded hover:bg-gray-50">
                          View Details
                        </button>
                        <button className="px-4 py-2 border rounded hover:bg-gray-50">
                          Download
                        </button>
                        {report.status === 'pending_review' && (
                          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Submit to BOJ
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NHT Integration Tab */}
            {activeTab === 'nht-integration' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">National Housing Trust Integration</h3>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Process Contributions
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow p-4">
                    <h4 className="text-sm font-medium text-gray-600">Total Employees</h4>
                    <p className="text-2xl font-bold text-blue-600">{nhtIntegrations.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h4 className="text-sm font-medium text-gray-600">Monthly Contributions</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(nhtIntegrations.reduce((sum, emp) => sum + emp.contributionAmount, 0))}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h4 className="text-sm font-medium text-gray-600">Completed</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {nhtIntegrations.filter(emp => emp.status === 'completed').length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h4 className="text-sm font-medium text-gray-600">Failed/Pending</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {nhtIntegrations.filter(emp => emp.status === 'failed' || emp.status === 'pending').length}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">Employee</th>
                        <th className="text-left py-3 px-4">TRN</th>
                        <th className="text-left py-3 px-4">Contribution</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Last Updated</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nhtIntegrations.map((employee) => (
                        <tr key={employee.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{employee.employeeName}</p>
                              <p className="text-xs text-gray-600">ID: {employee.employeeId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{employee.trn}</td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{formatCurrency(employee.contributionAmount)}</p>
                            <p className="text-xs text-gray-600">
                              Total: {formatCurrency(employee.contributionHistory)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(employee.status)}`}>
                              {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(employee.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">View</button>
                              {employee.status === 'failed' && (
                                <button className="text-green-600 hover:text-green-800">Retry</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Suspicious Activity Tab */}
            {activeTab === 'suspicious-activity' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Suspicious Activity Monitoring</h3>
                  <div className="flex space-x-3">
                    <select className="px-4 py-2 border rounded-md">
                      <option value="">All Risk Levels</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                      File SAR
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {suspiciousActivities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-6 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(activity.riskLevel)}`}>
                              {activity.riskLevel.toUpperCase()} RISK
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(activity.investigationStatus)}`}>
                              {activity.investigationStatus.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium">{activity.userName}</h4>
                          <p className="text-sm text-gray-600">
                            Activity Type: {activity.activityType.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm mt-2">{activity.description}</p>
                          {activity.assignedTo && (
                            <p className="text-xs text-blue-600 mt-1">Assigned to: {activity.assignedTo}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Detected</p>
                          <p className="font-medium">{new Date(activity.detectedDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.detectedDate).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        {activity.investigationStatus === 'pending' && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Start Investigation
                          </button>
                        )}
                        {activity.investigationStatus === 'investigating' && (
                          <>
                            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                              File SAR
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                              Clear Case
                            </button>
                          </>
                        )}
                        <button className="px-4 py-2 border rounded hover:bg-gray-50">
                          View User Profile
                        </button>
                        <button className="px-4 py-2 border rounded hover:bg-gray-50">
                          Transaction History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Trail Tab */}
            {activeTab === 'audit-trail' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Compliance Audit Trail</h3>
                
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="font-medium mb-4">🔍 Upcoming Audit Information</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Last Audit Date</p>
                      <p className="font-medium">{complianceMetrics?.lastAuditDate}</p>
                      
                      <p className="text-sm text-gray-600 mb-2 mt-4">Next Audit Due</p>
                      <p className="font-medium text-red-600">{complianceMetrics?.nextAuditDue}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Audit Preparation Status</p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">75% Complete</p>
                    </div>
                  </div>
                  
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Generate Audit Preparation Report
                  </button>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-medium mb-4">Recent Compliance Activities</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border-l-4 border-green-400 bg-green-50">
                      <div>
                        <p className="font-medium">BOJ Quarterly Report Submitted</p>
                        <p className="text-sm text-gray-600">Q3 2024 report successfully submitted to Bank of Jamaica</p>
                      </div>
                      <p className="text-sm text-gray-500">Oct 25, 2024</p>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border-l-4 border-blue-400 bg-blue-50">
                      <div>
                        <p className="font-medium">KYC Verification Completed</p>
                        <p className="text-sm text-gray-600">Batch verification of 45 new customer profiles</p>
                      </div>
                      <p className="text-sm text-gray-500">Oct 23, 2024</p>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border-l-4 border-red-400 bg-red-50">
                      <div>
                        <p className="font-medium">Suspicious Activity Report Filed</p>
                        <p className="text-sm text-gray-600">SAR filed for unusual transaction patterns</p>
                      </div>
                      <p className="text-sm text-gray-500">Oct 20, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}