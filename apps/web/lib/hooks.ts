import { useState, useEffect } from 'react';
import { api } from './api';

// =============================================
// PAYMENT HOOKS
// =============================================

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (data: {
    amount: number;
    currency: string;
    customerId?: string;
    description?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.stripe.createPaymentIntent(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
      throw err;
    }
  };

  const createCustomer = async (data: {
    email: string;
    name: string;
    phone?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.stripe.createCustomer(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Customer creation failed');
      setLoading(false);
      throw err;
    }
  };

  return {
    createPaymentIntent,
    createCustomer,
    loading,
    error
  };
};

// =============================================
// KYC HOOKS
// =============================================

export const useKyc = (userId?: string) => {
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadKycStatus(userId);
    }
  }, [userId]);

  const loadKycStatus = async (userId: string) => {
    setLoading(true);
    try {
      const status = await api.kyc.getKycStatus(userId);
      setKycStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  };

  const verifyTrn = async (data: {
    trn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.kyc.verifyTrn(data);
      if (userId) {
        await loadKycStatus(userId);
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TRN verification failed');
      setLoading(false);
      throw err;
    }
  };

  const verifyDocument = async (data: {
    documentType: 'drivers_license' | 'passport' | 'national_id';
    documentNumber: string;
    documentImage: string;
    selfieImage?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.kyc.verifyDocument(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Document verification failed');
      setLoading(false);
      throw err;
    }
  };

  const requestCreditCheck = async (data: {
    trn: string;
    consentGiven: boolean;
    checkType: 'basic' | 'detailed';
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.kyc.requestCreditCheck(data);
      if (userId) {
        await loadKycStatus(userId);
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credit check failed');
      setLoading(false);
      throw err;
    }
  };

  return {
    kycStatus,
    verifyTrn,
    verifyDocument,
    requestCreditCheck,
    loading,
    error,
    refetch: () => userId && loadKycStatus(userId)
  };
};

// =============================================
// BANKING HOOKS
// =============================================

export const useBanking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyNcbAccount = async (data: {
    accountNumber: string;
    routingNumber?: string;
    bankCode: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.banking.ncb.verifyAccount(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account verification failed');
      setLoading(false);
      throw err;
    }
  };

  const makeNcbTransfer = async (data: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    currency: string;
    reference: string;
    description?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.banking.ncb.transfer(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
      setLoading(false);
      throw err;
    }
  };

  const processScotiaCardPayment = async (data: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    amount: number;
    currency: string;
    cardholderName: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.banking.scotia.processCardPayment(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Card payment failed');
      setLoading(false);
      throw err;
    }
  };

  const createLynkPayment = async (data: {
    phoneNumber: string;
    amount: number;
    currency: string;
    reference: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.banking.lynk.createPayment(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'LYNK payment failed');
      setLoading(false);
      throw err;
    }
  };

  return {
    verifyNcbAccount,
    makeNcbTransfer,
    processScotiaCardPayment,
    createLynkPayment,
    loading,
    error
  };
};

// =============================================
// COMMUNICATION HOOKS
// =============================================

export const useCommunication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (data: {
    userId: string;
    type: 'payment_due' | 'payment_received' | 'round_started' | 'payout_ready' | 'kyc_required' | 'compliance_alert';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    channels: ('whatsapp' | 'sms' | 'email' | 'push')[];
    data?: Record<string, any>;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.communication.sendNotification(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Notification failed');
      setLoading(false);
      throw err;
    }
  };

  const sendWhatsApp = async (data: {
    to: string;
    messageType: 'text' | 'template' | 'media';
    content: string;
    templateName?: string;
    templateVariables?: string[];
    mediaUrl?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.communication.whatsapp.sendMessage(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WhatsApp message failed');
      setLoading(false);
      throw err;
    }
  };

  const sendSms = async (data: {
    to: string;
    message: string;
    sender?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.communication.sms.sendMessage(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SMS failed');
      setLoading(false);
      throw err;
    }
  };

  const sendEmail = async (data: {
    to: string;
    subject: string;
    content: string;
    isHtml?: boolean;
    cc?: string[];
    bcc?: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.communication.email.sendEmail(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email failed');
      setLoading(false);
      throw err;
    }
  };

  return {
    sendNotification,
    sendWhatsApp,
    sendSms,
    sendEmail,
    loading,
    error
  };
};

// =============================================
// COMPLIANCE HOOKS
// =============================================

export const useCompliance = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.compliance.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance dashboard');
    } finally {
      setLoading(false);
    }
  };

  const monitorTransaction = async (data: {
    transactionId: string;
    transactionType: 'deposit' | 'withdrawal' | 'transfer';
    amount: number;
    currency: string;
    suspiciousActivity?: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    description?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.compliance.monitorTransaction(data);
      await loadDashboard(); // Refresh dashboard
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction monitoring failed');
      setLoading(false);
      throw err;
    }
  };

  const submitBojReport = async (data: {
    reportType: 'monthly_transactions' | 'suspicious_activity' | 'large_transactions' | 'customer_data';
    periodStart: string;
    periodEnd: string;
    includeCustomerData?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.compliance.submitBojReport(data);
      await loadDashboard(); // Refresh dashboard
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'BOJ report submission failed');
      setLoading(false);
      throw err;
    }
  };

  return {
    dashboard,
    monitorTransaction,
    submitBojReport,
    loading,
    error,
    refetch: loadDashboard
  };
};

// =============================================
// ANALYTICS HOOKS
// =============================================

export const useAnalytics = () => {
  const [financeDashboard, setFinanceDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinanceDashboard();
  }, []);

  const loadFinanceDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.analytics.getFinanceDashboard();
      setFinanceDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load finance dashboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    financeDashboard,
    loading,
    error,
    refetch: loadFinanceDashboard
  };
};