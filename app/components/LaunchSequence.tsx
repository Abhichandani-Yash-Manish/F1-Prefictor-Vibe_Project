"use client";
import { useState, useEffect } from "react";

interface LaunchSequenceProps {
  targetTime: Date | string;
  onLock?: () => void;
  label?: string;
  showSeconds?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function LaunchSequence({ 
  targetTime, 
  onLock,
  label = "PREDICTION WINDOW CLOSES IN:",
  showSeconds = true
}: LaunchSequenceProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const target = typeof targetTime === 'string' ? new Date(targetTime) : targetTime;
    
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const difference = target.getTime() - now;
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference
      };
    };

    // Initial calculation
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    
    if (initial.total <= 0) {
      setIsLocked(true);
      onLock?.();
    }

    // Update every second
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      
      if (updated.total <= 0 && !isLocked) {
        setIsLocked(true);
        onLock?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onLock, isLocked]);

  if (!timeLeft) return null;

  // Determine countdown state for styling
  const getCountdownState = () => {
    const hoursRemaining = timeLeft.days * 24 + timeLeft.hours;
    if (timeLeft.total <= 0) return 'locked';
    if (timeLeft.minutes < 10 && hoursRemaining === 0) return 'critical';
    if (hoursRemaining < 1) return 'warning';
    return 'normal';
  };

  const state = getCountdownState();

  const stateStyles = {
    normal: 'countdown-normal',
    warning: 'countdown-warning',
    critical: 'countdown-critical',
    locked: 'text-red-500'
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (isLocked) {
    return (
      <div className="relative">
        <div className="glass-card p-8 text-center shutter-locked min-h-[200px]" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 text-center">
      {/* Label */}
      <div className="text-xs md:text-sm font-orbitron text-[var(--text-silver)] tracking-[0.3em] uppercase mb-4 opacity-70">
        {label}
      </div>
      
      {/* Countdown Display */}
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {/* Days */}
        <div className="flex flex-col items-center">
          <span className={`countdown-digit text-4xl md:text-6xl lg:text-7xl ${stateStyles[state]}`}>
            {formatNumber(timeLeft.days)}
          </span>
          <span className="text-[10px] md:text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mt-2">
            Days
          </span>
        </div>
        
        <span className={`countdown-digit text-3xl md:text-5xl ${stateStyles[state]} opacity-50`}>:</span>
        
        {/* Hours */}
        <div className="flex flex-col items-center">
          <span className={`countdown-digit text-4xl md:text-6xl lg:text-7xl ${stateStyles[state]}`}>
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="text-[10px] md:text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mt-2">
            Hours
          </span>
        </div>
        
        <span className={`countdown-digit text-3xl md:text-5xl ${stateStyles[state]} opacity-50`}>:</span>
        
        {/* Minutes */}
        <div className="flex flex-col items-center">
          <span className={`countdown-digit text-4xl md:text-6xl lg:text-7xl ${stateStyles[state]}`}>
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="text-[10px] md:text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mt-2">
            Mins
          </span>
        </div>
        
        {showSeconds && (
          <>
            <span className={`countdown-digit text-3xl md:text-5xl ${stateStyles[state]} opacity-50`}>:</span>
            
            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span className={`countdown-digit text-4xl md:text-6xl lg:text-7xl ${stateStyles[state]}`}>
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-[10px] md:text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mt-2">
                Secs
              </span>
            </div>
          </>
        )}
      </div>
      
      {/* Status Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          state === 'critical' ? 'bg-[var(--alert-red)] animate-pulse' :
          state === 'warning' ? 'bg-[var(--alert-amber)]' :
          'bg-[var(--accent-cyan)]'
        }`} />
        <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
          {state === 'critical' ? 'Window Closing' :
           state === 'warning' ? 'Final Hour' :
           'Window Open'}
        </span>
      </div>
    </div>
  );
}
