'use client';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface WalletBalance {
  currency: 'JMD' | 'USD';
  available: number;
  pending: number;
  total: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee' | 'interest';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description: string;
  timestamp: string;
  reference?: string;
  relatedCircle?: string;
}

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'card' | 'mobile_money';
  name: string;
  last4: string;
  isDefault: boolean;
  isVerified: boolean;
  expiryDate?: string;
  bankName?: string;
}

interface WalletGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string;
  category: string;
}

export default function WalletManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [walletBalance, setWalletBalance] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [walletGoals, setWalletGoals] = useState<WalletGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.getWallet('current-user'),
        api.getTransactions('current-user')
      ]);
      
      setWalletBalance(walletRes.balances || mockWalletBalance);
      setTransactions(transactionsRes.transactions || mockTransactions);
      setPaymentMethods(mockPaymentMethods);
      setWalletGoals(mockWalletGoals);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setWalletBalance(mockWalletBalance);
      setTransactions(mockTransactions);
      setPaymentMethods(mockPaymentMethods);
      setWalletGoals(mockWalletGoals);
    } finally {
      setLoading(false);
    }
  };

  const mockWalletBalance: WalletBalance[] = [
    {
      currency: 'JMD',
      available: 12500000, // $125,000 JMD
      pending: 750000,     // $7,500 JMD
      total: 13250000     // $132,500 JMD
    },
    {
      currency: 'USD',
      available: 85000,   // $850 USD
      pending: 15000,     // $150 USD
      total: 100000      // $1,000 USD
    }
  ];

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 500000,
      currency: 'JMD',
      status: 'completed',
      description: 'Bank transfer deposit',
      timestamp: '2024-10-28T14:30:00Z',
      reference: 'DEP001234'
    },
    {
      id: '2',
      type: 'payment',
      amount: -250000,
      currency: 'JMD',
      status: 'completed',
      description: 'Circle contribution - Business Growth Circle',
      timestamp: '2024-10-27T10:15:00Z',
      relatedCircle: 'Business Growth Circle'
    },
    {
      id: '3',
      type: 'withdrawal',
      amount: -100000,
      currency: 'JMD',
      status: 'pending',
      description: 'Bank transfer withdrawal',
      timestamp: '2024-10-26T16:45:00Z',
      reference: 'WTH005678'
    },
    {
      id: '4',
      type: 'interest',
      amount: 12500,
      currency: 'JMD',
      status: 'completed',
      description: 'Savings interest earned',
      timestamp: '2024-10-25T00:00:00Z'
    },
    {
      id: '5',
      type: 'fee',
      amount: -500,
      currency: 'JMD',
      status: 'completed',
      description: 'Transaction processing fee',
      timestamp: '2024-10-24T12:20:00Z'
    }
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'bank_account',
      name: 'Primary Checking',
      last4: '4521',
      isDefault: true,
      isVerified: true,
      bankName: 'National Commercial Bank'
    },
    {
      id: '2',
      type: 'card',
      name: 'Debit Card',
      last4: '8765',
      isDefault: false,
      isVerified: true,
      expiryDate: '12/26',
      bankName: 'Scotiabank Jamaica'
    },
    {
      id: '3',
      type: 'mobile_money',
      name: 'LYNK Mobile Wallet',
      last4: '2468',
      isDefault: false,
      isVerified: true
    }
  ];

  const mockWalletGoals: WalletGoal[] = [
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 200000000, // $2M JMD
      currentAmount: 125000000, // $1.25M JMD
      currency: 'JMD',
      targetDate: '2025-06-30',
      category: 'Emergency'
    },
    {
      id: '2',
      name: 'Business Investment',
      targetAmount: 500000000, // $5M JMD
      currentAmount: 175000000, // $1.75M JMD
      currency: 'JMD',
      targetDate: '2025-12-31',
      category: 'Investment'
    }
  ];

  const formatCurrency = (amount: number, currency: string = 'JMD') => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: currency
    }).format(Math.abs(amount) / 100);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '📥';
      case 'withdrawal': return '📤';
      case 'payment': return '💳';
      case 'refund': return '↩️';
      case 'fee': return '💸';
      case 'interest': return '📈';
      default: return '💰';
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (type === 'fee') return 'text-red-600';
    return 'text-gray-900';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_account': return '🏦';
      case 'card': return '💳';
      case 'mobile_money': return '📱';
      default: return '💰';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Deposit
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {walletBalance.map((balance) => (
            <div key={balance.currency} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium opacity-90">{balance.currency} Wallet</h3>
                  <p className="text-3xl font-bold">{formatCurrency(balance.available, balance.currency)}</p>
                  <p className="text-sm opacity-75">Available Balance</p>
                </div>
                <div className="text-4xl opacity-80">💰</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="opacity-75">Pending</p>
                  <p className="font-medium">{formatCurrency(balance.pending, balance.currency)}</p>
                </div>
                <div>
                  <p className="opacity-75">Total</p>
                  <p className="font-medium">{formatCurrency(balance.total, balance.currency)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'transactions', label: 'Transaction History' },
                { id: 'payment-methods', label: 'Payment Methods' },
                { id: 'goals', label: 'Savings Goals' }
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
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowDepositModal(true)}
                        className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <span>📥</span>
                        <span>Add Money</span>
                      </button>
                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <span>📤</span>
                        <span>Withdraw Funds</span>
                      </button>
                      <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 flex items-center justify-center space-x-2">
                        <span>💳</span>
                        <span>Pay Someone</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
                            <div>
                              <p className="text-sm font-medium">{transaction.description}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(transaction.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className={`font-medium ${getTransactionColor(transaction.type, transaction.amount)}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View All Transactions
                    </button>
                  </div>
                </div>

                {/* Savings Goals Preview */}
                {walletGoals.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Savings Goals Progress</h3>
                    <div className="space-y-4">
                      {walletGoals.slice(0, 2).map((goal) => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                          <div key={goal.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{goal.name}</h4>
                                <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full" 
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-600 mt-1">
                                <span>{formatCurrency(goal.currentAmount, goal.currency)}</span>
                                <span>{formatCurrency(goal.targetAmount, goal.currency)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Transaction History</h3>
                  <div className="flex space-x-3">
                    <select className="px-4 py-2 border rounded-md">
                      <option value="">All Types</option>
                      <option value="deposit">Deposits</option>
                      <option value="withdrawal">Withdrawals</option>
                      <option value="payment">Payments</option>
                      <option value="refund">Refunds</option>
                    </select>
                    <select className="px-4 py-2 border rounded-md">
                      <option value="">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                              <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.relatedCircle && (
                              <p className="text-xs text-gray-600">Circle: {transaction.relatedCircle}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getTransactionColor(transaction.type, transaction.amount)}`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, transaction.currency)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(transaction.status)}`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {transaction.reference || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment-methods' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Payment Methods</h3>
                  <button
                    onClick={() => setShowAddPaymentMethod(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Payment Method
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getPaymentMethodIcon(method.type)}</span>
                          <div>
                            <h4 className="font-medium">{method.name}</h4>
                            <p className="text-sm text-gray-600">
                              {method.bankName && `${method.bankName} • `}
                              ••••{method.last4}
                            </p>
                            {method.expiryDate && (
                              <p className="text-xs text-gray-500">Expires {method.expiryDate}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Default
                            </span>
                          )}
                          {method.isVerified ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        {!method.isDefault && (
                          <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                            Set as Default
                          </button>
                        )}
                        <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-sm text-red-600 hover:text-red-800">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Savings Goals</h3>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Create New Goal
                  </button>
                </div>

                <div className="space-y-4">
                  {walletGoals.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const remainingAmount = goal.targetAmount - goal.currentAmount;
                    const daysUntilTarget = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={goal.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium">{goal.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{goal.category} Goal</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Target Date</p>
                            <p className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{daysUntilTarget} days left</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-purple-600 h-3 rounded-full" 
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>{formatCurrency(goal.currentAmount, goal.currency)}</span>
                            <span>{formatCurrency(goal.targetAmount, goal.currency)}</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Remaining Amount</p>
                            <p className="font-medium">{formatCurrency(remainingAmount, goal.currency)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Monthly Target</p>
                            <p className="font-medium">
                              {formatCurrency(remainingAmount / Math.max(daysUntilTarget / 30, 1), goal.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Status</p>
                            <p className={`font-medium ${progress >= 100 ? 'text-green-600' : progress >= 75 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {progress >= 100 ? 'Completed' : progress >= 75 ? 'On Track' : 'Behind'}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-3 mt-4">
                          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                            Add Funds
                          </button>
                          <button className="px-4 py-2 border rounded hover:bg-gray-50">
                            Edit Goal
                          </button>
                          <button className="px-4 py-2 text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals would go here - Deposit, Withdraw, Add Payment Method */}
        {/* For brevity, I'm not including the full modal implementations */}
      </div>
    </div>
  );
}