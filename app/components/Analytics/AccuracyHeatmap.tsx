"use client";

import React from 'react';
import { TEAM_COLORS } from '../../lib/drivers';

interface AccuracyHeatmapProps {
  driverStats: Record<string, number>;
}

export default function AccuracyHeatmap({ driverStats }: AccuracyHeatmapProps) {
  if (!driverStats || Object.keys(driverStats).length === 0) {
    return (
       <div className="text-center text-[var(--text-muted)] py-8 font-mono text-sm">
         Not enough data for driver insights
       </div>
    );
  }

  const sortedStats = Object.entries(driverStats).sort(([, a], [, b]) => b - a);

  // Helper to get color based on accuracy
  const getAccuracyColor = (val: number) => {
    if (val >= 80) return 'text-[var(--success-green)]';
    if (val >= 50) return 'text-[var(--accent-gold)]';
    return 'text-[var(--alert-red)]';
  };

  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-[var(--success-green)]';
    if (val >= 50) return 'bg-[var(--accent-gold)]';
    return 'bg-[var(--alert-red)]';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-2">
        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Driver Mastery</h4>
        <span className="text-[10px] text-[var(--text-muted)]">Accuracy %</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sortedStats.map(([driver, accuracy]) => {
            // Try to find team color if possible, complicated mapping without fuller object
            // Just use generic styling with accuracy emphasis
          
            return (
                <div 
                    key={driver} 
                    className="bg-[#0B0C10] border border-[var(--glass-border)] rounded-lg p-3 hover:border-[var(--glass-border-hover)] transition group relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-white group-hover:text-[var(--accent-cyan)] transition-colors">
                            {driver}
                        </span>
                        <span className={`font-mono text-xs font-bold ${getAccuracyColor(accuracy)}`}>
                            {accuracy}%
                        </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${getBarColor(accuracy)}`} 
                            style={{ width: `${accuracy}%` }} 
                        />
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
