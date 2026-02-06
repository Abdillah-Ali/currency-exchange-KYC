import { Currency, Customer, QueueEntry, Teller, CurrencyCode } from './types';

export const currencies: Currency[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    buyRate: 2520,
    sellRate: 2480,
    buyAvailable: 'available',
    sellAvailable: 'available',
    stock: 150000,
    minTransaction: 50,
    maxTransaction: 10000,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    buyRate: 2750,
    sellRate: 2700,
    buyAvailable: 'available',
    sellAvailable: 'limited',
    stock: 80000,
    minTransaction: 50,
    maxTransaction: 8000,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    buyRate: 3180,
    sellRate: 3120,
    buyAvailable: 'limited',
    sellAvailable: 'available',
    stock: 45000,
    minTransaction: 50,
    maxTransaction: 5000,
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    flag: '🇦🇪',
    buyRate: 686,
    sellRate: 675,
    buyAvailable: 'available',
    sellAvailable: 'available',
    stock: 200000,
    minTransaction: 100,
    maxTransaction: 20000,
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    flag: '🇸🇦',
    buyRate: 672,
    sellRate: 660,
    buyAvailable: 'unavailable',
    sellAvailable: 'available',
    stock: 0,
    minTransaction: 100,
    maxTransaction: 15000,
  },
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    flag: '🇰🇪',
    buyRate: 19.5,
    sellRate: 18.8,
    buyAvailable: 'available',
    sellAvailable: 'available',
    stock: 5000000,
    minTransaction: 1000,
    maxTransaction: 500000,
  },
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    fullName: 'John Mwamba',
    phoneNumber: '+255 754 123 456',
    idType: 'nida',
    idNumber: '19850612-12345-00001-01',
    isVerified: true,
    kycStatus: 'verified',
    createdAt: new Date('2024-01-15'),
    transactionCount: 12,
  },
  {
    id: 'cust-002',
    fullName: 'Fatma Hassan',
    phoneNumber: '+255 784 567 890',
    idType: 'zanid',
    idNumber: 'ZNZ-2020-001234',
    isVerified: true,
    kycStatus: 'verified',
    createdAt: new Date('2024-02-20'),
    transactionCount: 5,
  },
  {
    id: 'cust-003',
    fullName: 'Michael Smith',
    phoneNumber: '+1 555 123 4567',
    idType: 'passport',
    idNumber: 'US123456789',
    isVerified: false,
    kycStatus: 'pending',
    createdAt: new Date('2024-12-01'),
    transactionCount: 0,
  },
];

export const mockQueue: QueueEntry[] = [
  {
    id: 'q-001',
    queueNumber: 'A101',
    customer: mockCustomers[0],
    transactionType: 'buy',
    currencyCode: 'USD',
    amount: 500,
    exchangeRate: 2520,
    localAmount: 1260000,
    status: 'waiting',
    estimatedWaitTime: 5,
    createdAt: new Date(),
  },
  {
    id: 'q-002',
    queueNumber: 'A102',
    customer: mockCustomers[1],
    transactionType: 'sell',
    currencyCode: 'EUR',
    amount: 1000,
    exchangeRate: 2700,
    localAmount: 2700000,
    status: 'waiting',
    estimatedWaitTime: 12,
    createdAt: new Date(),
  },
  {
    id: 'q-003',
    queueNumber: 'A103',
    customer: mockCustomers[2],
    transactionType: 'buy',
    currencyCode: 'GBP',
    amount: 200,
    exchangeRate: 3180,
    localAmount: 636000,
    status: 'waiting',
    estimatedWaitTime: 18,
    createdAt: new Date(),
  },
];

export const mockTellers: Teller[] = [
  {
    id: 'teller-001',
    name: 'Mary Kimaro',
    station: 1,
    isActive: true,
    transactionsToday: 24,
  },
  {
    id: 'teller-002',
    name: 'Ahmed Salim',
    station: 2,
    isActive: true,
    transactionsToday: 18,
  },
  {
    id: 'teller-003',
    name: 'Grace Mushi',
    station: 3,
    isActive: false,
    transactionsToday: 0,
  },
];

export function generateQueueNumber(): string {
  const prefix = 'A';
  const number = Math.floor(100 + Math.random() * 900);
  return `${prefix}${number}`;
}

export function getCurrencyByCode(code: CurrencyCode): Currency | undefined {
  return currencies.find(c => c.code === code);
}

export function formatCurrency(amount: number, currency: string = 'TZS'): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-TZ').format(amount);
}
