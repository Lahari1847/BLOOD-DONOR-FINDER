import React from 'react';
import { Droplet } from 'lucide-react';

interface BloodBadgeProps {
  group?: string;
  bloodGroup?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  className?: string;
}

export const BloodBadge: React.FC<BloodBadgeProps> = ({
  group,
  bloodGroup,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const effectiveGroup = bloodGroup || group || 'O+';
  const isNegative = effectiveGroup.includes('-');
  
  // High contrast healthcare badge styling
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-bold',
    xl: 'text-xl px-4 py-2 gap-2.5 font-extrabold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  // Distinct border/accent for Rh-negative (rare) vs Rh-positive
  const colorClasses = isNegative
    ? 'bg-amber-50 text-amber-900 border border-amber-300 ring-1 ring-amber-200'
    : 'bg-crimson-50 text-crimson-900 border border-crimson-300 ring-1 ring-crimson-200';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg shadow-sm font-sans tracking-tight transition-all duration-150 ${sizeClasses[size]} ${colorClasses} ${className}`}
      title={`${effectiveGroup} Blood Group (${isNegative ? 'Rh Negative' : 'Rh Positive'})`}
    >
      {showIcon && (
        <Droplet
          className={`${iconSizes[size]} ${isNegative ? 'text-amber-600 fill-amber-500' : 'text-crimson-600 fill-crimson-500'}`}
        />
      )}
      <span>{effectiveGroup}</span>
    </span>
  );
};
