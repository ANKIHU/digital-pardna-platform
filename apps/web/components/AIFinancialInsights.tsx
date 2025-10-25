'use client'
import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface FinancialInsight {
  id: string
  type: 'savings' | 'spending' | 'goal' | 'warning' | 'achievement'
  title: string
  description: string
  amount?: number
  percentage?: number
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}

interface SpendingCategory {
  category: string
  amount: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

export default function AIFinancialInsights() {
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [spendingBreakdown, setSpendingBreakdown] = useState<SpendingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'insights' | 'breakdown'>('insights')

  useEffect(() => {
    fetchFinancialInsights()
  }, [])

  const fetchFinancialInsights = async () => {
    setLoading(true)
    
    // Simulate AI-generated insights based on user data
    // In production, this would call your AI service
    setTimeout(() => {
      setInsights([
        {
          id: '1',
          type: 'savings',
          title: 'Great Savings Progress!',
          description: 'Yuh save 15% more than last month. Keep it up and yuh might reach yuh goal 2 months early!',
          percentage: 15,
          actionable: true,
          priority: 'medium'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Pardna Payment Due Soon',
          description: 'Yuh next pardna payment of JMD $5,000 due in 3 days. Make sure yuh account ready!',
          amount: 500000, // In cents
          actionable: true,
          priority: 'high'
        },
        {
          id: '3',
          type: 'spending',
          title: 'Food Spending Increased',
          description: 'Yuh spend 22% more on food this month. Consider meal planning to save money.',
          percentage: 22,
          actionable: true,
          priority: 'medium'
        },
        {
          id: '4',
          type: 'goal',
          title: 'Emergency Fund Goal',
          description: 'Yuh 60% of the way to yuh JMD $50,000 emergency fund. Excellent progress!',
          amount: 3000000, // 30,000 JMD in cents
          percentage: 60,
          actionable: false,
          priority: 'low'
        },
        {
          id: '5',
          type: 'achievement',
          title: 'Perfect Payment Record!',
          description: 'Yuh have 100% on-time payments for the last 6 months. Outstanding financial discipline!',
          actionable: false,
          priority: 'low'
        }
      ])

      setSpendingBreakdown([
        { category: 'Food & Dining', amount: 1500000, percentage: 30, trend: 'up' },
        { category: 'Transportation', amount: 1000000, percentage: 20, trend: 'stable' },
        { category: 'Utilities', amount: 750000, percentage: 15, trend: 'down' },
        { category: 'Entertainment', amount: 625000, percentage: 12.5, trend: 'up' },
        { category: 'Shopping', amount: 500000, percentage: 10, trend: 'stable' },
        { category: 'Healthcare', amount: 375000, percentage: 7.5, trend: 'down' },
        { category: 'Other', amount: 250000, percentage: 5, trend: 'stable' }
      ])

      setLoading(false)
    }, 1500)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount / 100)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'savings': return <TrendingUpIcon className="w-6 h-6 text-green-600" />
      case 'warning': return <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
      case 'spending': return <TrendingDownIcon className="w-6 h-6 text-red-600" />
      case 'goal': return <LightBulbIcon className="w-6 h-6 text-blue-600" />
      case 'achievement': return <CheckCircleIcon className="w-6 h-6 text-green-600" />
      default: return <ChartBarIcon className="w-6 h-6 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-amber-500 bg-amber-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="w-4 h-4 text-red-500" />
      case 'down': return <TrendingDownIcon className="w-4 h-4 text-green-500" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Financial Insights</h3>
              <p className="text-sm text-gray-600">Personalized analysis by Keisha AI</p>
            </div>
          </div>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'breakdown'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                    
                    {insight.amount && (
                      <p className="text-sm font-medium text-gray-900">
                        Amount: {formatCurrency(insight.amount)}
                      </p>
                    )}
                    
                    {insight.percentage && (
                      <p className="text-sm font-medium text-gray-900">
                        Change: {insight.percentage > 0 ? '+' : ''}{insight.percentage}%
                      </p>
                    )}
                    
                    {insight.actionable && (
                      <button className="mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-4">Spending Breakdown This Month</h4>
            {spendingBreakdown.map((category) => (
              <div key={category.category} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{category.category}</span>
                      {getTrendIcon(category.trend)}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        {formatCurrency(category.amount)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {category.percentage}% of total
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-24">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      data-width={`${category.percentage}%`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-JM')}
          </p>
          <button
            onClick={fetchFinancialInsights}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh Insights
          </button>
        </div>
      </div>
    </div>
  )
}