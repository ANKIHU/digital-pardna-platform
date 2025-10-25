import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../lib/db';

// Schema for compliance reporting
const amlReportSchema = z.object({
  transactionId: z.string(),
  transactionType: z.enum(['deposit', 'withdrawal', 'transfer']),
  amount: z.number().positive(),
  currency: z.enum(['JMD', 'USD']),
  suspiciousActivity: z.boolean(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  description: z.string().optional()
});

const bojReportSchema = z.object({
  reportType: z.enum(['monthly_transactions', 'suspicious_activity', 'large_transactions', 'customer_data']),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  includeCustomerData: z.boolean().default(false)
});

const nhtEmployerSchema = z.object({
  employerName: z.string(),
  employerTrn: z.string().regex(/^\d{9}$/),
  employeeCount: z.number().positive(),
  contactEmail: z.string().email(),
  contactPhone: z.string()
});

const regulatoryComplianceRoutes: FastifyPluginAsync = async (app) => {

  // Bank of Jamaica (BOJ) Compliance Reporting
  app.register(async function(app) {
    const BOJ_API_BASE = process.env.BOJ_API_BASE || 'https://api.boj.org.jm';
    const BOJ_INSTITUTION_ID = process.env.BOJ_INSTITUTION_ID;
    const BOJ_API_KEY = process.env.BOJ_API_KEY;

    // AML (Anti-Money Laundering) Transaction Monitoring
    app.post('/compliance/aml/monitor', async (req, reply) => {
      try {
        const { transactionId, transactionType, amount, currency, suspiciousActivity, riskLevel, description } = 
          amlReportSchema.parse(req.body);

        // Check transaction against AML rules
        const amlFlags = await checkAmlRules({
          transactionId,
          transactionType,
          amount,
          currency,
          userId: req.user?.id
        });

        // Store AML monitoring record
        const amlRecord = await prisma.amlMonitoring.create({
          data: {
            transaction_id: transactionId,
            transaction_type: transactionType,
            amount: BigInt(amount * 100),
            currency,
            risk_level: riskLevel,
            suspicious_activity: suspiciousActivity || amlFlags.suspicious,
            flags: amlFlags.flags,
            description,
            monitored_at: new Date(),
            created_at: new Date()
          }
        });

        // Auto-report if high risk or suspicious
        if (amlFlags.suspicious || riskLevel === 'high') {
          await submitSuspiciousActivityReport({
            transactionId,
            amount,
            currency,
            flags: amlFlags.flags,
            description
          });
        }

        return {
          success: true,
          monitoringId: amlRecord.id,
          riskLevel: amlFlags.riskLevel,
          suspicious: amlFlags.suspicious,
          flags: amlFlags.flags,
          autoReported: amlFlags.suspicious || riskLevel === 'high'
        };

      } catch (error) {
        app.log.error('AML monitoring failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'AML monitoring failed'
        });
      }
    });

    // BOJ Transaction Reporting
    app.post('/compliance/boj/report', async (req, reply) => {
      try {
        const { reportType, periodStart, periodEnd, includeCustomerData } = 
          bojReportSchema.parse(req.body);

        const reportData = await generateBojReport({
          reportType,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          includeCustomerData
        });

        // Submit to BOJ API
        const response = await fetch(`${BOJ_API_BASE}/v1/reports`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BOJ_API_KEY}`,
            'X-Institution-ID': BOJ_INSTITUTION_ID || '',
            'Content-Type': 'application/json',
            'X-Report-ID': crypto.randomUUID()
          },
          body: JSON.stringify({
            institutionId: BOJ_INSTITUTION_ID,
            reportType,
            reportDate: new Date().toISOString(),
            periodStart,
            periodEnd,
            data: reportData,
            submittedBy: req.user?.id || 'system'
          })
        });

        if (!response.ok) {
          throw new Error(`BOJ report submission failed: ${response.statusText}`);
        }

        const submissionData = await response.json();

        // Store report submission record
        const reportRecord = await prisma.complianceReport.create({
          data: {
            report_type: `boj_${reportType}`,
            period_start: new Date(periodStart),
            period_end: new Date(periodEnd),
            status: 'submitted',
            external_reference: submissionData.reportId,
            submitted_by: req.user?.id || 'system',
            submitted_at: new Date(),
            created_at: new Date()
          }
        });

        return {
          success: true,
          reportId: reportRecord.id,
          bojReference: submissionData.reportId,
          reportType,
          periodStart,
          periodEnd,
          submittedAt: new Date().toISOString()
        };

      } catch (error) {
        app.log.error('BOJ report submission failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'BOJ report submission failed'
        });
      }
    });

    // Large Transaction Reporting (CTR - Currency Transaction Report)
    app.post('/compliance/boj/ctr', async (req, reply) => {
      try {
        const { transactionId, amount, currency, customerTrn, transactionType } = req.body;

        // BOJ requires reporting for transactions over JMD 1,000,000 or USD 10,000
        const reportingThreshold = currency === 'JMD' ? 1000000 : 10000;
        
        if (amount < reportingThreshold) {
          return {
            success: true,
            message: 'Transaction below reporting threshold',
            reported: false
          };
        }

        const ctrData = {
          institutionId: BOJ_INSTITUTION_ID,
          transactionId,
          transactionType,
          amount: amount * 100, // Convert to cents
          currency,
          customerTrn,
          transactionDate: new Date().toISOString(),
          reportingReason: 'large_transaction',
          filingDate: new Date().toISOString()
        };

        const response = await fetch(`${BOJ_API_BASE}/v1/ctr`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BOJ_API_KEY}`,
            'X-Institution-ID': BOJ_INSTITUTION_ID || '',
            'Content-Type': 'application/json',
            'X-CTR-ID': crypto.randomUUID()
          },
          body: JSON.stringify(ctrData)
        });

        if (!response.ok) {
          throw new Error(`CTR submission failed: ${response.statusText}`);
        }

        const ctrResponse = await response.json();

        return {
          success: true,
          ctrId: ctrResponse.ctrId,
          reported: true,
          amount,
          currency,
          reportingThreshold,
          submittedAt: new Date().toISOString()
        };

      } catch (error) {
        app.log.error('CTR submission failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'CTR submission failed'
        });
      }
    });

    // AML Rule Engine
    async function checkAmlRules(transaction: {
      transactionId: string;
      transactionType: string;
      amount: number;
      currency: string;
      userId?: string;
    }) {
      const flags: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let suspicious = false;

      // Large transaction check
      const largeThreshold = transaction.currency === 'JMD' ? 500000 : 5000;
      if (transaction.amount > largeThreshold) {
        flags.push('large_transaction');
        riskLevel = 'medium';
      }

      // Rapid transaction pattern check
      if (transaction.userId) {
        const recentTransactions = await prisma.transaction.count({
          where: {
            user_id: transaction.userId,
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        });

        if (recentTransactions > 10) {
          flags.push('rapid_transactions');
          riskLevel = 'high';
          suspicious = true;
        }
      }

      // Round number pattern check (common in money laundering)
      if (transaction.amount % 1000 === 0) {
        flags.push('round_number');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

      return { flags, riskLevel, suspicious };
    }

    // Submit Suspicious Activity Report (SAR)
    async function submitSuspiciousActivityReport(data: {
      transactionId: string;
      amount: number;
      currency: string;
      flags: string[];
      description?: string;
    }) {
      try {
        const sarData = {
          institutionId: BOJ_INSTITUTION_ID,
          transactionId: data.transactionId,
          amount: data.amount * 100,
          currency: data.currency,
          suspiciousFlags: data.flags,
          description: data.description,
          reportDate: new Date().toISOString(),
          reportType: 'suspicious_activity'
        };

        await fetch(`${BOJ_API_BASE}/v1/sar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BOJ_API_KEY}`,
            'X-Institution-ID': BOJ_INSTITUTION_ID || '',
            'Content-Type': 'application/json',
            'X-SAR-ID': crypto.randomUUID()
          },
          body: JSON.stringify(sarData)
        });

        return true;
      } catch (error) {
        app.log.error('SAR submission failed:', error);
        return false;
      }
    }

    // Generate BOJ Report Data
    async function generateBojReport(params: {
      reportType: string;
      periodStart: Date;
      periodEnd: Date;
      includeCustomerData: boolean;
    }) {
      const { reportType, periodStart, periodEnd, includeCustomerData } = params;

      switch (reportType) {
        case 'monthly_transactions':
          return await generateMonthlyTransactionReport(periodStart, periodEnd);
        case 'suspicious_activity':
          return await generateSuspiciousActivityReport(periodStart, periodEnd);
        case 'large_transactions':
          return await generateLargeTransactionReport(periodStart, periodEnd);
        case 'customer_data':
          return await generateCustomerDataReport(periodStart, periodEnd, includeCustomerData);
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    }

    async function generateMonthlyTransactionReport(start: Date, end: Date) {
      const transactions = await prisma.transaction.groupBy({
        by: ['transaction_type', 'currency'],
        where: {
          created_at: { gte: start, lte: end }
        },
        _sum: { amount: true },
        _count: { id: true }
      });

      return {
        period: { start, end },
        summary: transactions.map(t => ({
          type: t.transaction_type,
          currency: t.currency,
          totalAmount: Number(t._sum.amount) / 100,
          transactionCount: t._count.id
        }))
      };
    }

    async function generateSuspiciousActivityReport(start: Date, end: Date) {
      const suspiciousActivities = await prisma.amlMonitoring.findMany({
        where: {
          monitored_at: { gte: start, lte: end },
          suspicious_activity: true
        }
      });

      return {
        period: { start, end },
        suspiciousActivities: suspiciousActivities.map(sa => ({
          transactionId: sa.transaction_id,
          amount: Number(sa.amount) / 100,
          currency: sa.currency,
          riskLevel: sa.risk_level,
          flags: sa.flags,
          monitoredAt: sa.monitored_at
        }))
      };
    }

    async function generateLargeTransactionReport(start: Date, end: Date) {
      const largeTransactions = await prisma.transaction.findMany({
        where: {
          created_at: { gte: start, lte: end },
          OR: [
            { amount: { gte: BigInt(100000000) }, currency: 'JMD' }, // 1M JMD
            { amount: { gte: BigInt(1000000) }, currency: 'USD' }    // 10K USD
          ]
        }
      });

      return {
        period: { start, end },
        largeTransactions: largeTransactions.map(lt => ({
          transactionId: lt.id,
          amount: Number(lt.amount) / 100,
          currency: lt.currency,
          type: lt.transaction_type,
          createdAt: lt.created_at
        }))
      };
    }

    async function generateCustomerDataReport(start: Date, end: Date, includePersonalData: boolean) {
      const customers = await prisma.user.findMany({
        where: {
          created_at: { gte: start, lte: end }
        },
        include: {
          kycVerifications: true
        }
      });

      return {
        period: { start, end },
        customerCount: customers.length,
        customers: customers.map(customer => ({
          userId: customer.id,
          ...(includePersonalData && {
            firstName: customer.first_name,
            lastName: customer.last_name,
            email: customer.email
          }),
          kycStatus: customer.kycVerifications.length > 0 ? 'verified' : 'pending',
          registrationDate: customer.created_at
        }))
      };
    }

  }, { prefix: '/boj' });

  // National Housing Trust (NHT) Compliance
  app.register(async function(app) {
    const NHT_API_BASE = process.env.NHT_API_BASE || 'https://api.nht.gov.jm';
    const NHT_EMPLOYER_ID = process.env.NHT_EMPLOYER_ID;
    const NHT_API_KEY = process.env.NHT_API_KEY;

    // Register as NHT Employer
    app.post('/compliance/nht/register-employer', async (req, reply) => {
      try {
        const { employerName, employerTrn, employeeCount, contactEmail, contactPhone } = 
          nhtEmployerSchema.parse(req.body);

        const registrationData = {
          employerName,
          employerTrn,
          businessType: 'financial_services',
          employeeCount,
          contactInformation: {
            email: contactEmail,
            phone: contactPhone,
            address: process.env.COMPANY_ADDRESS
          },
          registrationDate: new Date().toISOString()
        };

        const response = await fetch(`${NHT_API_BASE}/v1/employers/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NHT_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Registration-ID': crypto.randomUUID()
          },
          body: JSON.stringify(registrationData)
        });

        if (!response.ok) {
          throw new Error(`NHT employer registration failed: ${response.statusText}`);
        }

        const registrationResponse = await response.json();

        return {
          success: true,
          employerId: registrationResponse.employerId,
          registrationNumber: registrationResponse.registrationNumber,
          status: registrationResponse.status,
          employerName,
          employerTrn
        };

      } catch (error) {
        app.log.error('NHT employer registration failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'NHT employer registration failed'
        });
      }
    });

    // Submit NHT Employee Contributions
    app.post('/compliance/nht/contributions', async (req, reply) => {
      try {
        const { payrollPeriod, employees } = req.body as {
          payrollPeriod: string;
          employees: Array<{
            employeeTrn: string;
            employeeName: string;
            grossSalary: number;
            nhtContribution: number;
          }>;
        };

        const contributionsData = {
          employerId: NHT_EMPLOYER_ID,
          payrollPeriod,
          submissionDate: new Date().toISOString(),
          totalEmployees: employees.length,
          totalContributions: employees.reduce((sum, emp) => sum + emp.nhtContribution, 0),
          employees: employees.map(emp => ({
            trn: emp.employeeTrn,
            name: emp.employeeName,
            grossSalary: emp.grossSalary * 100, // Convert to cents
            nhtContribution: emp.nhtContribution * 100,
            contributionRate: (emp.nhtContribution / emp.grossSalary) * 100
          }))
        };

        const response = await fetch(`${NHT_API_BASE}/v1/contributions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NHT_API_KEY}`,
            'X-Employer-ID': NHT_EMPLOYER_ID || '',
            'Content-Type': 'application/json',
            'X-Submission-ID': crypto.randomUUID()
          },
          body: JSON.stringify(contributionsData)
        });

        if (!response.ok) {
          throw new Error(`NHT contributions submission failed: ${response.statusText}`);
        }

        const submissionResponse = await response.json();

        // Store submission record
        const submissionRecord = await prisma.complianceReport.create({
          data: {
            report_type: 'nht_contributions',
            period_start: new Date(payrollPeriod + '-01'),
            period_end: new Date(payrollPeriod + '-31'),
            status: 'submitted',
            external_reference: submissionResponse.submissionId,
            submitted_by: req.user?.id || 'system',
            submitted_at: new Date(),
            created_at: new Date()
          }
        });

        return {
          success: true,
          submissionId: submissionRecord.id,
          nhtReference: submissionResponse.submissionId,
          payrollPeriod,
          totalEmployees: employees.length,
          totalContributions: contributionsData.totalContributions,
          submittedAt: new Date().toISOString()
        };

      } catch (error) {
        app.log.error('NHT contributions submission failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'NHT contributions submission failed'
        });
      }
    });

    // Check NHT Compliance Status
    app.get('/compliance/nht/status', async (req, reply) => {
      try {
        const response = await fetch(`${NHT_API_BASE}/v1/employers/${NHT_EMPLOYER_ID}/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${NHT_API_KEY}`,
            'X-Employer-ID': NHT_EMPLOYER_ID || ''
          }
        });

        if (!response.ok) {
          throw new Error(`NHT status check failed: ${response.statusText}`);
        }

        const statusData = await response.json();

        return {
          success: true,
          employerId: NHT_EMPLOYER_ID,
          complianceStatus: statusData.complianceStatus,
          lastSubmission: statusData.lastSubmissionDate,
          outstandingReturns: statusData.outstandingReturns,
          penalties: statusData.penalties,
          accountBalance: statusData.accountBalance
        };

      } catch (error) {
        app.log.error('NHT status check failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'NHT status check failed'
        });
      }
    });

  }, { prefix: '/nht' });

  // Compliance Dashboard Endpoint
  app.get('/compliance/dashboard', async (req, reply) => {
    try {
      const [bojReports, amlMonitoring, complianceReports] = await Promise.all([
        prisma.complianceReport.count({
          where: { 
            report_type: { startsWith: 'boj_' },
            created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        }),
        prisma.amlMonitoring.count({
          where: {
            suspicious_activity: true,
            created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        }),
        prisma.complianceReport.findMany({
          where: {
            created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          orderBy: { created_at: 'desc' },
          take: 10
        })
      ]);

      return {
        success: true,
        summary: {
          bojReportsThisMonth: bojReports,
          suspiciousActivitiesThisMonth: amlMonitoring,
          totalReports: complianceReports.length
        },
        recentReports: complianceReports.map(report => ({
          id: report.id,
          type: report.report_type,
          status: report.status,
          submittedAt: report.submitted_at,
          externalReference: report.external_reference
        }))
      };

    } catch (error) {
      app.log.error('Compliance dashboard failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Compliance dashboard failed'
      });
    }
  });

};

export default regulatoryComplianceRoutes;