const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

// Helper function for API requests with error handling
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const api = {
  // =============================================
  // CORE PARDNA SYSTEM
  // =============================================
  
  // Circles
  getCircles: () => apiRequest('/circles'),
  createCircle: (data: any) => apiRequest('/circles', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getCircle: (circleId: string) => apiRequest(`/circles/${circleId}`),
  
  // Members
  getCircleMembers: (circleId: string) => 
    apiRequest(`/circles/${circleId}/members`),
  
  // Rounds
  getCircleRounds: (circleId: string) => 
    apiRequest(`/circles/${circleId}/rounds`),
  createRound: (circleId: string, data: any) => 
    apiRequest(`/circles/${circleId}/rounds`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  // Payments
  getCirclePayments: (circleId: string) => 
    apiRequest(`/circles/${circleId}/payments`),
  createPayment: (circleId: string, data: any) => 
    apiRequest(`/circles/${circleId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // =============================================
  // STRIPE PAYMENT PROCESSING
  // =============================================
  
  stripe: {
    // Create payment intent
    createPaymentIntent: (data: {
      amount: number;
      currency: string;
      customerId?: string;
      description?: string;
    }) => apiRequest('/stripe/payment-intent', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    // Create customer
    createCustomer: (data: {
      email: string;
      name: string;
      phone?: string;
    }) => apiRequest('/stripe/customer', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    // Get customer
    getCustomer: (customerId: string) => 
      apiRequest(`/stripe/customer/${customerId}`),

    // Create setup intent for saving payment methods
    createSetupIntent: (data: { customerId: string }) => 
      apiRequest('/stripe/setup-intent', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    // Get payment methods
    getPaymentMethods: (customerId: string) => 
      apiRequest(`/stripe/customer/${customerId}/payment-methods`),

    // Create payout
    createPayout: (data: {
      amount: number;
      currency: string;
      destination: string;
      description?: string;
    }) => apiRequest('/stripe/payout', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // =============================================
  // JAMAICAN BANKING
  // =============================================
  
  banking: {
    // NCB Banking
    ncb: {
      verifyAccount: (data: {
        accountNumber: string;
        routingNumber?: string;
        bankCode: string;
      }) => apiRequest('/banking/ncb/verify-account', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

      transfer: (data: {
        fromAccount: string;
        toAccount: string;
        amount: number;
        currency: string;
        reference: string;
        description?: string;
      }) => apiRequest('/banking/ncb/transfer', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

      getBalance: (accountNumber: string) => 
        apiRequest(`/banking/ncb/balance/${accountNumber}`)
    },

    // Scotiabank
    scotia: {
      verifyAccount: (data: {
        accountNumber: string;
        bankCode: string;
      }) => apiRequest('/banking/scotia/verify-account', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

      processCardPayment: (data: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        amount: number;
        currency: string;
        cardholderName: string;
      }) => apiRequest('/banking/scotia/card-payment', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    },

    // LYNK Mobile Money
    lynk: {
      createPayment: (data: {
        phoneNumber: string;
        amount: number;
        currency: string;
        reference: string;
      }) => apiRequest('/banking/lynk/payment', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

      getPaymentStatus: (paymentId: string) => 
        apiRequest(`/banking/lynk/status/${paymentId}`)
    }
  },

  // =============================================
  // KYC VERIFICATION
  // =============================================
  
  kyc: {
    // TRN Verification
    verifyTrn: (data: {
      trn: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
    }) => apiRequest('/kyc/taj/trn/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    getTrnStatus: (trn: string) => 
      apiRequest(`/kyc/taj/trn/${trn}/status`),

    // Document Verification
    verifyDocument: (data: {
      documentType: 'drivers_license' | 'passport' | 'national_id';
      documentNumber: string;
      documentImage: string; // Base64
      selfieImage?: string; // Base64
    }) => apiRequest('/kyc/veriff/document/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    getDocumentStatus: (verificationId: string) => 
      apiRequest(`/kyc/veriff/document/${verificationId}/status`),

    // Credit Check
    requestCreditCheck: (data: {
      trn: string;
      consentGiven: boolean;
      checkType: 'basic' | 'detailed';
    }) => apiRequest('/kyc/creditinfo/credit/check', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    getCreditScore: (trn: string) => 
      apiRequest('/kyc/creditinfo/credit/score', {
        method: 'POST',
        body: JSON.stringify({ trn })
      }),

    // Overall KYC Status
    getKycStatus: (userId: string) => 
      apiRequest(`/kyc/user/${userId}/status`)
  },

  // =============================================
  // REGULATORY COMPLIANCE
  // =============================================
  
  compliance: {
    // AML Monitoring
    monitorTransaction: (data: {
      transactionId: string;
      transactionType: 'deposit' | 'withdrawal' | 'transfer';
      amount: number;
      currency: string;
      suspiciousActivity?: boolean;
      riskLevel: 'low' | 'medium' | 'high';
      description?: string;
    }) => apiRequest('/compliance/boj/aml/monitor', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    // BOJ Reporting
    submitBojReport: (data: {
      reportType: 'monthly_transactions' | 'suspicious_activity' | 'large_transactions' | 'customer_data';
      periodStart: string;
      periodEnd: string;
      includeCustomerData?: boolean;
    }) => apiRequest('/compliance/boj/report', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    submitCtr: (data: {
      transactionId: string;
      amount: number;
      currency: string;
      customerTrn: string;
      transactionType: string;
    }) => apiRequest('/compliance/boj/ctr', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    // NHT Compliance
    registerNhtEmployer: (data: {
      employerName: string;
      employerTrn: string;
      employeeCount: number;
      contactEmail: string;
      contactPhone: string;
    }) => apiRequest('/compliance/nht/register-employer', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    submitNhtContributions: (data: {
      payrollPeriod: string;
      employees: Array<{
        employeeTrn: string;
        employeeName: string;
        grossSalary: number;
        nhtContribution: number;
      }>;
    }) => apiRequest('/compliance/nht/contributions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    getNhtStatus: () => apiRequest('/compliance/nht/status'),

    // Compliance Dashboard
    getDashboard: () => apiRequest('/compliance/dashboard')
  },

  // =============================================
  // COMMUNICATION
  // =============================================
  
  communication: {
    // WhatsApp
    whatsapp: {
      sendMessage: (data: {
        to: string;
        messageType: 'text' | 'template' | 'media';
        content: string;
        templateName?: string;
        templateVariables?: string[];
        mediaUrl?: string;
      }) => apiRequest('/communication/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    },

    // SMS
    sms: {
      sendMessage: (data: {
        to: string;
        message: string;
        sender?: string;
      }) => apiRequest('/communication/sms/send', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    },

    // Email
    email: {
      sendEmail: (data: {
        to: string;
        subject: string;
        content: string;
        isHtml?: boolean;
        cc?: string[];
        bcc?: string[];
      }) => apiRequest('/communication/email/send', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    },

    // Unified Notifications
    sendNotification: (data: {
      userId: string;
      type: 'payment_due' | 'payment_received' | 'round_started' | 'payout_ready' | 'kyc_required' | 'compliance_alert';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      channels: ('whatsapp' | 'sms' | 'email' | 'push')[];
      data?: Record<string, any>;
    }) => apiRequest('/communication/notify', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    // Analytics
    getAnalytics: () => apiRequest('/communication/analytics')
  },

  // =============================================
  // ANALYTICS & DASHBOARD
  // =============================================
  
  analytics: {
    getFinanceDashboard: () => {
      // This would be a combined call or new endpoint
      return Promise.all([
        api.getCircles(),
        api.compliance.getDashboard(),
        api.communication.getAnalytics()
      ]).then(([circles, compliance, communication]) => ({
        circles,
        compliance,
        communication
      }));
    },

    getMicrofinanceData: () => {
      // Mock data for now - would need real microfinance endpoints
      return Promise.resolve({
        totalLoans: 150000000, // $1.5M JMD
        activeLoans: 45,
        defaultRate: 2.3,
        avgLoanSize: 250000 // $2.5K JMD
      });
    },

    getWalletData: (userId: string) => {
      // Would need wallet endpoints
      return Promise.resolve({
        balance: 85000, // $850 JMD
        transactions: [],
        recentActivity: []
      });
    }
  }
};