'use client';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import BOJComplianceDashboard from './BOJComplianceDashboard';
import KeishaAIAssistant from './KeishaAIAssistant';
import AIFinancialInsights from './AIFinancialInsights';
import { 
  HomeIcon, 
  ShieldCheckIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [circles, setCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'compliance', 'insights'

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      const data = await api.getCircles();
      setCircles(data.circles || []);
    } catch (error) {
      console.error('Failed to load circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCircleData = async (circleId: string) => {
    try {
      const [roundsData, paymentsData] = await Promise.all([
        api.getCircleRounds(circleId),
        api.getCirclePayments(circleId)
      ]);
      setRounds(roundsData.rounds || []);
      setPayments(paymentsData.payments || []);
    } catch (error) {
      console.error('Failed to load circle data:', error);
    }
  };

  const selectCircle = (circle: any) => {
    setSelectedCircle(circle);
    loadCircleData(circle.id);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  // If compliance tab is active, show BOJ dashboard
  if (activeTab === 'compliance') {
    return (
      <div>
        <BOJComplianceDashboard />
        <KeishaAIAssistant />
      </div>
    );
  }

  // If insights tab is active, show AI insights
  if (activeTab === 'insights') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <HomeIcon className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'compliance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
                BOJ Compliance
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'insights'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SparklesIcon className="w-4 h-4 inline mr-2" />
                AI Insights
              </button>
            </nav>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Financial Insights</h1>
            
            <div className="space-y-8">
              <AIFinancialInsights />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Summary Card */}
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <SparklesIcon className="w-8 h-8" />
                    <div>
                      <h3 className="text-xl font-semibold">Keisha AI Summary</h3>
                      <p className="text-blue-100">Your financial assistant's insights</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm">
                      "Mi see yuh doing great with yuh pardna payments! Yuh on track fi reach yuh savings goal early. 
                      Just watch dat food spending - maybe try some meal prep fi save some money."
                    </p>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>Financial Score: 8.5/10</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Risk Level: Low</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <SparklesIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Ask Keisha Anything</p>
                          <p className="text-sm text-gray-600">Get personalized financial advice</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <ChartBarIcon className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Optimize Budget</p>
                          <p className="text-sm text-gray-600">AI budget optimization suggestions</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <UserGroupIcon className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">Find Pardna Matches</p>
                          <p className="text-sm text-gray-600">AI-powered circle recommendations</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <KeishaAIAssistant />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HomeIcon className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compliance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
              BOJ Compliance
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'insights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SparklesIcon className="w-4 h-4 inline mr-2" />
              AI Insights
            </button>
          </nav>
        </div>
      </div>

      <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Digital Pardna Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Circles List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Circles</h2>
            {circles.length === 0 ? (
              <p className="text-gray-500">No circles found</p>
            ) : (
              <div className="space-y-3">
                {circles.map((circle: any) => (
                  <div
                    key={circle.id}
                    onClick={() => selectCircle(circle)}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedCircle?.id === circle.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium">{circle.name || 'Unnamed Circle'}</h3>
                    <p className="text-sm text-gray-600">
                      ${(circle.hand_amount / 100).toFixed(2)} {circle.currency}
                    </p>
                    <p className="text-xs text-gray-500">{circle.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Circle Details */}
          <div className="lg:col-span-2">
            {selectedCircle ? (
              <div className="space-y-6">
                {/* Circle Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">{selectedCircle.name}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Hand Amount:</span>
                      <p className="font-medium">${(selectedCircle.hand_amount / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Currency:</span>
                      <p className="font-medium">{selectedCircle.currency}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium capitalize">{selectedCircle.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Members:</span>
                      <p className="font-medium">{selectedCircle.members?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Rounds */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Rounds</h3>
                  {rounds.length === 0 ? (
                    <p className="text-gray-500">No rounds found</p>
                  ) : (
                    <div className="space-y-3">
                      {rounds.map((round: any) => (
                        <div key={round.roundId} className="border rounded p-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Round {round.roundNumber}</h4>
                            <span className={`px-2 py-1 rounded text-xs ${
                              round.status === 'active' ? 'bg-green-100 text-green-800' :
                              round.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {round.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {round.contributions} contributions • ${round.totalAmount / 100}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
                  {payments.length === 0 ? (
                    <p className="text-gray-500">No payments found</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.slice(0, 5).map((payment: any) => (
                        <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{payment.member}</p>
                            <p className="text-sm text-gray-600">{payment.paymentRef}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${payment.amount / 100}</p>
                            <p className="text-xs text-gray-500">{payment.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">Select a circle to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <KeishaAIAssistant />
    </div>
  );
}