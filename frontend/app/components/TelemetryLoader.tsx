"use client";

interface TelemetryLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function TelemetryLoader({ size = 'md', label = 'LOADING' }: TelemetryLoaderProps) {
  const sizeClasses = {
    sm: 'h-8 gap-1',
    md: 'h-16 gap-2',
    lg: 'h-24 gap-3'
  };

  const barClasses = {
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-2'
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Telemetry Bars */}
      <div className={`flex items-end ${sizeClasses[size]}`}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`${barClasses[size]} bg-[var(--accent-cyan)] rounded-t animate-telemetry-bar`}
            style={{
              animationDelay: `${i * 0.1}s`,
              height: '30%'
            }}
          />
        ))}
      </div>
      
      {/* Label */}
      {label && (
        <span className="font-mono text-xs text-[var(--accent-cyan)] tracking-widest uppercase animate-pulse">
          {label}...
        </span>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes telemetry-bar {
          0%, 100% { 
            height: 30%; 
            background-color: var(--accent-cyan);
          }
          25% { 
            height: 100%; 
            background-color: var(--success-green);
          }
          50% { 
            height: 50%; 
            background-color: var(--accent-cyan);
          }
          75% { 
            height: 80%; 
            background-color: var(--accent-lime);
          }
        }
        .animate-telemetry-bar {
          animation: telemetry-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Alternative: Racing Pulse Loader
export function RacingPulseLoader() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-12">
        {/* Background Track */}
        <div className="absolute inset-0 bg-[var(--bg-carbon)] rounded-full overflow-hidden">
          {/* Racing Pulse */}
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent animate-racing-pulse" />
        </div>
        
        {/* Grid Lines */}
        <div className="absolute inset-0 flex justify-between px-4 items-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-px h-4 bg-[var(--grid-line)]" />
          ))}
        </div>
      </div>
      
      <span className="font-mono text-xs text-[var(--accent-cyan)] tracking-widest uppercase">
        ANALYZING TELEMETRY...
      </span>

      <style jsx>{`
        @keyframes racing-pulse {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
        .animate-racing-pulse {
          animation: racing-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Lap Counter Loader
export function LapCounterLoader({ currentLap = 1, totalLaps = 58 }: { currentLap?: number; totalLaps?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-baseline gap-2">
        <span className="font-orbitron text-6xl font-black text-[var(--accent-cyan)]">
          {currentLap}
        </span>
        <span className="font-mono text-2xl text-[var(--text-muted)]">/</span>
        <span className="font-orbitron text-2xl font-bold text-[var(--text-silver)]">
          {totalLaps}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-48 h-2 bg-[var(--bg-carbon)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[var(--accent-cyan)] rounded-full transition-all duration-300"
          style={{ width: `${(currentLap / totalLaps) * 100}%` }}
        />
      </div>
      
      <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest">
        LOADING LAP DATA
      </span>
    </div>
  );
}
