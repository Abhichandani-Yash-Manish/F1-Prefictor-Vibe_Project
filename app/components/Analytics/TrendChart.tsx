"use client";

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface TrendData {
  race: string;
  points: number;
  average?: number;
}

interface TrendChartProps {
  data: TrendData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0C10] border border-[var(--glass-border)] p-3 rounded-lg shadow-xl">
        <p className="font-orbitron text-sm mb-2 text-white">{label}</p>
        <div className="space-y-1">
          <p className="text-xs text-[var(--accent-cyan)] font-mono">
            Points: {payload[0].value}
          </p>
          {payload[1] && (
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Avg: {payload[1].value}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
        <div className="h-64 flex items-center justify-center text-[var(--text-muted)] italic">
            No race data yet
        </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="race" 
            stroke="var(--text-muted)" 
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <Area 
            type="monotone" 
            dataKey="points" 
            stroke="var(--accent-cyan)" 
            fillOpacity={1} 
            fill="url(#colorPoints)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
