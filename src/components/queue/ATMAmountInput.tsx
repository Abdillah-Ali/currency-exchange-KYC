import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Delete, ArrowRight, ArrowLeft } from 'lucide-react';
import { Currency } from '@/lib/types';

interface ATMAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  currency: Currency;
  transactionType: 'buy' | 'sell';
  rate: number;
}

export function ATMAmountInput({
  value,
  onChange,
  onNext,
  onBack,
  currency,
  transactionType,
  rate
}: ATMAmountInputProps) {
  const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const localAmount = value ? parseFloat(value) * rate : 0;

  const handleKeyPress = (key: string) => {
    if (key === '.' && value.includes('.')) return;
    onChange(value + key);
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === '.') {
        handleKeyPress('.');
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        if (value && parseFloat(value) >= currency.minTransaction && parseFloat(value) <= currency.maxTransaction) {
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, onNext, currency, rate]);

  const isValid = value && parseFloat(value) >= currency.minTransaction && parseFloat(value) <= currency.maxTransaction;

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto animate-fade-in">
      {/* Currency Info */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-5xl">{currency.flag}</span>
          <div>
            <p className="text-2xl font-bold">{currency.code}</p>
            <p className="text-sm text-muted-foreground">
              1 {currency.code} = {rate.toLocaleString()} TZS
            </p>
          </div>
        </div>
      </div>

      {/* Amount Display */}
      <div className="w-full bg-card border-2 border-primary/30 rounded-xl p-6 mb-4">
        <p className="text-sm text-muted-foreground mb-1">
          Enter amount in {currency.code}
        </p>
        <div className="flex items-baseline justify-center">
          <span className="text-2xl text-muted-foreground mr-2">{currency.symbol}</span>
          <span className="text-5xl font-bold font-mono">
            {value || '0'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Min: {currency.symbol}{currency.minTransaction.toLocaleString()} |
          Max: {currency.symbol}{currency.maxTransaction.toLocaleString()}
        </p>
      </div>

      {/* Conversion Preview */}
      {value && parseFloat(value) > 0 && (
        <div className="w-full bg-primary/10 rounded-xl p-4 mb-4 text-center animate-scale-in">
          <p className="text-sm text-muted-foreground">
            {transactionType === 'buy' ? 'You will pay' : 'You will receive'}
          </p>
          <p className="text-3xl font-bold text-primary">
            TZS {localAmount.toLocaleString()}
          </p>
        </div>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
        {numberKeys.map((key) => (
          <Button
            key={key}
            variant="outline"
            className="h-16 text-2xl font-bold hover:bg-primary hover:text-primary-foreground"
            onClick={() => handleKeyPress(key)}
          >
            {key}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-16 text-2xl font-bold hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleKeyPress('.')}
          disabled={value.includes('.')}
        >
          .
        </Button>
        <Button
          variant="outline"
          className="h-16 text-2xl font-bold hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleKeyPress('0')}
        >
          0
        </Button>
        <Button
          variant="outline"
          className="h-16 hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleDelete}
        >
          <Delete className="h-6 w-6" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 w-full max-w-md">
        <Button
          variant="outline"
          className="flex-1 h-14 text-lg"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <Button
          className="flex-1 h-14 text-lg bg-success hover:bg-success/90"
          onClick={onNext}
          disabled={!isValid}
        >
          Next
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
