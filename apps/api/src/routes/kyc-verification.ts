import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../lib/db';

// Schema for KYC verification requests
const trnVerificationSchema = z.object({
  trn: z.string().regex(/^\d{9}$/, 'TRN must be 9 digits'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
});

const idVerificationSchema = z.object({
  documentType: z.enum(['drivers_license', 'passport', 'national_id']),
  documentNumber: z.string(),
  documentImage: z.string(), // Base64 encoded image
  selfieImage: z.string().optional() // Base64 encoded selfie
});

const creditCheckSchema = z.object({
  trn: z.string().regex(/^\d{9}$/),
  consentGiven: z.boolean(),
  checkType: z.enum(['basic', 'detailed'])
});

const kycVerificationRoutes: FastifyPluginAsync = async (app) => {

  // Tax Administration Jamaica (TAJ) TRN Verification
  app.register(async function(app) {
    const TAJ_API_BASE = process.env.TAJ_API_BASE || 'https://api.taj.gov.jm';
    const TAJ_CLIENT_ID = process.env.TAJ_CLIENT_ID;
    const TAJ_CLIENT_SECRET = process.env.TAJ_CLIENT_SECRET;

    // Generate TAJ access token
    async function getTajAccessToken() {
      try {
        const response = await fetch(`${TAJ_API_BASE}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${TAJ_CLIENT_ID}:${TAJ_CLIENT_SECRET}`).toString('base64')}`
          },
          body: 'grant_type=client_credentials&scope=trn_verification'
        });

        if (!response.ok) {
          throw new Error(`TAJ OAuth failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
      } catch (error) {
        app.log.error('TAJ OAuth failed:', error);
        throw error;
      }
    }

    // TRN Verification with TAJ
    app.post('/kyc/trn/verify', async (req, reply) => {
      try {
        const { trn, firstName, lastName, dateOfBirth } = trnVerificationSchema.parse(req.body);
        const accessToken = await getTajAccessToken();

        const verificationRequest = {
          trn,
          firstName: firstName.toUpperCase(),
          lastName: lastName.toUpperCase(),
          dateOfBirth,
          requestId: crypto.randomUUID()
        };

        const response = await fetch(`${TAJ_API_BASE}/v1/trn/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Request-ID': verificationRequest.requestId
          },
          body: JSON.stringify(verificationRequest)
        });

        if (!response.ok) {
          throw new Error(`TRN verification failed: ${response.statusText}`);
        }

        const verificationData = await response.json();

        // Store verification result
        const kycRecord = await prisma.kycVerification.create({
          data: {
            user_id: req.user?.id || 'system', // Assuming auth middleware sets req.user
            verification_type: 'trn',
            document_number: trn,
            status: verificationData.verified ? 'verified' : 'failed',
            verification_data: verificationData,
            verified_at: verificationData.verified ? new Date() : null,
            created_at: new Date()
          }
        });

        return {
          success: true,
          verified: verificationData.verified,
          trn,
          registeredName: verificationData.registeredName,
          status: verificationData.status,
          verificationId: kycRecord.id
        };

      } catch (error) {
        app.log.error('TRN verification failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'TRN verification failed'
        });
      }
    });

    // TRN Status Check
    app.get('/kyc/trn/:trn/status', async (req, reply) => {
      try {
        const { trn } = req.params as { trn: string };
        const accessToken = await getTajAccessToken();

        const response = await fetch(`${TAJ_API_BASE}/v1/trn/${trn}/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Request-ID': crypto.randomUUID()
          }
        });

        if (!response.ok) {
          throw new Error(`TRN status check failed: ${response.statusText}`);
        }

        const statusData = await response.json();

        return {
          success: true,
          trn,
          status: statusData.status,
          active: statusData.active,
          registrationDate: statusData.registrationDate,
          lastUpdated: statusData.lastUpdated
        };

      } catch (error) {
        app.log.error('TRN status check failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'TRN status check failed'
        });
      }
    });

  }, { prefix: '/taj' });

  // Document Verification with AI/OCR
  app.register(async function(app) {
    const VERIFF_API_BASE = process.env.VERIFF_API_BASE || 'https://stationapi.veriff.com';
    const VERIFF_API_KEY = process.env.VERIFF_API_KEY;
    const VERIFF_API_SECRET = process.env.VERIFF_API_SECRET;

    // Document Upload and Verification
    app.post('/kyc/document/verify', async (req, reply) => {
      try {
        const { documentType, documentNumber, documentImage, selfieImage } = 
          idVerificationSchema.parse(req.body);

        // Create verification session with Veriff
        const sessionRequest = {
          verification: {
            person: {
              firstName: req.user?.firstName,
              lastName: req.user?.lastName
            },
            document: {
              type: documentType,
              number: documentNumber,
              country: 'JM'
            },
            vendorData: crypto.randomUUID()
          }
        };

        const sessionResponse = await fetch(`${VERIFF_API_BASE}/v1/sessions`, {
          method: 'POST',
          headers: {
            'X-AUTH-CLIENT': VERIFF_API_KEY,
            'X-HMAC-SIGNATURE': generateVeriffSignature(JSON.stringify(sessionRequest)),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sessionRequest)
        });

        if (!sessionResponse.ok) {
          throw new Error(`Veriff session creation failed: ${sessionResponse.statusText}`);
        }

        const sessionData = await sessionResponse.json();

        // Upload document image
        const documentUpload = await fetch(`${VERIFF_API_BASE}/v1/sessions/${sessionData.verification.id}/media`, {
          method: 'POST',
          headers: {
            'X-AUTH-CLIENT': VERIFF_API_KEY,
            'Content-Type': 'multipart/form-data'
          },
          body: createFormData({
            type: 'document-front',
            image: documentImage
          })
        });

        // Upload selfie if provided
        if (selfieImage) {
          await fetch(`${VERIFF_API_BASE}/v1/sessions/${sessionData.verification.id}/media`, {
            method: 'POST',
            headers: {
              'X-AUTH-CLIENT': VERIFF_API_KEY,
              'Content-Type': 'multipart/form-data'
            },
            body: createFormData({
              type: 'face',
              image: selfieImage
            })
          });
        }

        // Store verification attempt
        const kycRecord = await prisma.kycVerification.create({
          data: {
            user_id: req.user?.id || 'system',
            verification_type: 'document',
            document_type: documentType,
            document_number: documentNumber,
            status: 'pending',
            external_session_id: sessionData.verification.id,
            created_at: new Date()
          }
        });

        return {
          success: true,
          verificationId: kycRecord.id,
          sessionId: sessionData.verification.id,
          status: 'pending',
          documentType,
          documentNumber
        };

      } catch (error) {
        app.log.error('Document verification failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Document verification failed'
        });
      }
    });

    // Check verification status
    app.get('/kyc/document/:verificationId/status', async (req, reply) => {
      try {
        const { verificationId } = req.params as { verificationId: string };

        const kycRecord = await prisma.kycVerification.findUnique({
          where: { id: verificationId }
        });

        if (!kycRecord || !kycRecord.external_session_id) {
          return reply.status(404).send({
            success: false,
            error: 'Verification not found'
          });
        }

        // Get status from Veriff
        const statusResponse = await fetch(`${VERIFF_API_BASE}/v1/sessions/${kycRecord.external_session_id}/decision`, {
          method: 'GET',
          headers: {
            'X-AUTH-CLIENT': VERIFF_API_KEY,
            'X-HMAC-SIGNATURE': generateVeriffSignature('')
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`Veriff status check failed: ${statusResponse.statusText}`);
        }

        const statusData = await statusResponse.json();

        // Update local record
        await prisma.kycVerification.update({
          where: { id: verificationId },
          data: {
            status: statusData.verification.status,
            verification_data: statusData,
            verified_at: statusData.verification.status === 'approved' ? new Date() : null,
            updated_at: new Date()
          }
        });

        return {
          success: true,
          verificationId,
          status: statusData.verification.status,
          decision: statusData.verification.decision,
          reason: statusData.verification.reason,
          confidence: statusData.verification.confidence
        };

      } catch (error) {
        app.log.error('Document status check failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Status check failed'
        });
      }
    });

    // Generate HMAC signature for Veriff API
    function generateVeriffSignature(payload: string): string {
      return crypto
        .createHmac('sha256', VERIFF_API_SECRET || '')
        .update(payload)
        .digest('hex');
    }

    // Create form data for file uploads
    function createFormData(data: { type: string; image: string }) {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('image', Buffer.from(data.image, 'base64'));
      return formData;
    }

  }, { prefix: '/veriff' });

  // Credit Bureau Integration (Creditinfo Jamaica)
  app.register(async function(app) {
    const CREDITINFO_API_BASE = process.env.CREDITINFO_API_BASE || 'https://api.creditinfo.com.jm';
    const CREDITINFO_CLIENT_ID = process.env.CREDITINFO_CLIENT_ID;
    const CREDITINFO_CLIENT_SECRET = process.env.CREDITINFO_CLIENT_SECRET;

    // Generate Creditinfo access token
    async function getCreditinfoAccessToken() {
      try {
        const response = await fetch(`${CREDITINFO_API_BASE}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${CREDITINFO_CLIENT_ID}:${CREDITINFO_CLIENT_SECRET}`).toString('base64')}`
          },
          body: 'grant_type=client_credentials&scope=credit_reports'
        });

        if (!response.ok) {
          throw new Error(`Creditinfo OAuth failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
      } catch (error) {
        app.log.error('Creditinfo OAuth failed:', error);
        throw error;
      }
    }

    // Credit Report Request
    app.post('/kyc/credit/check', async (req, reply) => {
      try {
        const { trn, consentGiven, checkType } = creditCheckSchema.parse(req.body);

        if (!consentGiven) {
          return reply.status(400).send({
            success: false,
            error: 'User consent required for credit check'
          });
        }

        const accessToken = await getCreditinfoAccessToken();

        const creditRequest = {
          trn,
          reportType: checkType,
          consentDate: new Date().toISOString(),
          requestedBy: req.user?.id || 'system',
          purpose: 'financial_services_onboarding'
        };

        const response = await fetch(`${CREDITINFO_API_BASE}/v1/credit-reports`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID()
          },
          body: JSON.stringify(creditRequest)
        });

        if (!response.ok) {
          throw new Error(`Credit check failed: ${response.statusText}`);
        }

        const creditData = await response.json();

        // Store credit check record (don't store full report for privacy)
        const creditRecord = await prisma.creditCheck.create({
          data: {
            user_id: req.user?.id || 'system',
            trn,
            check_type: checkType,
            credit_score: creditData.creditScore,
            risk_rating: creditData.riskRating,
            status: 'completed',
            consent_given: consentGiven,
            consent_date: new Date(),
            created_at: new Date()
          }
        });

        return {
          success: true,
          checkId: creditRecord.id,
          creditScore: creditData.creditScore,
          riskRating: creditData.riskRating,
          summary: {
            totalAccounts: creditData.summary.totalAccounts,
            activeAccounts: creditData.summary.activeAccounts,
            defaultAccounts: creditData.summary.defaultAccounts,
            totalDebt: creditData.summary.totalDebt
          },
          checkType,
          completedAt: new Date().toISOString()
        };

      } catch (error) {
        app.log.error('Credit check failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Credit check failed'
        });
      }
    });

    // Credit Score Only (Lighter Check)
    app.post('/kyc/credit/score', async (req, reply) => {
      try {
        const { trn } = req.body;
        const accessToken = await getCreditinfoAccessToken();

        const response = await fetch(`${CREDITINFO_API_BASE}/v1/credit-score/${trn}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Request-ID': crypto.randomUUID()
          }
        });

        if (!response.ok) {
          throw new Error(`Credit score check failed: ${response.statusText}`);
        }

        const scoreData = await response.json();

        return {
          success: true,
          trn,
          creditScore: scoreData.score,
          scoreRange: scoreData.range,
          lastUpdated: scoreData.lastUpdated
        };

      } catch (error) {
        app.log.error('Credit score check failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Credit score check failed'
        });
      }
    });

  }, { prefix: '/creditinfo' });

  // Combined KYC Status Endpoint
  app.get('/kyc/user/:userId/status', async (req, reply) => {
    try {
      const { userId } = req.params as { userId: string };

      const verifications = await prisma.kycVerification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      });

      const creditChecks = await prisma.creditCheck.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      });

      const kycStatus = {
        userId,
        overall: 'pending',
        verifications: {
          trn: verifications.find(v => v.verification_type === 'trn')?.status || 'not_started',
          document: verifications.find(v => v.verification_type === 'document')?.status || 'not_started',
          credit: creditChecks.length > 0 ? 'completed' : 'not_started'
        },
        lastUpdate: Math.max(
          ...verifications.map(v => v.updated_at?.getTime() || 0),
          ...creditChecks.map(c => c.created_at.getTime())
        )
      };

      // Determine overall status
      const allVerified = Object.values(kycStatus.verifications).every(status => 
        status === 'verified' || status === 'completed'
      );
      kycStatus.overall = allVerified ? 'verified' : 'pending';

      return {
        success: true,
        ...kycStatus
      };

    } catch (error) {
      app.log.error('KYC status check failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'KYC status check failed'
      });
    }
  });

};

export default kycVerificationRoutes;