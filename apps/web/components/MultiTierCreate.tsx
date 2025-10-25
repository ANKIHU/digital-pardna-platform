'use client';
import { useState } from 'react';
import { api } from '../../lib/api';

interface CircleTier {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  features: string[];
  fees: {
    setup: number;
    monthly: number;
  };
}

const CIRCLE_TIERS: CircleTier[] = [
  {
    id: 'basic',
    name: 'Basic Pardna',
    description: 'Traditional rotating savings circle',
    minAmount: 50000, // $500 JMD
    maxAmount: 500000, // $5,000 JMD
    features: [
      'Basic circle management',
      'Automated reminders', 
      'Digital receipts',
      'Member notifications'
    ],
    fees: { setup: 0, monthly: 0 }
  },
  {
    id: 'premium',
    name: 'Premium Pardna',
    description: 'Enhanced circle with financial tools',
    minAmount: 500000, // $5,000 JMD
    maxAmount: 2000000, // $20,000 JMD
    features: [
      'All Basic features',
      'Financial analytics',
      'Savings goals tracking',
      'Early payout options',
      'Insurance coverage',
      'Priority support'
    ],
    fees: { setup: 5000, monthly: 2000 }
  },
  {
    id: 'microfinance',
    name: 'Microfinance Circle',
    description: 'Business-focused with loan facilities',
    minAmount: 1000000, // $10,000 JMD
    maxAmount: 10000000, // $100,000 JMD
    features: [
      'All Premium features',
      'Business loan access',
      'Credit scoring',
      'Investment opportunities',
      'BOJ compliance',
      'Business mentorship',
      'Tax reporting tools'
    ],
    fees: { setup: 15000, monthly: 5000 }
  }
];

export default function MultiTierCreate() {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<CircleTier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    handAmountMinor: 0,
    currency: 'JMD',
    intervalSeconds: 604800, // 1 week
    startAtISO: '',
    members: [],
    businessPurpose: '',
    loanRequirement: false,
    kycLevel: 'basic'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount / 100);
  };

  const handleTierSelect = (tier: CircleTier) => {
    setSelectedTier(tier);
    setFormData({
      ...formData,
      handAmountMinor: tier.minAmount,
      kycLevel: tier.id === 'microfinance' ? 'enhanced' : 'basic'
    });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setLoading(true);
    try {
      const circleData = {
        ...formData,
        tier: selectedTier.id,
        startAtISO: formData.startAtISO || new Date(Date.now() + 120000).toISOString()
      };

      const response = await api.createCircle(circleData);
      setResult(response);
      setStep(4);
    } catch (error) {
      console.error('Failed to create circle:', error);
      setResult({ error: 'Failed to create circle' });
    } finally {
      setLoading(false);
    }
  };

  const addMember = () => {
    setFormData({
      ...formData,
      members: [
        ...formData.members,
        {
          userId: `00000000-0000-0000-0000-00000000000${formData.members.length + 1}`,
          payoutPosition: formData.members.length,
          name: '',
          email: ''
        }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i <= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {i}
                </div>
                {i < 4 && <div className={`w-16 h-1 ${
                  i < step ? 'bg-blue-600' : 'bg-gray-300'
                }`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Select Tier</span>
            <span>Circle Details</span>
            <span>Members</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Step 1: Tier Selection */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-8">Choose Your Circle Type</h1>
            <div className="grid md:grid-cols-3 gap-6">
              {CIRCLE_TIERS.map((tier) => (
                <div 
                  key={tier.id}
                  className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 hover:border-blue-500"
                  onClick={() => handleTierSelect(tier)}
                >
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-4">{tier.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium">Amount Range:</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(tier.minAmount)} - {formatCurrency(tier.maxAmount)}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Features:</p>
                    <ul className="text-sm space-y-1">
                      {tier.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                      {tier.features.length > 4 && (
                        <li className="text-gray-500">+{tier.features.length - 4} more</li>
                      )}
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm">
                      Setup: <span className="font-bold">{formatCurrency(tier.fees.setup)}</span>
                    </p>
                    <p className="text-sm">
                      Monthly: <span className="font-bold">{formatCurrency(tier.fees.monthly)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Circle Details */}
        {step === 2 && selectedTier && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Circle Details - {selectedTier.name}</h2>
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="bg-white rounded-lg shadow p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Circle Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border rounded-md"
                    placeholder="My Business Circle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hand Amount *</label>
                  <input
                    type="number"
                    required
                    min={selectedTier.minAmount}
                    max={selectedTier.maxAmount}
                    value={formData.handAmountMinor}
                    onChange={(e) => setFormData({ ...formData, handAmountMinor: Number(e.target.value) })}
                    className="w-full p-3 border rounded-md"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Range: {formatCurrency(selectedTier.minAmount)} - {formatCurrency(selectedTier.maxAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full p-3 border rounded-md"
                  >
                    <option value="JMD">Jamaican Dollar (JMD)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Interval</label>
                  <select
                    value={formData.intervalSeconds}
                    onChange={(e) => setFormData({ ...formData, intervalSeconds: Number(e.target.value) })}
                    className="w-full p-3 border rounded-md"
                  >
                    <option value={604800}>Weekly</option>
                    <option value={1209600}>Bi-weekly</option>
                    <option value={2629746}>Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.startAtISO.slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, startAtISO: new Date(e.target.value).toISOString() })}
                    className="w-full p-3 border rounded-md"
                  />
                </div>

                {selectedTier.id === 'microfinance' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Business Purpose</label>
                      <textarea
                        value={formData.businessPurpose}
                        onChange={(e) => setFormData({ ...formData, businessPurpose: e.target.value })}
                        className="w-full p-3 border rounded-md"
                        rows={3}
                        placeholder="Describe the business purpose of this circle..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.loanRequirement}
                          onChange={(e) => setFormData({ ...formData, loanRequirement: e.target.checked })}
                          className="mr-2"
                        />
                        This circle will require loan facilities
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next: Add Members
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Members */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Add Circle Members</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={addMember}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  + Add Member
                </button>
              </div>

              {formData.members.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No members added yet. Click "Add Member" to start.</p>
              ) : (
                <div className="space-y-4">
                  {formData.members.map((member: any, index) => (
                    <div key={index} className="grid md:grid-cols-3 gap-4 p-4 border rounded">
                      <input
                        type="text"
                        placeholder="Member Name"
                        value={member.name}
                        onChange={(e) => {
                          const newMembers = [...formData.members];
                          newMembers[index] = { ...member, name: e.target.value };
                          setFormData({ ...formData, members: newMembers });
                        }}
                        className="p-2 border rounded"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={member.email}
                        onChange={(e) => {
                          const newMembers = [...formData.members];
                          newMembers[index] = { ...member, email: e.target.value };
                          setFormData({ ...formData, members: newMembers });
                        }}
                        className="p-2 border rounded"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Position: {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newMembers = formData.members.filter((_, i) => i !== index);
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || formData.members.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Circle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && result && (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow p-8">
              {result.error ? (
                <>
                  <div className="text-red-600 text-6xl mb-4">❌</div>
                  <h2 className="text-2xl font-bold text-red-600 mb-4">Creation Failed</h2>
                  <p className="text-gray-600 mb-6">{result.error}</p>
                </>
              ) : (
                <>
                  <div className="text-green-600 text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Circle Created Successfully!</h2>
                  <p className="text-gray-600 mb-6">
                    Your {selectedTier?.name} circle "{formData.name}" has been created.
                  </p>
                </>
              )}
              
              <div className="bg-gray-50 rounded p-4 text-left">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedTier(null);
                    setFormData({
                      name: '',
                      handAmountMinor: 0,
                      currency: 'JMD',
                      intervalSeconds: 604800,
                      startAtISO: '',
                      members: [],
                      businessPurpose: '',
                      loanRequirement: false,
                      kycLevel: 'basic'
                    });
                    setResult(null);
                  }}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50"
                >
                  Create Another Circle
                </button>
                <a
                  href="/"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}