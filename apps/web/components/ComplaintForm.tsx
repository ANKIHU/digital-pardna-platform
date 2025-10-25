'use client'
import { useState } from 'react'
import { 
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface ComplaintFormProps {
  onSubmit: (complaint: any) => void
  onClose: () => void
}

export default function ComplaintForm({ onSubmit, onClose }: ComplaintFormProps) {
  const [formData, setFormData] = useState({
    category: '',
    priority: 'medium',
    title: '',
    description: '',
    contactMethod: 'email',
    accessibilityAssistance: false,
    financialImpact: '',
    urgentComplaint: false
  })

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const categories = [
    { id: 'service', name: 'Service Quality', description: 'Issues with platform service or support' },
    { id: 'technical', name: 'Technical Problems', description: 'App crashes, login issues, or system errors' },
    { id: 'fraud', name: 'Fraud or Security', description: 'Suspected fraudulent activity or security concerns' },
    { id: 'dispute', name: 'Transaction Dispute', description: 'Issues with payments or circle transactions' },
    { id: 'accessibility', name: 'Accessibility', description: 'Difficulty accessing due to disabilities' }
  ]

  const priorities = [
    { id: 'low', name: 'Low', description: 'General inquiry or minor issue', timeframe: '5 business days' },
    { id: 'medium', name: 'Medium', description: 'Service disruption affecting usage', timeframe: '3 business days' },
    { id: 'high', name: 'High', description: 'Significant financial impact or urgent matter', timeframe: '1 business day' },
    { id: 'critical', name: 'Critical', description: 'Security issue or major financial loss', timeframe: '4 hours' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Submit complaint to BOJ compliance endpoint
      const response = await fetch('/api/v1/boj/compliance/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'current-user-id', // Would come from auth context
          category: formData.category,
          title: formData.title,
          description: formData.description,
          priority: formData.priority
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        onSubmit({
          ...formData,
          reference: result.reference,
          expectedResolution: result.expectedResolution
        })
      } else {
        alert('Failed to submit complaint. Please try again.')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Submit a Complaint</h2>
          <p className="text-gray-600 mt-2">
            BOJ-Compliant Complaint Resolution Process
          </p>
        </div>

        {/* BOJ Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Your Consumer Rights</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Complaints are handled according to Bank of Jamaica guidelines</li>
            <li>• You will receive a unique reference number for tracking</li>
            <li>• Resolution timeframes are based on complaint priority</li>
            <li>• You may escalate to BOJ if not resolved satisfactorily</li>
            <li>• Accessibility assistance is available upon request</li>
          </ul>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Complaint Category *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((category) => (
                <label key={category.id} className="relative">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={formData.category === category.id}
                    onChange={handleInputChange}
                    className="sr-only"
                    required
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.category === category.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority Level *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {priorities.map((priority) => (
                <label key={priority.id} className="relative">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.id}
                    checked={formData.priority === priority.id}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                    formData.priority === priority.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-gray-900">{priority.name}</div>
                    <div className="text-xs text-gray-600">{priority.description}</div>
                    <div className="text-xs text-blue-600 mt-1 flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {priority.timeframe}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility Assistance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="accessibilityAssistance"
                checked={formData.accessibilityAssistance}
                onChange={handleInputChange}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">
                  I need accessibility assistance
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  Check this if you need special accommodations due to a disability. 
                  We provide TTY services, large print documents, and other accessibility options.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.category}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <DocumentTextIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Complaint Details</h2>
        <p className="text-gray-600 mt-2">
          Provide detailed information about your complaint
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complaint Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief summary of your complaint"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please provide detailed information including dates, times, amounts involved, and steps you've already taken..."
            required
          />
        </div>

        {/* Financial Impact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Financial Impact (if any)
          </label>
          <input
            type="text"
            name="financialImpact"
            value={formData.financialImpact}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., JMD 5,000 missing from account"
          />
        </div>

        {/* Contact Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Contact Method *
          </label>
          <select
            name="contactMethod"
            value={formData.contactMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="email">Email</option>
            <option value="phone">Phone Call</option>
            <option value="sms">SMS</option>
            <option value="mail">Postal Mail</option>
          </select>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900">Important Notice</h4>
              <p className="text-sm text-amber-800 mt-1">
                Your complaint will be assigned a unique BOJ-compliant reference number. 
                If you're not satisfied with our resolution, you may escalate to the 
                Bank of Jamaica or Financial Services Commission.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.description}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>

      {/* Contact Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Alternative Contact Methods</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <PhoneIcon className="w-4 h-4 mr-2" />
            <div>
              <div>Phone: 1-876-XXX-XXXX</div>
              <div>TTY: 1-876-XXX-XXXX</div>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            <div>complaints@pardnalink.com</div>
          </div>
          <div className="flex items-center text-gray-600">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            <div>
              <div>BOJ Escalation:</div>
              <div>complaints@boj.org.jm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}