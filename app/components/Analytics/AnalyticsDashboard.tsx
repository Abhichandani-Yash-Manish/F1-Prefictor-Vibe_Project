"use client";

import React, { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import TrendChart from "./TrendChart";
import AccuracyHeatmap from "./AccuracyHeatmap";
import LoadingSpinner from "../LoadingSpinner";
import { BarChart3, TrendingUp, Target, Award, BrainCircuit } from "lucide-react";

interface AnalyticsData {
  total_predictions: number;
  accuracy_percentage: number;
  accuracy_by_driver: Record<string, number>;
  accuracy_by_circuit: Record<string, number>;
  trend_data: { race: string; points: number; average?: number }[];
  overrated_drivers?: string[];
  underrated_drivers?: string[];
  average_points_global?: number;
}

export default function AnalyticsDashboard({ userId }: { userId?: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = userId ? `/api/analytics/${userId}` : '/api/analytics/me';
        const res = await fetch(endpoint);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;
  
  if (!data) return <div className="text-center p-12 text-gray-500">Could not load analytics data.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Predictions */}
        <div className="bg-[#1F2833]/50 border border-white/5 p-5 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Total Predictions</p>
                <p className="text-2xl font-bold text-white font-mono">{data.total_predictions}</p>
            </div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#1F2833]/50 border border-white/5 p-5 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-[var(--accent-cyan)]/20 rounded-lg text-[var(--accent-cyan)]">
                <Target className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Accuracy</p>
                <p className="text-2xl font-bold text-white font-mono">{data.accuracy_percentage.toFixed(1)}%</p>
            </div>
        </div>

         {/* Points vs Global Avg */}
        <div className="bg-[#1F2833]/50 border border-white/5 p-5 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-[var(--accent-gold)]/20 rounded-lg text-[var(--accent-gold)]">
                <Award className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Avg Points</p>
                <p className="text-2xl font-bold text-white font-mono">--</p> 
                {/* Note: Backend might not return average points directly in root, check spec or data */}
            </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-[#1F2833]/30 border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-[var(--accent-cyan)]" />
                <h3 className="font-bold text-lg text-white">Season Performance</h3>
            </div>
            <TrendChart data={data.trend_data} />
        </div>

        {/* Heatmap (1/3 width but full height potentially, or moved down) */}
        {/* Actually lets put Heatmap below and Insights here? */}
        <div className="bg-[#1F2833]/30 border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[var(--f1-red)]" />
                <h3 className="font-bold text-lg text-white">Insights</h3>
            </div>
            
            <div className="space-y-4">
                {data.overrated_drivers && data.overrated_drivers.length > 0 && (
                    <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-400 uppercase font-bold mb-1">Overrated</p>
                        <p className="text-sm text-gray-300">
                            You often predict <span className="text-white font-bold">{data.overrated_drivers.join(", ")}</span> higher than they finish.
                        </p>
                    </div>
                )}
                
                {data.underrated_drivers && data.underrated_drivers.length > 0 && (
                    <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-lg">
                        <p className="text-xs text-green-400 uppercase font-bold mb-1">Underrated</p>
                        <p className="text-sm text-gray-300">
                            You often predict <span className="text-white font-bold">{data.underrated_drivers.join(", ")}</span> lower than they finish.
                        </p>
                    </div>
                )}

                {(!data.overrated_drivers?.length && !data.underrated_drivers?.length) && (
                    <p className="text-sm text-gray-500 italic">Predict more races to unlock insights.</p>
                )}
            </div>
        </div>

      </div>

      {/* Driver Accuracy Heatmap */}
      <div className="bg-[#1F2833]/30 border border-white/5 rounded-xl p-6">
         <AccuracyHeatmap driverStats={data.accuracy_by_driver} />
      </div>

    </div>
  );
}
