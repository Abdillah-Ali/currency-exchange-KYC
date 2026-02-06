import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Delete, ArrowRight, ArrowLeft } from 'lucide-react';

interface ATMTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack?: () => void;
  placeholder?: string;
  label: string;
  subtitle?: string;
  isNextDisabled?: boolean;
}

export function ATMTextInput({
  value,
  onChange,
  onNext,
  onBack,
  placeholder,
  label,
  subtitle,
  isNextDisabled
}: ATMTextInputProps) {
  const [showUppercase, setShowUppercase] = useState(true);

  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const handleKeyPress = (key: string) => {
    const char = showUppercase ? key : key.toLowerCase();
    onChange(value + char);
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleSpace = () => {
    onChange(value + ' ');
  };

  // Add physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser actions for some keys if needed
      if (e.key.length === 1) {
        // Alphanumeric keys
        const char = e.key;
        // Check if it's a letter or number or valid symbol
        if (/^[a-zA-Z0-9]$/.test(char)) {
          // We can just append the char directly, or respect the UI's case state. 
          // Usually physical keyboard users expect the case they typed.
          // But to match the UI consistency, we might want to force upper/lower if strict.
          // For now, let's respect the physical key's case to be natural.
          onChange(value + char.toUpperCase()); // Enforce uppercase for consistency with typical ID forms
        }
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === ' ') {
        handleSpace();
      } else if (e.key === 'Enter') {
        if (!isNextDisabled) {
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, onNext, isNextDisabled]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto animate-fade-in">
      {/* Display */}
      <div className="w-full mb-6">
        <p className="text-lg text-muted-foreground mb-2">{label}</p>
        {subtitle && <p className="text-sm text-muted-foreground/70 mb-3">{subtitle}</p>}
        <div className="bg-card border-2 border-primary/30 rounded-xl p-4 min-h-[60px] flex items-center">
          <span className="text-2xl font-mono tracking-wider">
            {value || <span className="text-muted-foreground/50">{placeholder}</span>}
          </span>
          <span className="animate-pulse text-primary ml-1">|</span>
        </div>
      </div>

      {/* Number row */}
      <div className="flex gap-1 mb-1 justify-center flex-wrap">
        {numbers.map((key) => (
          <Button
            key={key}
            variant="outline"
            className="h-12 w-10 text-lg font-semibold"
            onClick={() => onChange(value + key)}
          >
            {key}
          </Button>
        ))}
      </div>

      {/* Keyboard rows */}
      <div className="flex gap-1 mb-1 justify-center">
        {row1.map((key) => (
          <Button
            key={key}
            variant="outline"
            className="h-12 w-10 text-lg font-semibold"
            onClick={() => handleKeyPress(key)}
          >
            {showUppercase ? key : key.toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="flex gap-1 mb-1 justify-center">
        {row2.map((key) => (
          <Button
            key={key}
            variant="outline"
            className="h-12 w-10 text-lg font-semibold"
            onClick={() => handleKeyPress(key)}
          >
            {showUppercase ? key : key.toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="flex gap-1 mb-3 justify-center">
        <Button
          variant="outline"
          className="h-12 w-16 text-sm font-semibold"
          onClick={() => setShowUppercase(!showUppercase)}
        >
          {showUppercase ? '⬆ ABC' : '⬇ abc'}
        </Button>
        {row3.map((key) => (
          <Button
            key={key}
            variant="outline"
            className="h-12 w-10 text-lg font-semibold"
            onClick={() => handleKeyPress(key)}
          >
            {showUppercase ? key : key.toLowerCase()}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-12 w-14"
          onClick={handleDelete}
        >
          <Delete className="h-5 w-5" />
        </Button>
      </div>

      {/* Space and special */}
      <div className="flex gap-2 mb-6">
        <Button
          variant="outline"
          className="h-12 w-48"
          onClick={handleSpace}
        >
          SPACE
        </Button>
        <Button
          variant="outline"
          className="h-12 w-12"
          onClick={() => onChange(value + '-')}
        >
          -
        </Button>
        <Button
          variant="outline"
          className="h-12 w-12"
          onClick={() => onChange(value + '+')}
        >
          +
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 w-full max-w-md">
        {onBack && (
          <Button
            variant="outline"
            className="flex-1 h-14 text-lg"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        )}
        <Button
          className="flex-1 h-14 text-lg bg-success hover:bg-success/90"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          Next
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
