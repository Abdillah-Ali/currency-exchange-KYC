import { Button } from '@/components/ui/button';
import { Delete, ArrowRight } from 'lucide-react';

interface ATMKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  showLetters?: boolean;
}

export function ATMKeypad({ onKeyPress, onDelete, onNext, isNextDisabled, showLetters = false }: ATMKeypadProps) {
  const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {numberKeys.slice(0, 9).map((key) => (
          <Button
            key={key}
            variant="outline"
            className="h-16 text-2xl font-bold hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={() => onKeyPress(key)}
          >
            {key}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-16 text-xl hover:bg-destructive hover:text-destructive-foreground transition-all"
          onClick={onDelete}
        >
          <Delete className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          className="h-16 text-2xl font-bold hover:bg-primary hover:text-primary-foreground transition-all"
          onClick={() => onKeyPress('0')}
        >
          0
        </Button>
        <Button
          className="h-16 text-xl bg-success hover:bg-success/90"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
