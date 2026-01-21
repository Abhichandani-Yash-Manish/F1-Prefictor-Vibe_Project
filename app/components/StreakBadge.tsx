"use client";

import React, { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface StreakData {
  current_streak: number;
  best_streak: number;
  multiplier: number;
  next_threshold: number | null;
  is_on_fire: boolean;
}

interface StreakBadgeProps {
  userId: string;
}

export default function StreakBadge({ userId }: StreakBadgeProps) {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        // Fetch from API manually or via Supabase if possible, but spec says API
        const res = await fetch(`/api/users/${userId}/streak`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchStreak();
  }, [userId]);

  if (loading || !data || data.current_streak === 0) return null;

  return (
    <div className="relative group cursor-help">
      <div className={`
        flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300
        ${data.is_on_fire 
          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
          : 'bg-white/5 border-white/10 text-gray-400'
        }
      `}>
        {data.is_on_fire ? (
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600 animate-pulse" />
        ) : (
          <Trophy className="w-3.5 h-3.5" />
        )}
        <span className="font-mono">{data.current_streak}</span>
        
        {data.multiplier > 1 && (
            <span className="text-[10px] px-1 bg-white/10 rounded text-white ml-1">
                {data.multiplier}x
            </span>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-[#0a0a0c] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Streak Stats</p>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Current</span>
            <span className="text-white font-mono">{data.current_streak}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Best</span>
            <span className="text-[#FFD700] font-mono">{data.best_streak}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Multiplier</span>
            <span className="text-[var(--f1-red)] font-mono">{data.multiplier}x</span>
          </div>
          
          {data.next_threshold && (
             <div className="pt-2 border-t border-white/10 mt-2">
               <p className="text-[10px] text-gray-400">
                 {data.next_threshold - data.current_streak} more for next boost!
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
