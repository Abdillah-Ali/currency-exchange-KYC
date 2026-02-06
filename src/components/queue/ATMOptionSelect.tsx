import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface ATMOptionSelectProps {
  title: string;
  subtitle?: string;
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onBack?: () => void;
  columns?: 2 | 3 | 4;
}

export function ATMOptionSelect({ 
  title, 
  subtitle,
  options, 
  selectedValue, 
  onSelect,
  onBack,
  columns = 2 
}: ATMOptionSelectProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>

      <div className={`grid gap-4 w-full mb-8 ${
        columns === 2 ? 'grid-cols-2' : 
        columns === 3 ? 'grid-cols-3' : 
        'grid-cols-4'
      }`}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant={selectedValue === option.value ? 'default' : 'outline'}
            className={`
              h-auto py-6 px-4 flex flex-col items-center justify-center gap-2
              transition-all hover:scale-105
              ${selectedValue === option.value ? 'ring-2 ring-primary ring-offset-2' : ''}
            `}
            onClick={() => onSelect(option.value)}
          >
            {option.icon && <span className="text-4xl">{option.icon}</span>}
            <span className="text-lg font-semibold">{option.label}</span>
            {option.description && (
              <span className="text-xs text-muted-foreground">{option.description}</span>
            )}
          </Button>
        ))}
      </div>

      {onBack && (
        <Button
          variant="outline"
          className="h-14 px-8 text-lg"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
      )}
    </div>
  );
}
