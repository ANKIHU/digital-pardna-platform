'use client';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  interestRate: number;
  term: number;
  monthlyPayment: number;
  remainingBalance: number;
  nextPaymentDate: string;
  creditScore: number;
  appliedDate: string;
}

interface LoanApplication {
  amount: number;
  purpose: string;
  businessType: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  collateralType: string;
  collateralValue: number;
  requestedTerm: number;
}

export default function MicrofinanceInterface() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showApplication, setShowApplication] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState<LoanApplication>({
    amount: 0,
    purpose: '',
    businessType: '',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    collateralType: '',
    collateralValue: 0,
    requestedTerm: 12
  });

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await api.getMicrofinanceLoans();
      setLoans(response.loans || mockLoans);
    } catch (error) {
      console.error('Failed to load loans:', error);
      setLoans(mockLoans);
    } finally {
      setLoading(false);
    }
  };

  const mockLoans: Loan[] = [
    {
      id: '1',
      amount: 500000,
      purpose: 'Business Expansion',
      status: 'active',
      interestRate: 8.5,
      term: 24,
      monthlyPayment: 24500,
      remainingBalance: 380000,
      nextPaymentDate: '2025-11-01',
      creditScore: 720,
      appliedDate: '2025-08-15'
    },
    {
      id: '2',
      amount: 200000,
      purpose: 'Inventory Purchase',
      status: 'pending',
      interestRate: 9.0,
      term: 12,
      monthlyPayment: 18200,
      remainingBalance: 200000,
      nextPaymentDate: '',
      creditScore: 680,
      appliedDate: '2025-10-20'
    },
    {
      id: '3',
      amount: 750000,
      purpose: 'Equipment Purchase',
      status: 'completed',
      interestRate: 7.8,
      term: 36,
      monthlyPayment: 23800,
      remainingBalance: 0,
      nextPaymentDate: '',
      creditScore: 750,
      appliedDate: '2023-01-10'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount / 100);
  };

  const calculateAffordability = (income: number, expenses: number, loanAmount: number, term: number) => {
    const monthlyPayment = (loanAmount * 0.085) / 12 * term / (term - 1);
    const disposableIncome = income - expenses;
    const debtToIncomeRatio = (monthlyPayment / income) * 100;
    
    return {
      monthlyPayment,
      disposableIncome,
      debtToIncomeRatio,
      affordable: debtToIncomeRatio < 40 && monthlyPayment < disposableIncome * 0.6
    };
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.applyForLoan(applicationData);
      if (response.success) {
        setShowApplication(false);
        loadLoans();
        // Reset form
        setApplicationData({
          amount: 0,
          purpose: '',
          businessType: '',
          monthlyIncome: 0,
          monthlyExpenses: 0,
          collateralType: '',
          collateralValue: 0,
          requestedTerm: 12
        });
      }
    } catch (error) {
      console.error('Failed to submit loan application:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
                <div key={i} className="h-48 bg-gray-300 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Microfinance Center</h1>
          <button
            onClick={() => setShowApplication(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply for Loan
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Borrowed</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(loans.reduce((sum, loan) => sum + loan.amount, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Outstanding Balance</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(loans.reduce((sum, loan) => sum + loan.remainingBalance, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Payment</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(loans.filter(l => l.status === 'active').reduce((sum, loan) => sum + loan.monthlyPayment, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Credit Score</h3>
            <p className="text-2xl font-bold text-purple-600">720</p>
            <p className="text-xs text-green-600">Excellent</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Loan Overview' },
                { id: 'payments', label: 'Payment Schedule' },
                { id: 'calculator', label: 'Loan Calculator' },
                { id: 'credit', label: 'Credit Building' }
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
                <h3 className="text-lg font-semibold">Your Loans</h3>
                {loans.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💰</div>
                    <p className="text-gray-600">No loans found. Ready to grow your business?</p>
                    <button
                      onClick={() => setShowApplication(true)}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Apply for Your First Loan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan) => (
                      <div key={loan.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium">{loan.purpose}</h4>
                            <p className="text-sm text-gray-600">Applied: {loan.appliedDate}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Loan Amount</p>
                            <p className="font-medium">{formatCurrency(loan.amount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Interest Rate</p>
                            <p className="font-medium">{loan.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Term</p>
                            <p className="font-medium">{loan.term} months</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Monthly Payment</p>
                            <p className="font-medium">{formatCurrency(loan.monthlyPayment)}</p>
                          </div>
                        </div>

                        {loan.status === 'active' && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-600">Remaining Balance</p>
                                <p className="text-lg font-bold text-orange-600">{formatCurrency(loan.remainingBalance)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Next Payment Due</p>
                                <p className="font-medium">{loan.nextPaymentDate}</p>
                              </div>
                              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                Make Payment
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Schedule Tab */}
            {activeTab === 'payments' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Payment Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Payment #</th>
                        <th className="text-left py-3 px-4">Due Date</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Principal</th>
                        <th className="text-left py-3 px-4">Interest</th>
                        <th className="text-left py-3 px-4">Balance</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 12 }, (_, i) => {
                        const paymentDate = new Date();
                        paymentDate.setMonth(paymentDate.getMonth() + i);
                        const isPaid = i < 6;
                        
                        return (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{i + 1}</td>
                            <td className="py-3 px-4">{paymentDate.toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-medium">{formatCurrency(24500)}</td>
                            <td className="py-3 px-4">{formatCurrency(21200)}</td>
                            <td className="py-3 px-4">{formatCurrency(3300)}</td>
                            <td className="py-3 px-4">{formatCurrency(380000 - (i * 21200))}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isPaid ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Calculator Tab */}
            {activeTab === 'calculator' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-6">Loan Calculator</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Loan Amount</label>
                      <input
                        type="number"
                        value={applicationData.amount}
                        onChange={(e) => setApplicationData({ ...applicationData, amount: Number(e.target.value) })}
                        className="w-full p-3 border rounded-md"
                        placeholder="500000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Income</label>
                      <input
                        type="number"
                        value={applicationData.monthlyIncome}
                        onChange={(e) => setApplicationData({ ...applicationData, monthlyIncome: Number(e.target.value) })}
                        className="w-full p-3 border rounded-md"
                        placeholder="150000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Expenses</label>
                      <input
                        type="number"
                        value={applicationData.monthlyExpenses}
                        onChange={(e) => setApplicationData({ ...applicationData, monthlyExpenses: Number(e.target.value) })}
                        className="w-full p-3 border rounded-md"
                        placeholder="80000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Loan Term (months)</label>
                      <select
                        value={applicationData.requestedTerm}
                        onChange={(e) => setApplicationData({ ...applicationData, requestedTerm: Number(e.target.value) })}
                        className="w-full p-3 border rounded-md"
                      >
                        <option value={6}>6 months</option>
                        <option value={12}>12 months</option>
                        <option value={18}>18 months</option>
                        <option value={24}>24 months</option>
                        <option value={36}>36 months</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Loan Calculation</h4>
                    {applicationData.amount > 0 && applicationData.monthlyIncome > 0 && (
                      (() => {
                        const calc = calculateAffordability(
                          applicationData.monthlyIncome,
                          applicationData.monthlyExpenses,
                          applicationData.amount,
                          applicationData.requestedTerm
                        );
                        
                        return (
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600">Monthly Payment</p>
                              <p className="text-lg font-bold">{formatCurrency(calc.monthlyPayment)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Debt-to-Income Ratio</p>
                              <p className={`text-lg font-bold ${calc.debtToIncomeRatio < 40 ? 'text-green-600' : 'text-red-600'}`}>
                                {calc.debtToIncomeRatio.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Disposable Income After Payment</p>
                              <p className="text-lg font-bold">{formatCurrency(calc.disposableIncome - calc.monthlyPayment)}</p>
                            </div>
                            <div className={`p-3 rounded ${calc.affordable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              <p className="font-medium">
                                {calc.affordable ? '✅ Loan appears affordable' : '❌ Loan may be challenging to repay'}
                              </p>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Credit Building Tab */}
            {activeTab === 'credit' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Credit Building Tools</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Credit Score: 720</h4>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Excellent credit score! You qualify for the best rates.</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Payment History</span>
                        <span className="text-green-600 font-medium">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credit Utilization</span>
                        <span className="text-green-600 font-medium">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credit Mix</span>
                        <span className="text-yellow-600 font-medium">Fair</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">💡 Credit Improvement Tips</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Make all payments on time</li>
                        <li>• Keep credit utilization below 30%</li>
                        <li>• Don't close old credit accounts</li>
                        <li>• Monitor your credit report regularly</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">📈 Available Credit Products</h5>
                      <ul className="text-sm space-y-2">
                        <li className="flex justify-between">
                          <span>Business Credit Card</span>
                          <span className="text-blue-600 font-medium">Apply</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Line of Credit</span>
                          <span className="text-blue-600 font-medium">Apply</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Equipment Financing</span>
                          <span className="text-blue-600 font-medium">Apply</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loan Application Modal */}
        {showApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Apply for Microfinance Loan</h2>
              
              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Loan Amount *</label>
                    <input
                      type="number"
                      required
                      value={applicationData.amount}
                      onChange={(e) => setApplicationData({ ...applicationData, amount: Number(e.target.value) })}
                      className="w-full p-3 border rounded-md"
                      placeholder="500000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Purpose *</label>
                    <input
                      type="text"
                      required
                      value={applicationData.purpose}
                      onChange={(e) => setApplicationData({ ...applicationData, purpose: e.target.value })}
                      className="w-full p-3 border rounded-md"
                      placeholder="Business expansion, inventory, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Type *</label>
                    <select
                      required
                      value={applicationData.businessType}
                      onChange={(e) => setApplicationData({ ...applicationData, businessType: e.target.value })}
                      className="w-full p-3 border rounded-md"
                    >
                      <option value="">Select business type</option>
                      <option value="retail">Retail</option>
                      <option value="services">Services</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="technology">Technology</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Income *</label>
                    <input
                      type="number"
                      required
                      value={applicationData.monthlyIncome}
                      onChange={(e) => setApplicationData({ ...applicationData, monthlyIncome: Number(e.target.value) })}
                      className="w-full p-3 border rounded-md"
                      placeholder="150000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Expenses *</label>
                    <input
                      type="number"
                      required
                      value={applicationData.monthlyExpenses}
                      onChange={(e) => setApplicationData({ ...applicationData, monthlyExpenses: Number(e.target.value) })}
                      className="w-full p-3 border rounded-md"
                      placeholder="80000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Collateral Type</label>
                    <select
                      value={applicationData.collateralType}
                      onChange={(e) => setApplicationData({ ...applicationData, collateralType: e.target.value })}
                      className="w-full p-3 border rounded-md"
                    >
                      <option value="">No collateral</option>
                      <option value="property">Real Estate</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="equipment">Equipment</option>
                      <option value="inventory">Inventory</option>
                    </select>
                  </div>

                  {applicationData.collateralType && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Collateral Value</label>
                      <input
                        type="number"
                        value={applicationData.collateralValue}
                        onChange={(e) => setApplicationData({ ...applicationData, collateralValue: Number(e.target.value) })}
                        className="w-full p-3 border rounded-md"
                        placeholder="1000000"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Requested Term</label>
                    <select
                      value={applicationData.requestedTerm}
                      onChange={(e) => setApplicationData({ ...applicationData, requestedTerm: Number(e.target.value) })}
                      className="w-full p-3 border rounded-md"
                    >
                      <option value={6}>6 months</option>
                      <option value={12}>12 months</option>
                      <option value={18}>18 months</option>
                      <option value={24}>24 months</option>
                      <option value={36}>36 months</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowApplication(false)}
                    className="px-6 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}