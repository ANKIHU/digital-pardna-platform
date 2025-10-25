import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/db'

// BOJ Compliance Configuration
const BOJ_LIMITS = {
  SANDBOX_BASIC: {
    CLIENT_LIMIT: 100,
    DAILY_EXPOSURE: 1000000, // JMD 10,000 in cents
    MONTHLY_EXPOSURE: 5000000, // JMD 50,000 in cents
    TRANSACTION_LIMIT: 500000 // JMD 5,000 in cents
  },
  SANDBOX_STANDARD: {
    CLIENT_LIMIT: 500,
    DAILY_EXPOSURE: 5000000, // JMD 50,000 in cents
    MONTHLY_EXPOSURE: 20000000, // JMD 200,000 in cents
    TRANSACTION_LIMIT: 2000000 // JMD 20,000 in cents
  },
  SANDBOX_PREMIUM: {
    CLIENT_LIMIT: 1000,
    DAILY_EXPOSURE: 10000000, // JMD 100,000 in cents
    MONTHLY_EXPOSURE: 50000000, // JMD 500,000 in cents
    TRANSACTION_LIMIT: 5000000 // JMD 50,000 in cents
  }
}

const complianceSchema = z.object({
  userId: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().optional(),
  details: z.record(z.any()).optional()
})

const riskAssessmentSchema = z.object({
  userId: z.string(),
  assessmentType: z.enum(['onboarding', 'periodic', 'transaction']),
  factors: z.record(z.number()),
  mitigationMeasures: z.array(z.string())
})

const complaintSchema = z.object({
  userId: z.string(),
  category: z.enum(['service', 'technical', 'fraud', 'dispute', 'accessibility']),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
})

const bojComplianceRoutes: FastifyPluginAsync = async (app) => {
  
  // BOJ Section 7.1 - Client Limits Check
  app.get('/compliance/client-limits/:tier', async (req, reply) => {
    const { tier } = req.params as { tier: string }
    
    const limits = BOJ_LIMITS[tier.toUpperCase() as keyof typeof BOJ_LIMITS]
    if (!limits) {
      return reply.code(400).send({ error: 'Invalid sandbox tier' })
    }
    
    const activeClients = await prisma.user.count({
      where: {
        is_active: true,
        sandbox_tier: tier.toLowerCase()
      }
    })
    
    reply.send({
      tier,
      currentClients: activeClients,
      clientLimit: limits.CLIENT_LIMIT,
      availableSlots: limits.CLIENT_LIMIT - activeClients,
      withinLimits: activeClients < limits.CLIENT_LIMIT
    })
  })

  // BOJ Section 7.2 - Exposure Limits Monitoring
  app.get('/compliance/exposure-limits/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { transactionLimits: true }
    })
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' })
    }
    
    const dailyLimit = user.daily_transaction_limit || 0
    const monthlyLimit = user.monthly_transaction_limit || 0
    const exposureLimit = user.exposure_limit || 0
    
    // Calculate current usage (simplified - would be real transaction data)
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    
    reply.send({
      userId,
      exposureLimit: exposureLimit,
      dailyLimit: dailyLimit,
      monthlyLimit: monthlyLimit,
      withinLimits: true, // Would calculate based on actual transactions
      riskProfile: user.risk_profile,
      sandboxTier: user.sandbox_tier
    })
  })

  // BOJ Section 7.3 - Consumer Protection Setup
  app.post('/compliance/consumer-protection', async (req, reply) => {
    try {
      const data = z.object({
        userId: z.string(),
        disclosureVersion: z.string(),
        riskAcknowledged: z.boolean(),
        consumerSegment: z.enum(['retail', 'vulnerable', 'sophisticated']),
        accessibilityNeeds: z.record(z.any()).optional(),
        communicationMethod: z.enum(['email', 'sms', 'mail', 'phone']).default('email')
      }).parse(req.body)
      
      const protection = await prisma.consumerProtection.create({
        data: {
          user_id: data.userId,
          disclosure_version: data.disclosureVersion,
          risk_acknowledged: data.riskAcknowledged,
          consumer_segment: data.consumerSegment,
          accessibility_needs: data.accessibilityNeeds ? JSON.stringify(data.accessibilityNeeds) : null,
          communication_method: data.communicationMethod,
          risk_disclosure_shown: true,
          redress_mechanism_shown: true,
          exit_process_explained: true,
          data_protection_consent: true
        }
      })
      
      // Update user's consumer protection status
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          consumer_protection_accepted: true,
          risk_acknowledgment_date: new Date()
        }
      })
      
      reply.code(201).send({ success: true, protectionId: protection.id })
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors })
      } else {
        reply.code(500).send({ error: 'Internal server error' })
      }
    }
  })

  // BOJ Section 7.4 - Complaint Handling
  app.post('/compliance/complaints', async (req, reply) => {
    try {
      const data = complaintSchema.parse(req.body)
      
      // Generate BOJ-compliant reference number
      const reference = `BOJ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      const complaint = await prisma.complaint.create({
        data: {
          user_id: data.userId,
          complaint_reference: reference,
          category: data.category,
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: 'open',
          escalation_level: 1,
          accessibility_related: data.category === 'accessibility'
        }
      })
      
      // Log the complaint creation for audit
      await logAuditEvent({
        userId: data.userId,
        action: 'complaint_created',
        entityType: 'complaint',
        entityId: complaint.id,
        details: { reference, category: data.category, priority: data.priority }
      })
      
      reply.code(201).send({
        success: true,
        complaintId: complaint.id,
        reference: reference,
        expectedResolution: '5 business days'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors })
      } else {
        reply.code(500).send({ error: 'Internal server error' })
      }
    }
  })

  // BOJ Section 7.5 - Risk Assessment
  app.post('/compliance/risk-assessment', async (req, reply) => {
    try {
      const data = riskAssessmentSchema.parse(req.body)
      
      // Calculate risk score based on factors
      const riskScore = calculateRiskScore(data.factors)
      const riskLevel = getRiskLevel(riskScore)
      
      const assessment = await prisma.riskAssessment.create({
        data: {
          user_id: data.userId,
          assessment_type: data.assessmentType,
          risk_score: riskScore,
          risk_level: riskLevel,
          factors_assessed: JSON.stringify(data.factors),
          mitigation_measures: JSON.stringify(data.mitigationMeasures),
          next_review_date: getNextReviewDate(riskLevel)
        }
      })
      
      // Update user's risk profile
      await prisma.user.update({
        where: { id: data.userId },
        data: { risk_profile: riskLevel }
      })
      
      reply.code(201).send({
        success: true,
        assessmentId: assessment.id,
        riskScore,
        riskLevel,
        nextReview: assessment.next_review_date
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors })
      } else {
        reply.code(500).send({ error: 'Internal server error' })
      }
    }
  })

  // BOJ Section 7.5.c - AML/CTF Screening
  app.post('/compliance/aml-screening', async (req, reply) => {
    try {
      const { userId, screeningType } = req.body as { userId: string; screeningType: string }
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' })
      }
      
      // Simulate AML screening (in production, integrate with real AML service)
      const screeningResult = await performAMLScreening(user)
      
      const amlScreening = await prisma.aMLScreening.create({
        data: {
          user_id: userId,
          screening_type: screeningType,
          screening_provider: 'internal',
          pep_status: screeningResult.pepStatus,
          sanctions_hit: screeningResult.sanctionsHit,
          adverse_media: screeningResult.adverseMedia,
          risk_rating: screeningResult.riskRating,
          screening_result: JSON.stringify(screeningResult),
          manual_review_required: screeningResult.manualReviewRequired,
          next_screening_due: getNextScreeningDate(screeningResult.riskRating)
        }
      })
      
      // Update user's AML status
      await prisma.user.update({
        where: { id: userId },
        data: {
          aml_screening_status: screeningResult.riskRating,
          aml_screening_date: new Date()
        }
      })
      
      reply.send({
        success: true,
        screeningId: amlScreening.id,
        riskRating: screeningResult.riskRating,
        requiresManualReview: screeningResult.manualReviewRequired,
        nextScreening: amlScreening.next_screening_due
      })
    } catch (error) {
      reply.code(500).send({ error: 'AML screening failed' })
    }
  })

  // BOJ Section 7.6 - Monitoring Dashboard
  app.get('/compliance/monitoring-dashboard', async (req, reply) => {
    const [
      totalUsers,
      activeComplaints,
      highRiskUsers,
      pendingKYC,
      recentAuditLogs
    ] = await Promise.all([
      prisma.user.count({ where: { is_active: true } }),
      prisma.complaint.count({ where: { status: { in: ['open', 'investigating'] } } }),
      prisma.user.count({ where: { risk_profile: 'high' } }),
      prisma.user.count({ where: { kyc_status: 'pending' } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        where: { compliance_flag: true }
      })
    ])
    
    reply.send({
      overview: {
        totalUsers,
        activeComplaints,
        highRiskUsers,
        pendingKYC
      },
      recentComplianceEvents: recentAuditLogs,
      alertsCount: activeComplaints + highRiskUsers,
      systemStatus: 'operational'
    })
  })

  // Audit logging function
  async function logAuditEvent(event: {
    userId?: string
    action: string
    entityType: string
    entityId?: string
    details?: any
  }) {
    await prisma.auditLog.create({
      data: {
        user_id: event.userId,
        action: event.action,
        entity_type: event.entityType,
        entity_id: event.entityId,
        new_values: event.details ? JSON.stringify(event.details) : null,
        compliance_flag: true,
        risk_level: 'medium'
      }
    })
  }

  // Risk calculation helpers
  function calculateRiskScore(factors: Record<string, number>): number {
    const weights = {
      income_level: 0.2,
      transaction_frequency: 0.3,
      geographical_risk: 0.2,
      kyc_completeness: 0.3
    }
    
    let score = 0
    for (const [factor, value] of Object.entries(factors)) {
      const weight = weights[factor as keyof typeof weights] || 0.1
      score += value * weight
    }
    
    return Math.min(100, Math.max(1, Math.round(score)))
  }

  function getRiskLevel(score: number): string {
    if (score <= 30) return 'low'
    if (score <= 70) return 'medium'
    return 'high'
  }

  function getNextReviewDate(riskLevel: string): Date {
    const months = riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 6 : 12
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return date
  }

  function getNextScreeningDate(riskRating: string): Date {
    const months = riskRating === 'high' ? 6 : 12
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return date
  }

  // Simplified AML screening (in production, use real AML service)
  async function performAMLScreening(user: any) {
    return {
      pepStatus: false,
      sanctionsHit: false,
      adverseMedia: false,
      riskRating: 'low',
      manualReviewRequired: false,
      details: 'No adverse findings'
    }
  }
}

export default bojComplianceRoutes