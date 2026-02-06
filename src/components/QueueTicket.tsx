import { QueueEntry } from '@/lib/types';
import { getCurrencyByCode, formatNumber, formatCurrency } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { Clock, User, ArrowRightLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface QueueTicketProps {
  entry: QueueEntry;
  showPrintButton?: boolean;
  onPrint?: () => void;
}

export function QueueTicket({ entry, showPrintButton = true, onPrint }: QueueTicketProps) {
  const currency = getCurrencyByCode(entry.currencyCode);
  const availability = entry.transactionType === 'buy' 
    ? currency?.buyAvailable 
    : currency?.sellAvailable;

  return (
    <div className="queue-ticket animate-scale-in">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-1">Queue Number</p>
        <h2 className="text-5xl font-bold text-primary pulse-number tracking-wider">
          {entry.queueNumber}
        </h2>
      </div>

      {/* Transaction Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between py-3 border-b border-dashed border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Customer</span>
          </div>
          <span className="font-medium text-foreground">{entry.customer.fullName}</span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-dashed border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowRightLeft className="h-4 w-4" />
            <span>Transaction</span>
          </div>
          <span className="font-medium text-foreground capitalize">
            {entry.transactionType} {currency?.flag} {entry.currencyCode}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-dashed border-border">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-bold text-lg text-foreground">
            {currency?.symbol}{formatNumber(entry.amount)}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-dashed border-border">
          <span className="text-muted-foreground">Rate</span>
          <span className="font-medium text-foreground">
            1 {entry.currencyCode} = {formatNumber(entry.exchangeRate)} TZS
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-dashed border-border">
          <span className="text-muted-foreground">Total (TZS)</span>
          <span className="font-bold text-xl text-primary">
            {formatCurrency(entry.localAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Est. Wait</span>
          </div>
          <span className="font-medium text-foreground">~{entry.estimatedWaitTime} min</span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center mb-4">
        {availability && <StatusBadge status={availability} />}
      </div>

      {/* Timestamp */}
      <p className="text-center text-xs text-muted-foreground mb-4">
        Issued: {format(entry.createdAt, 'dd MMM yyyy, HH:mm')}
      </p>

      {/* Print Button */}
      {showPrintButton && (
        <Button onClick={onPrint} className="w-full" variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Ticket
        </Button>
      )}
    </div>
  );
}
