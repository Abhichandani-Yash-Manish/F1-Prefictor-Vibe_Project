"use client";

import React, { useState } from "react";
import LiveTimingTower from "@/app/components/Live/LiveTimingTower";
import PageHeader from "@/app/components/ui/PageHeader";
import GlassCard from "@/app/components/ui/GlassCard";
import { Radio, Video, Mic2 } from "lucide-react";

import LiveTelemetry from "@/app/components/Live/LiveTelemetry";

export default function LivePage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'radio'>('feed');

  return (
    <div className="min-h-screen bg-[var(--bg-void)] bg-[url('/patterns/grid.svg')] pb-20 pt-20">
       <div className="max-w-7xl mx-auto px-6">
          
          <PageHeader 
             title="Live Center"
             highlight="Simulation"
             badgeText="LIVE"
             badgeVariant="red"
             description="Real-time telemetry and race control feed"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
             {/* Left Column: Timing Tower */}
             <div>
                <LiveTimingTower simulate={true} />
             </div>

             {/* Right Column: Main Feed */}
             <div className="lg:col-span-2 space-y-6">
                
                {/* Telemetry Charts - NEW */}
                <LiveTelemetry />
                
                {/* Video Placeholder */}
                <div className="aspect-video bg-black rounded-xl border border-[var(--glass-border)] relative overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Video className="w-12 h-12 text-[var(--accent-cyan)] mx-auto mb-4 opacity-50" />
                            <p className="text-[var(--text-muted)] text-sm">Live Stream Not Available</p>
                            <p className="text-[var(--text-subtle)] text-xs mt-1">Waiting for broadcast feed...</p>
                        </div>
                    </div>
                    {/* Overlay */}
                    <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded text-xs font-bold text-white animate-pulse">
                        LIVE
                    </div>
                </div>

                {/* Commentary / Radio Feed */}
                <GlassCard className="h-[400px] flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setActiveTab('feed')}
                                className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'feed' ? 'border-[var(--accent-cyan)] text-white' : 'border-transparent text-[var(--text-muted)]'}`}
                            >
                                Race Control
                            </button>
                            <button 
                                onClick={() => setActiveTab('radio')}
                                className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'radio' ? 'border-[var(--accent-gold)] text-white' : 'border-transparent text-[var(--text-muted)]'}`}
                            >
                                Team Radio
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-subtle)] uppercase">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Connected
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                         {activeTab === 'feed' ? (
                            <>
                                <FeedItem time="Lap 42" text="Verstappen sets fastest lap (1:32.4)" type="fastest" />
                                <FeedItem time="Lap 41" text="Yellow Flag Sector 2 - Debris on track" type="warning" />
                                <FeedItem time="Lap 40" text="Hamilton pits from P2 (Mediums -> Hards)" type="drs" />
                                <FeedItem time="Lap 38" text="Norris overtakes Piastri for P3" type="overtake" />
                            </>
                         ) : (
                            <>
                                <RadioItem driver="VER" team="Red Bull" message="Tires feel good, keep pushing." />
                                <RadioItem driver="HAM" team="Mercedes" message="My tires are gone, Bono!" />
                                <RadioItem driver="NOR" team="McLaren" message="Gap to Leader?" />
                            </>
                         )}
                    </div>
                </GlassCard>

             </div>
          </div>
       </div>
    </div>
  );
}

const FeedItem = ({ time, text, type }: any) => {
    let color = "border-l-2 border-gray-600";
    if (type === 'fastest') color = "border-l-2 border-purple-500 bg-purple-500/10";
    if (type === 'warning') color = "border-l-2 border-yellow-500 bg-yellow-500/10";
    if (type === 'overtake') color = "border-l-2 border-[var(--success-green)] bg-green-500/10";

    return (
        <div className={`p-3 rounded ${color} flex gap-3 text-sm`}>
            <span className="font-mono font-bold text-[var(--text-secondary)] whitespace-nowrap">{time}</span>
            <span className="text-gray-300">{text}</span>
        </div>
    );
};

const RadioItem = ({ driver, team, message }: any) => (
    <div className="p-3 rounded bg-white/5 border border-white/5 flex gap-3 items-center">
        <div className="p-2 bg-white/10 rounded-full">
            <Mic2 className="w-4 h-4 text-white" />
        </div>
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-xs">{driver}</span>
                <span className="text-[10px] text-[var(--text-muted)] uppercase">{team}</span>
            </div>
            <p className="text-sm text-gray-300 italic">"{message}"</p>
        </div>
    </div>
);
