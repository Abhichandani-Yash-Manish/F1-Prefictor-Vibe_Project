"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getDriverName } from "../lib/drivers";

interface ConfidenceMeterProps {
  raceId: number;
  selectedDriver: string;
  position: 'quali_p1' | 'quali_p2' | 'quali_p3' | 'race_p1' | 'race_p2' | 'race_p3';
}

interface DriverStats {
  driver: string;
  count: number;
  percentage: number;
}

export default function ConfidenceMeter({ raceId, selectedDriver, position }: ConfidenceMeterProps) {
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPredictions, setTotalPredictions] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedDriver || selectedDriver === "Select Driver...") {
        setStats(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch all predictions for this race and position
        const columnName = `${position}_driver`;
        const { data: predictions, error } = await supabase
          .from("predictions")
          .select(columnName)
          .eq("race_id", raceId);

        if (error || !predictions) {
          setStats(null);
          setLoading(false);
          return;
        }

        const total = predictions.length;
        setTotalPredictions(total);

        if (total === 0) {
          setStats(null);
          setLoading(false);
          return;
        }

        // Count how many picked the same driver
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sameDriverCount = predictions.filter(
          (p: any) => p[columnName] === selectedDriver
        ).length;

        const percentage = Math.round((sameDriverCount / total) * 100);

        setStats({
          driver: getDriverName(selectedDriver),
          count: sameDriverCount,
          percentage
        });
      } catch (e) {
        console.error("Error fetching confidence stats:", e);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [raceId, selectedDriver, position, supabase]);

  if (loading || !stats || !selectedDriver || selectedDriver === "Select Driver...") {
    return null;
  }

  // Determine confidence level color
  const getConfidenceColor = (pct: number) => {
    if (pct >= 50) return "var(--alert-red)"; // Very popular pick
    if (pct >= 30) return "var(--alert-amber)"; // Common pick
    if (pct >= 15) return "var(--accent-cyan)"; // Moderate pick
    return "var(--success-green)"; // Unique pick (contrarian)
  };

  const getConfidenceLabel = (pct: number) => {
    if (pct >= 50) return "POPULAR";
    if (pct >= 30) return "COMMON";
    if (pct >= 15) return "MODERATE";
    return "CONTRARIAN";
  };

  const color = getConfidenceColor(stats.percentage);
  const label = getConfidenceLabel(stats.percentage);

  return (
    <div className="mt-2 p-3 rounded-lg bg-black/30 border border-[var(--glass-border)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
          Community Pick
        </span>
        <span 
          className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-[var(--bg-carbon)] rounded-full overflow-hidden mb-2">
        <div 
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ 
            width: `${stats.percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[var(--text-silver)]">
          {stats.count} of {totalPredictions} users
        </span>
        <span 
          className="font-orbitron text-lg font-bold"
          style={{ color }}
        >
          {stats.percentage}%
        </span>
      </div>
    </div>
  );
}
