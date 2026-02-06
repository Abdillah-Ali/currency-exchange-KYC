import { ServiceAvailability } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, X, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: ServiceAvailability;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig = {
  available: {
    label: 'Available',
    className: 'status-available',
    icon: Check,
  },
  unavailable: {
    label: 'Not Available',
    className: 'status-unavailable',
    icon: X,
  },
  limited: {
    label: 'Limited',
    className: 'status-limited',
    icon: AlertTriangle,
  },
};

export function StatusBadge({ status, showIcon = true, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
      {config.label}
    </span>
  );
}
