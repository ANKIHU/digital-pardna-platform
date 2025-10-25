'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface RiskDisclosureProps {
  onAccept: (acknowledged: boolean) => void
  userSegment: 'retail' | 'vulnerable' | 'sophisticated'
}

export default function RiskDisclosure({ onAccept, userSegment }: RiskDisclosureProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [acknowledgedSections, setAcknowledgedSections] = useState<boolean[]>([])
  const [finalAcknowledgment, setFinalAcknowledgment] = useState(false)

  const riskSections = [
    {
      title: "Digital Pardna Platform - Sandbox Environment",
      icon: <InformationCircleIcon className="w-8 h-8 text-blue-600" />,
      content: `
        You are participating in the Bank of Jamaica (BOJ) approved Digital Pardna Platform Sandbox environment. 
        This platform is authorized under BOJ's Financial Innovation Sandbox framework to test innovative 
        financial services in a controlled environment.
        
        **Key Information:**
        • This is a testing environment with regulatory oversight
        • Your participation is limited and monitored
        • Enhanced consumer protections are in place
        • All activities are subject to BOJ regulations
      `,
      risks: [
        "Platform is in testing phase and may have technical limitations",
        "Services may be discontinued or modified during the sandbox period",
        "Transaction limits and client participation are restricted"
      ]
    },
    {
      title: "Financial Risks & Limitations",
      icon: <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />,
      content: `
        **Transaction & Exposure Limits (BOJ Section 7.1 & 7.2):**
        ${userSegment === 'retail' ? '• Daily limit: JMD 10,000' : 
          userSegment === 'vulnerable' ? '• Daily limit: JMD 5,000' : '• Daily limit: JMD 50,000'}
        • Monthly limit: JMD 50,000 (retail) / JMD 200,000 (sophisticated)
        • Single transaction limit: JMD 5,000 (retail) / JMD 20,000 (sophisticated)
        • Total exposure limit applies to all your activities on the platform
        
        **Pardna Circle Risks:**
        • Risk of member default or non-payment
        • No FDIC or deposit insurance coverage
        • Platform operational risks and potential downtime
      `,
      risks: [
        "You may lose money if other circle members default",
        "Platform technical issues could delay payments",
        "No government deposit insurance protection",
        "Regulatory changes may affect service availability"
      ]
    },
    {
      title: "Data Protection & Privacy",
      icon: <ShieldCheckIcon className="w-8 h-8 text-green-600" />,
      content: `
        **Data Collection & Use (BOJ Section 7.3.vii):**
        • We collect personal and financial information for KYC/AML compliance
        • Data is shared with BOJ for regulatory monitoring
        • AML/CTF screening is performed on all participants
        • Transaction monitoring for suspicious activity
        
        **Your Rights:**
        • Access to your personal data
        • Request data corrections
        • Data portability upon platform exit
        • Complaint resolution through our redress mechanism
      `,
      risks: [
        "Regulatory reporting may limit data privacy",
        "AML screening may flag legitimate transactions",
        "Data breaches could expose personal information"
      ]
    },
    {
      title: "Consumer Protections & Redress",
      icon: <DocumentTextIcon className="w-8 h-8 text-purple-600" />,
      content: `
        **Your Consumer Protections (BOJ Section 7.3 & 7.4):**
        • Dedicated complaint handling mechanism
        • Maximum 5 business day complaint resolution
        • Clear exit procedures with data portability
        • Accessible support for persons with disabilities
        
        **Redress Mechanisms:**
        • In-platform dispute resolution
        • Escalation to BOJ if unresolved
        • Financial redress for platform errors
        • Access to Financial Services Commission if needed
      `,
      risks: [
        "Dispute resolution may take time",
        "Not all losses may be recoverable",
        "Platform exit procedures must be followed"
      ]
    }
  ]

  const handleSectionAcknowledge = (sectionIndex: number) => {
    const newAcknowledged = [...acknowledgedSections]
    newAcknowledged[sectionIndex] = true
    setAcknowledgedSections(newAcknowledged)
    
    if (sectionIndex < riskSections.length - 1) {
      setCurrentSection(sectionIndex + 1)
    }
  }

  const allSectionsAcknowledged = acknowledgedSections.length === riskSections.length && 
    acknowledgedSections.every(ack => ack)

  const handleFinalAccept = () => {
    if (finalAcknowledgment && allSectionsAcknowledged) {
      onAccept(true)
    }
  }

  const currentSectionData = riskSections[currentSection]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Digital Pardna Platform Risk Disclosure
          </h1>
          <p className="text-lg text-gray-600">
            Bank of Jamaica Sandbox - Consumer Protection Requirements
          </p>
          <div className="mt-4 flex justify-center">
            <div className="bg-amber-100 border border-amber-400 rounded-lg px-4 py-2">
              <p className="text-amber-800 text-sm font-medium">
                Customer Segment: {userSegment.charAt(0).toUpperCase() + userSegment.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {riskSections.map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  index === currentSection ? 'border-blue-600 bg-blue-600 text-white' :
                  acknowledgedSections[index] ? 'border-green-600 bg-green-600 text-white' :
                  'border-gray-300 bg-white text-gray-400'
                }`}>
                  {acknowledgedSections[index] ? '✓' : index + 1}
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center max-w-20">
                  Section {index + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / riskSections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Section */}
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="flex items-center mb-6">
            {currentSectionData.icon}
            <h2 className="text-2xl font-bold text-gray-900 ml-4">
              {currentSectionData.title}
            </h2>
          </div>

          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-line text-gray-700">
              {currentSectionData.content}
            </div>
          </div>

          {/* Risk List */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Key Risks to Understand:
            </h3>
            <ul className="space-y-2">
              {currentSectionData.risks.map((risk, index) => (
                <li key={index} className="text-red-700 flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          {/* Acknowledgment */}
          <div className="border-t pt-6">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={acknowledgedSections[currentSection] || false}
                onChange={() => handleSectionAcknowledge(currentSection)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">
                I have read, understood, and acknowledge the risks and information 
                in this section. I understand that this is a regulatory sandbox 
                environment with specific limitations and protections.
              </span>
            </label>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-4 py-2 text-gray-600 disabled:text-gray-400 hover:text-gray-800"
            >
              ← Previous
            </button>
            
            {currentSection < riskSections.length - 1 ? (
              <button
                onClick={() => setCurrentSection(currentSection + 1)}
                disabled={!acknowledgedSections[currentSection]}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Next Section →
              </button>
            ) : null}
          </div>
        </motion.div>

        {/* Final Acknowledgment */}
        {allSectionsAcknowledged && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Final Acknowledgment</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <strong>By proceeding, you confirm that:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-blue-700">
                <li>• You have read and understood all risk disclosures</li>
                <li>• You accept the transaction and exposure limits</li>
                <li>• You understand this is a BOJ-regulated sandbox environment</li>
                <li>• You acknowledge the complaint and redress mechanisms</li>
                <li>• You consent to data collection for regulatory compliance</li>
              </ul>
            </div>

            <label className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                checked={finalAcknowledgment}
                onChange={(e) => setFinalAcknowledgment(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">
                I provide my informed consent to participate in the Digital Pardna Platform 
                sandbox environment under the terms and conditions disclosed above.
              </span>
            </label>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => onAccept(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Decline & Exit
              </button>
              <button
                onClick={handleFinalAccept}
                disabled={!finalAcknowledgment}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Accept & Continue to Platform
              </button>
            </div>
          </motion.div>
        )}

        {/* Support Information */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
          <h4 className="font-semibold text-gray-900 mb-2">Need Help or Have Questions?</h4>
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <PhoneIcon className="w-4 h-4 mr-1" />
              Support: 1-876-XXX-XXXX
            </div>
            <div className="flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-1" />
              Email: compliance@pardnalink.com
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Accessible formats available upon request • TTY: 1-876-XXX-XXXX
          </p>
        </div>
      </div>
    </div>
  )
}