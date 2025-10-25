'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import RiskDisclosure from '@/components/RiskDisclosure'

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1) // 1: Basic Info, 2: BOJ Compliance, 3: Security Setup, 4: Verification
  const [loading, setLoading] = useState(false)
  const [complianceCompleted, setComplianceCompleted] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    country: 'Jamaica',
    currency: 'JMD'
  })

  const [verificationData, setVerificationData] = useState({
    emailCode: '',
    smsCode: '',
    twoFactorMethod: 'sms' // 'sms', 'email', 'authenticator'
  })

  const countries = [
    { code: 'JM', name: 'Jamaica', currency: 'JMD' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'TT', name: 'Trinidad & Tobago', currency: 'TTD' },
    { code: 'BB', name: 'Barbados', currency: 'BBD' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      setLoading(false)
      return
    }

    // Move to BOJ compliance step
    setTimeout(() => {
      setStep(2)
      setLoading(false)
    }, 1000)
  }

  const handleComplianceComplete = () => {
    setComplianceCompleted(true)
    setStep(3) // Move to security setup
  }

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Send verification codes
    setTimeout(() => {
      setStep(4)
      setLoading(false)
    }, 1000)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Complete registration
    setTimeout(() => {
      router.push('/dashboard')
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            PardnaLink
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-gray-600">Join the digital pardna revolution</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-8 h-1 mx-1 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 text-xs text-gray-500 mt-2 text-center">
            <span>Basic Info</span>
            <span>BOJ Compliance</span>
            <span>Security</span>
            <span>Verification</span>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1876-555-0123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.name}>
                      {country.name} ({country.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.acceptTerms}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Creating Account...' : 'Continue to Security Setup'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <ShieldCheckIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-gray-900">BOJ Regulatory Compliance</h2>
                <p className="text-gray-600">Required disclosure for financial sandbox operation</p>
              </div>

              <RiskDisclosure 
                onComplete={handleComplianceComplete}
                customerSegment="consumer"
              />
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6">
              <div className="text-center mb-6">
                <ShieldCheckIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-gray-900">Security Setup</h2>
                <p className="text-gray-600">Choose your two-factor authentication method</p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="radio"
                    id="sms"
                    name="twoFactorMethod"
                    value="sms"
                    checked={verificationData.twoFactorMethod === 'sms'}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, twoFactorMethod: e.target.value }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="sms" className="ml-3 text-sm font-medium text-gray-700">
                    SMS Text Messages ({formData.phone})
                  </label>
                </div>
                
                <div>
                  <input
                    type="radio"
                    id="email"
                    name="twoFactorMethod"
                    value="email"
                    checked={verificationData.twoFactorMethod === 'email'}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, twoFactorMethod: e.target.value }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="email" className="ml-3 text-sm font-medium text-gray-700">
                    Email ({formData.email})
                  </label>
                </div>
                
                <div>
                  <input
                    type="radio"
                    id="authenticator"
                    name="twoFactorMethod"
                    value="authenticator"
                    checked={verificationData.twoFactorMethod === 'authenticator'}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, twoFactorMethod: e.target.value }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="authenticator" className="ml-3 text-sm font-medium text-gray-700">
                    Authenticator App (Google Authenticator, Authy)
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-1">Why 2FA?</h3>
                <p className="text-sm text-blue-700">
                  Two-factor authentication adds an extra layer of security to protect your account and funds.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Setting up Security...' : 'Continue to Verification'}
              </button>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Verify Your Account</h2>
                <p className="text-gray-600">
                  We've sent verification codes to your {verificationData.twoFactorMethod === 'sms' ? 'phone' : 'email'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Verification Code
                </label>
                <input
                  type="text"
                  value={verificationData.emailCode}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, emailCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              {verificationData.twoFactorMethod === 'sms' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationData.smsCode}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, smsCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex-1 text-blue-600 border border-blue-600 hover:bg-blue-50 py-2 rounded-lg font-semibold transition-colors"
                >
                  Resend Codes
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Verifying...' : 'Complete Setup'}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}