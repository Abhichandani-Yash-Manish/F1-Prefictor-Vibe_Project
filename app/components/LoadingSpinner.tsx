"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  message?: string;
  variant?: 'default' | 'f1' | 'minimal';
}

export default function LoadingSpinner({ 
  message = "INITIALIZING...", 
  variant = 'f1' 
}: LoadingSpinnerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-[var(--accent-gold)]/30 border-t-[var(--accent-gold)] rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-muted)]">{message}</span>
      </div>
    );
  }

  // Premium F1 Silhouette Design
  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Speed Lines Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {mounted && [...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-gradient-to-b from-transparent via-[var(--accent-cyan)] to-transparent w-[1px] h-[30%] animate-speed-lines"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.2 + Math.random() * 0.5}s`,
              opacity: Math.random() * 0.5
            }}
          />
        ))}
      </div>

      {/* Central Content */}
      <div className="z-10 flex flex-col items-center justify-center">
        
        {/* F1 Car Silhouette */}
        <div className="relative w-64 h-24 mb-8 animate-f1-shake">
            {/* Motion Blur Effect behind */}
            <div className="absolute inset-0 bg-[var(--f1-red)] blur-xl opacity-20 translate-y-2 scale-90"></div>
            
            <svg viewBox="0 0 400 120" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <defs>
                    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#333" />
                        <stop offset="50%" stopColor="#FFF" />
                        <stop offset="100%" stopColor="#333" />
                    </linearGradient>
                </defs>
                {/* Simplified F1 Car Silhouette */}
                <path 
                    d="M360,80 L340,50 L280,50 L260,30 L160,30 L150,50 L100,50 L50,60 L20,80 H360 Z M70,80 A15,15 0 0,0 100,80 A15,15 0 0,0 70,80 M290,80 A16,16 0 0,0 322,80 A16,16 0 0,0 290,80" 
                    fill="none" 
                    stroke="url(#carGradient)" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-lg"
                />
                <path 
                    d="M380,85 H20" 
                    stroke="var(--f1-red)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="opacity-60"
                />
            </svg>
            
            {/* Spinning Wheels Effect */}
             <div className="absolute left-[18%] bottom-[15%] w-8 h-8 rounded-full border-2 border-white/50 border-t-white animate-spin [animation-duration:0.2s]"></div>
             <div className="absolute right-[20%] bottom-[15%] w-9 h-9 rounded-full border-2 border-white/50 border-t-white animate-spin [animation-duration:0.2s]"></div>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4 border border-gray-700">
          <div className="h-full bg-gradient-to-r from-[var(--f1-red)] via-[var(--accent-gold)] to-[var(--accent-cyan)] w-full animate-[shimmer_1.5s_infinite_linear] origin-left" style={{ backgroundSize: '200% 100%' }}></div>
        </div>

        {/* Message */}
        <p className="text-[var(--accent-cyan)] font-orbitron font-bold tracking-[0.3em] text-sm uppercase animate-pulse">
          {message}
        </p>

      </div>
    </div>
  );
}
