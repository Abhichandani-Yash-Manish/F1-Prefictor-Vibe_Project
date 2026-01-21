import React from 'react';
import Badge, { BadgeVariant } from './Badge';

interface PageHeaderProps {
    title: string;
    highlight?: string; 
    description?: string;
    badgeText?: string;
    badgeVariant?: BadgeVariant;
}

export default function PageHeader({
    title,
    highlight = '',
    description,
    badgeText,
    badgeVariant = 'cyan'
}: PageHeaderProps) {
    return (
        <div className="mb-10 animate-fade-in-up">
           {badgeText && <Badge variant={badgeVariant} className="mb-4">{badgeText}</Badge>}
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
             <span className="text-[var(--accent-cyan)]">{highlight}</span> {title}
           </h1>
           {description && (
             <p className="text-[var(--text-muted)] max-w-2xl text-lg">
                {description}
             </p>
           )}
        </div>
    );
}
