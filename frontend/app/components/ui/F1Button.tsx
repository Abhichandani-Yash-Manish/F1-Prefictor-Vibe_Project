import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'teal' | 'ghost' | 'outline';

interface F1ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export default function F1Button({
  children,
  variant = 'gold',
  size = 'md',
  href,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  icon
}: F1ButtonProps) {
  let btnClass = `btn-${variant}`;
  if (variant === 'outline') btnClass = 'btn-ghost border border-[var(--glass-border)] hover:border-white';
  
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-8 py-4 text-lg' : ''; // Default is handled by base btn classes usually, or add specifics

  const classes = `${btnClass} ${sizeClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  const content = (
    <>
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      type={type} 
      className={classes} 
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
