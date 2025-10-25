export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    circles: number;
    members: number;
    volume: number;
  };
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface GroupSubscription {
  id: string;
  groupId: string;
  planId: string;
  stripeSubscriptionId: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutRequest {
  id: string;
  groupId: string;
  userId: string;
  amount: number;
  platformFee: number;
  instantTransferFee?: number;
  netAmount: number;
  transferType: 'STANDARD' | 'INSTANT';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  stripeTransferId?: string;
  processedAt?: Date;
  createdAt: Date;
}

export interface FeeTransaction {
  id: string;
  type: 'PLATFORM_FEE' | 'INSTANT_TRANSFER' | 'SUBSCRIPTION' | 'PREMIUM_SERVICE';
  amount: number;
  currency: string;
  sourceId: string; // groupId, userId, or subscriptionId
  description: string;
  stripeChargeId?: string;
  createdAt: Date;
}

export interface BillingRecord {
  id: string;
  institutionId: string;
  billingMonth: string;
  saasFeesTotal: number;
  perGroupFeesTotal: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

export interface BillingAnalytics {
  totalRevenue: number;
  subscriptionRevenue: number;
  transactionFees: number;
  premiumServices: number;
  monthlyGrowth: number;
  activeSubscriptions: number;
  churnRate: number;
  conversionRate: number;
  averageRevenuePerUser: number;
}

export interface PayoutFeeCalculation {
  amount: number;
  platformFee: number;
  platformFeeRate: number;
  instantTransferFee?: number;
  netAmount: number;
  transferType: 'STANDARD' | 'INSTANT';
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
  livemode: boolean;
}

export interface UserPaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface BillingPreferences {
  id: string;
  userId: string;
  currency: string;
  autoPayEnabled: boolean;
  invoiceEmail: string;
  paymentMethodId?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  updatedAt: Date;
}