"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import GlassCard from "../ui/GlassCard";

const INITIAL_DATA = Array.from({ length: 20 }, (_, i) => ({
  lap: 22 + i,
  ver: 100 - (i * 1.5) + (Math.random() * 2), // Simulate fluctuating wear/grip
  ham: 100 - (i * 1.8) + (Math.random() * 2),
  nor: 100 - (i * 1.2) + (Math.random() * 2),
}));

export default function LiveTelemetry() {
  const [data, setData] = useState(INITIAL_DATA);
  const [metric, setMetric] = useState<'tires' | 'pace'>('tires');

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setData(prev => {
            const nextLap = prev[prev.length - 1].lap + 1;
            const newPoint = { 
                lap: nextLap, 
                ver: Math.max(0, prev[prev.length - 1].ver - 1.5 + (Math.random())), 
                ham: Math.max(0, prev[prev.length - 1].ham - 1.8 + (Math.random())),
                nor: Math.max(0, prev[prev.length - 1].nor - 1.2 + (Math.random()))
            };
            return [...prev.slice(1), newPoint];
        });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="p-6 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white font-orbitron tracking-wide">TELEMETRY ANALYTICS</h3>
            <div className="flex gap-2">
                <button 
                    onClick={() => setMetric('tires')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${metric === 'tires' ? 'bg-[var(--accent-cyan)] text-black' : 'bg-white/5 text-[var(--text-muted)]'}`}
                >
                    TIRE HEALTH %
                </button>
                <button 
                    onClick={() => setMetric('pace')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${metric === 'pace' ? 'bg-[var(--f1-red)] text-white' : 'bg-white/5 text-[var(--text-muted)]'}`}
                >
                    RACE PACE
                </button>
            </div>
        </div>

        <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="splitColorVer" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3671C6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3671C6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="splitColorHam" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E8002D" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#E8002D" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="splitColorNor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF8000" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#FF8000" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="lap" stroke="#666" fontSize={10} tickLine={false} />
                    <YAxis stroke="#666" fontSize={10} domain={[metric === 'tires' ? 0 : 80, metric === 'tires' ? 100 : 95]} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#333' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="ver" 
                        stroke="#3671C6" 
                        strokeWidth={2}
                        fill="url(#splitColorVer)" 
                        name="VER (Red Bull)"
                    />
                    <Area 
                        type="monotone" 
                        dataKey="ham" 
                        stroke="#E8002D" 
                        strokeWidth={2}
                        fill="url(#splitColorHam)" 
                        name="HAM (Ferrari)"
                    />
                     <Area 
                        type="monotone" 
                        dataKey="nor" 
                        stroke="#FF8000" 
                        strokeWidth={2}
                        fill="url(#splitColorNor)" 
                        name="NOR (McLaren)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </GlassCard>
  );
}
