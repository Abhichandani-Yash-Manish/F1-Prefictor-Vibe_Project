import React from 'react';

export type BadgeVariant = 'cyan' | 'gold' | 'red' | 'success' | 'warning' | 'teal' | 'amber' | 'green' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  style?: React.CSSProperties;
}

export default function Badge({ 
  children, 
  variant = 'cyan', 
  size = 'md',
  className = '',
  icon,
  pulse = false,
  style
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const variantClass = variant === 'outline' ? 'border border-current bg-transparent' : `badge badge-${variant}`;

  return (
    <span style={style} className={`${variantClass} inline-flex items-center gap-1.5 ${sizeClasses} ${pulse ? 'animate-pulse' : ''} ${className} rounded-full font-bold uppercase tracking-wider`}>
        {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
        {icon && <span>{icon}</span>}
        {children}
    </span>
  );
}
