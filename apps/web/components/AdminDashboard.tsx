'use client';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AdminMetrics {
  totalUsers: number;
  activeCircles: number;
  totalVolume: number;
  avgCircleSize: number;
  monthlyGrowth: number;
  retentionRate: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  totalContributions: number;
  circlesJoined: number;
  riskScore: number;
}

interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  type: 'suspicious_payment' | 'multiple_accounts' | 'velocity_check' | 'kyc_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

interface ComplianceReport {
  id: string;
  type: 'boj' | 'nht' | 'aml' | 'kyc';
  period: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  dueDate: string;
  submittedDate?: string;
  completionRate: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [metricsRes, usersRes, fraudRes, complianceRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getUsers(),
        api.getFraudAlerts(),
        api.getComplianceReports()
      ]);
      
      setMetrics(metricsRes.metrics || mockMetrics);
      setUsers(usersRes.users || mockUsers);
      setFraudAlerts(fraudRes.alerts || mockFraudAlerts);
      setComplianceReports(complianceRes.reports || mockComplianceReports);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setMetrics(mockMetrics);
      setUsers(mockUsers);
      setFraudAlerts(mockFraudAlerts);
      setComplianceReports(mockComplianceReports);
    } finally {
      setLoading(false);
    }
  };

  const mockMetrics: AdminMetrics = {
    totalUsers: 2847,
    activeCircles: 156,
    totalVolume: 45673000,
    avgCircleSize: 8.4,
    monthlyGrowth: 12.5,
    retentionRate: 87.3
  };

  const mockUsers: User[] = [
    {
      id: '1',
      email: 'john.doe@email.com',
      name: 'John Doe',
      status: 'active',
      joinDate: '2024-08-15',
      totalContributions: 125000,
      circlesJoined: 3,
      riskScore: 2
    },
    {
      id: '2',
      email: 'sarah.wilson@email.com',
      name: 'Sarah Wilson',
      status: 'suspended',
      joinDate: '2024-06-20',
      totalContributions: 67500,
      circlesJoined: 2,
      riskScore: 8
    },
    {
      id: '3',
      email: 'michael.brown@email.com',
      name: 'Michael Brown',
      status: 'pending',
      joinDate: '2024-10-25',
      totalContributions: 0,
      circlesJoined: 0,
      riskScore: 3
    }
  ];

  const mockFraudAlerts: FraudAlert[] = [
    {
      id: '1',
      userId: '2',
      userName: 'Sarah Wilson',
      type: 'velocity_check',
      severity: 'high',
      description: 'Multiple large transactions in short timeframe',
      timestamp: '2024-10-28T14:30:00Z',
      status: 'investigating'
    },
    {
      id: '2',
      userId: '4',
      userName: 'Robert Taylor',
      type: 'multiple_accounts',
      severity: 'medium',
      description: 'Potential duplicate account detected',
      timestamp: '2024-10-27T09:15:00Z',
      status: 'open'
    },
    {
      id: '3',
      userId: '7',
      userName: 'Lisa Anderson',
      type: 'kyc_mismatch',
      severity: 'critical',
      description: 'KYC information does not match bank records',
      timestamp: '2024-10-26T16:45:00Z',
      status: 'open'
    }
  ];

  const mockComplianceReports: ComplianceReport[] = [
    {
      id: '1',
      type: 'boj',
      period: 'Q3 2024',
      status: 'submitted',
      dueDate: '2024-10-31',
      submittedDate: '2024-10-25',
      completionRate: 100
    },
    {
      id: '2',
      type: 'aml',
      period: 'October 2024',
      status: 'pending',
      dueDate: '2024-11-05',
      completionRate: 78
    },
    {
      id: '3',
      type: 'nht',
      period: 'Q3 2024',
      status: 'approved',
      dueDate: '2024-10-15',
      submittedDate: '2024-10-10',
      completionRate: 100
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-400 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-green-600';
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Export Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">{metrics.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">+{metrics.monthlyGrowth}% this month</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Active Circles</h3>
              <p className="text-2xl font-bold text-green-600">{metrics.activeCircles}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Volume</h3>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.totalVolume)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Circle Size</h3>
              <p className="text-2xl font-bold text-orange-600">{metrics.avgCircleSize}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Retention Rate</h3>
              <p className="text-2xl font-bold text-teal-600">{metrics.retentionRate}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Fraud Alerts</h3>
              <p className="text-2xl font-bold text-red-600">{fraudAlerts.filter(a => a.status === 'open').length}</p>
              <p className="text-xs text-red-600">Active alerts</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'System Overview' },
                { id: 'users', label: 'User Management' },
                { id: 'fraud', label: 'Fraud Detection' },
                { id: 'compliance', label: 'Compliance Reports' },
                { id: 'analytics', label: 'Analytics' }
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
                    <h3 className="text-lg font-semibold mb-4">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>API Response Time</span>
                        <span className="text-green-600 font-medium">127ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Performance</span>
                        <span className="text-green-600 font-medium">Optimal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Connections</span>
                        <span className="font-medium">2,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Server Uptime</span>
                        <span className="text-green-600 font-medium">99.97%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>New Users Today</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Circles Created</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payments Processed</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Support Tickets</span>
                        <span className="font-medium">4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="px-4 py-2 border rounded-md"
                    />
                    <select className="px-4 py-2 border rounded-md">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Join Date</th>
                        <th className="text-left py-3 px-4">Circles</th>
                        <th className="text-left py-3 px-4">Total Contributions</th>
                        <th className="text-left py-3 px-4">Risk Score</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-gray-600 text-xs">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(user.status)}`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{user.joinDate}</td>
                          <td className="py-3 px-4">{user.circlesJoined}</td>
                          <td className="py-3 px-4">{formatCurrency(user.totalContributions)}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getRiskScoreColor(user.riskScore)}`}>
                              {user.riskScore}/10
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              View
                            </button>
                            {user.status === 'active' ? (
                              <button className="text-red-600 hover:text-red-800">
                                Suspend
                              </button>
                            ) : (
                              <button className="text-green-600 hover:text-green-800">
                                Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Fraud Detection Tab */}
            {activeTab === 'fraud' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Fraud Detection</h3>
                  <div className="flex space-x-3">
                    <select className="px-4 py-2 border rounded-md">
                      <option value="">All Severity</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select className="px-4 py-2 border rounded-md">
                      <option value="">All Status</option>
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {fraudAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-6 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(alert.status)}`}>
                              {alert.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-medium text-lg">{alert.userName}</h4>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          Investigate
                        </button>
                        <button className="px-4 py-2 border rounded hover:bg-gray-50">
                          Mark False Positive
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Compliance Reports</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Pending Reports</h4>
                    {complianceReports.filter(r => r.status === 'pending').map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 bg-yellow-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{report.type.toUpperCase()} Report</h5>
                            <p className="text-sm text-gray-600">{report.period}</p>
                            <p className="text-sm">Due: {report.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{report.completionRate}% Complete</p>
                            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${report.completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2">
                            Continue
                          </button>
                          <button className="px-4 py-2 border rounded hover:bg-gray-50">
                            Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Submissions</h4>
                    {complianceReports.filter(r => r.status !== 'pending').map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{report.type.toUpperCase()} Report</h5>
                            <p className="text-sm text-gray-600">{report.period}</p>
                            {report.submittedDate && (
                              <p className="text-sm">Submitted: {report.submittedDate}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Advanced Analytics</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium mb-4">User Growth Trend</h4>
                    <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                      <p className="text-gray-500">User Growth Chart</p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium mb-4">Transaction Volume</h4>
                    <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                      <p className="text-gray-500">Volume Chart</p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium mb-4">Circle Performance</h4>
                    <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                      <p className="text-gray-500">Performance Metrics</p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium mb-4">Risk Assessment</h4>
                    <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                      <p className="text-gray-500">Risk Distribution</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Name:</span> {selectedUser.name}</div>
                      <div><span className="text-gray-600">Email:</span> {selectedUser.email}</div>
                      <div><span className="text-gray-600">Join Date:</span> {selectedUser.joinDate}</div>
                      <div>
                        <span className="text-gray-600">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedUser.status)}`}>
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Activity Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Circles Joined:</span> {selectedUser.circlesJoined}</div>
                      <div><span className="text-gray-600">Total Contributions:</span> {formatCurrency(selectedUser.totalContributions)}</div>
                      <div>
                        <span className="text-gray-600">Risk Score:</span> 
                        <span className={`ml-2 font-medium ${getRiskScoreColor(selectedUser.riskScore)}`}>
                          {selectedUser.riskScore}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-6 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Edit User
                  </button>
                  {selectedUser.status === 'active' ? (
                    <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                      Suspend User
                    </button>
                  ) : (
                    <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      Activate User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}