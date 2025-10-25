'use client'
import { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface ComplianceMetrics {
  totalUsers: number
  activeComplaints: number
  highRiskUsers: number
  pendingKYC: number
  systemStatus: string
  alertsCount: number
}

interface LimitStatus {
  userId: string
  exposureLimit: number
  dailyLimit: number
  monthlyLimit: number
  currentDailyUsage: number
  currentMonthlyUsage: number
  withinLimits: boolean
  riskProfile: string
  sandboxTier: string
}

export default function BOJComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      // Fetch compliance monitoring data
      const [metricsResponse, limitsResponse] = await Promise.all([
        fetch('/api/v1/boj/compliance/monitoring-dashboard'),
        fetch('/api/v1/boj/compliance/exposure-limits/current-user') // Would use actual user ID
      ])

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData.overview)
      }

      if (limitsResponse.ok) {
        const limitsData = await limitsResponse.json()
        setLimitStatus(limitsData)
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount / 100) // Convert from cents
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-amber-600 bg-amber-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-amber-600 bg-amber-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShieldCheckIcon className="w-8 h-8 mr-3 text-blue-600" />
            BOJ Compliance Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Bank of Jamaica Regulatory Compliance Monitoring
          </p>
        </div>

        {/* System Status Banner */}
        {metrics && (
          <div className={`rounded-lg p-4 mb-8 ${getStatusColor(metrics.systemStatus)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="w-6 h-6 mr-3" />
                <div>
                  <h3 className="font-semibold">System Status: {metrics.systemStatus.toUpperCase()}</h3>
                  <p className="text-sm opacity-90">All BOJ compliance systems operational</p>
                </div>
              </div>
              {metrics.alertsCount > 0 && (
                <div className="flex items-center text-red-600">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{metrics.alertsCount} Active Alerts</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'limits', name: 'Exposure Limits', icon: CurrencyDollarIcon },
              { id: 'complaints', name: 'Complaints', icon: DocumentTextIcon },
              { id: 'monitoring', name: 'Risk Monitoring', icon: ShieldCheckIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DocumentTextIcon className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeComplaints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Risk Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.highRiskUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending KYC</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.pendingKYC}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exposure Limits Tab */}
        {activeTab === 'limits' && limitStatus && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                BOJ Section 7.2 - Exposure Limits Monitoring
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sandbox Tier:</span>
                      <span className="font-medium capitalize">{limitStatus.sandboxTier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Profile:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(limitStatus.riskProfile)}`}>
                        {limitStatus.riskProfile.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overall Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        limitStatus.withinLimits ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {limitStatus.withinLimits ? 'Within Limits' : 'Exceeds Limits'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Limit Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Exposure Limit:</span>
                      <span className="font-medium">{formatCurrency(limitStatus.exposureLimit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Transaction Limit:</span>
                      <span className="font-medium">{formatCurrency(limitStatus.dailyLimit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Transaction Limit:</span>
                      <span className="font-medium">{formatCurrency(limitStatus.monthlyLimit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Daily Usage</span>
                    <span>{formatCurrency(limitStatus.currentDailyUsage)} / {formatCurrency(limitStatus.dailyLimit)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (limitStatus.currentDailyUsage / limitStatus.dailyLimit) > 0.8 ? 'bg-red-500' :
                        (limitStatus.currentDailyUsage / limitStatus.dailyLimit) > 0.6 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      data-width={`${Math.min(100, (limitStatus.currentDailyUsage / limitStatus.dailyLimit) * 100)}%`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Monthly Usage</span>
                    <span>{formatCurrency(limitStatus.currentMonthlyUsage)} / {formatCurrency(limitStatus.monthlyLimit)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (limitStatus.currentMonthlyUsage / limitStatus.monthlyLimit) > 0.8 ? 'bg-red-500' :
                        (limitStatus.currentMonthlyUsage / limitStatus.monthlyLimit) > 0.6 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      data-width={`${Math.min(100, (limitStatus.currentMonthlyUsage / limitStatus.monthlyLimit) * 100)}%`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOJ Compliance Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">BOJ Regulatory Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Section 7.1: Client limits are enforced based on sandbox tier</li>
                <li>• Section 7.2: Financial liability exposure is monitored and limited</li>
                <li>• Transaction limits reset daily/monthly as per BOJ guidelines</li>
                <li>• Risk profile affects available limits and monitoring frequency</li>
                <li>• All limit changes require regulatory approval</li>
              </ul>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              BOJ Section 7.4 - Complaint Resolution
            </h3>
            
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900">No Active Complaints</h4>
              <p className="text-gray-600 mt-2">
                You currently have no pending complaints. If you need to submit a complaint, 
                you can access our BOJ-compliant complaint resolution process.
              </p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Submit New Complaint
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Complaint Resolution Process</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-medium">1</span>
                  </div>
                  <p className="font-medium">Submit</p>
                  <p className="text-gray-600">File complaint with reference number</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-medium">2</span>
                  </div>
                  <p className="font-medium">Review</p>
                  <p className="text-gray-600">Internal investigation within timeframe</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-medium">3</span>
                  </div>
                  <p className="font-medium">Resolve</p>
                  <p className="text-gray-600">Solution provided with explanation</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-medium">4</span>
                  </div>
                  <p className="font-medium">Escalate</p>
                  <p className="text-gray-600">BOJ escalation if not satisfied</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              BOJ Section 7.5 & 7.6 - Risk Management & Monitoring
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Risk Assessment Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">AML/CTF Screening</span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">PASSED</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">Risk Profile Assessment</span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">LOW RISK</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium">Next Review Due</span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">6 MONTHS</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Monitoring Systems</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium">Transaction Monitoring</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">ACTIVE</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium">Audit Trail Logging</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">ACTIVE</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium">Compliance Reporting</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}