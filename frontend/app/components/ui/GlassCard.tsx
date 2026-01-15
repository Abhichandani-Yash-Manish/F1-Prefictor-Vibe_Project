import React from 'react';

type CardVariant = 'default' | 'gold';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ 
  children, 
  variant = 'default', 
  className = '',
  interactive = false,
  onClick
}: GlassCardProps) {
  const baseClass = variant === 'gold' ? 'glass-card-gold' : 'glass-card';
  const hoverClass = interactive ? 'transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer' : '';

  return (
    <div 
      className={`${baseClass} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
