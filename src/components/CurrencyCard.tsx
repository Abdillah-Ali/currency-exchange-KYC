import { Currency, TransactionType } from '@/lib/types';
import { formatNumber } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CurrencyCardProps {
  currency: Currency;
  transactionType: TransactionType;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function CurrencyCard({ currency, transactionType, isSelected, onSelect }: CurrencyCardProps) {
  const rate = transactionType === 'buy' ? currency.buyRate : currency.sellRate;
  const availability = transactionType === 'buy' ? currency.buyAvailable : currency.sellAvailable;
  const isAvailable = availability !== 'unavailable';

  return (
    <button
      onClick={onSelect}
      disabled={!isAvailable}
      className={cn(
        'currency-card w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/50',
        !isAvailable && 'opacity-50 cursor-not-allowed hover:border-border'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currency.flag}</span>
          <div>
            <p className="font-semibold text-foreground">{currency.code}</p>
            <p className="text-sm text-muted-foreground">{currency.name}</p>
          </div>
        </div>
        <StatusBadge status={availability} size="sm" showIcon={false} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {transactionType === 'buy' ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-accent" />
          )}
          <span className="text-sm text-muted-foreground">
            {transactionType === 'buy' ? 'Buy Rate' : 'Sell Rate'}
          </span>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-foreground">
            {formatNumber(rate)} <span className="text-sm font-normal text-muted-foreground">TZS</span>
          </p>
        </div>
      </div>
    </button>
  );
}
