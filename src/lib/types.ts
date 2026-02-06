// Bureau de Change Types

export type TransactionType = 'buy' | 'sell';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'CNY' | 'INR' | 'KES';

export type ServiceAvailability = 'available' | 'unavailable' | 'limited';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  buyRate: number;
  sellRate: number;
  buyAvailable: ServiceAvailability;
  sellAvailable: ServiceAvailability;
  stock: number;
  minTransaction: number;
  maxTransaction: number;
}

export interface Customer {
  id?: string;
  fullName: string;
  phoneNumber: string;
  idType: string;
  idNumber: string;
  isVerified?: boolean;
  kycStatus?: 'pending' | 'verified' | 'flagged';
  createdAt?: Date;
  transactionCount?: number;
}

export interface QueueEntry {
  id: string;
  queueNumber: string;
  customer: Customer;
  transactionType: TransactionType;
  currencyCode: CurrencyCode;
  amount: number;
  exchangeRate: number;
  localAmount: number;
  status: 'waiting' | 'called' | 'processing' | 'completed' | 'cancelled';
  estimatedWaitTime?: number;
  createdAt: Date;
  calledAt?: Date;
  completedAt?: Date;
  tellerId?: string;
  notes?: string;
}

export interface Teller {
  id: string;
  name: string;
  station: number;
  isActive: boolean;
  currentCustomer?: QueueEntry;
  transactionsToday: number;
}

export interface Transaction {
  id: string;
  queueEntry: QueueEntry;
  teller: Teller;
  amountForeign: number;
  amountLocal: number;
  exchangeRate: number;
  transactionType: TransactionType;
  currencyCode: CurrencyCode;
  status: 'pending' | 'completed' | 'cancelled';
  amlFlag: boolean;
  amlNotes?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ExchangeRates {
  baseCurrency: 'TZS';
  lastUpdated: Date;
  currencies: Currency[];
}
