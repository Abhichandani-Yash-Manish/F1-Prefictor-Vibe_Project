"use client";

import React, { useState, useEffect } from "react";
import { Info, MapPin, Wind, Trophy, AlertTriangle, CloudSun } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface CircuitData {
  id: number;
  name: string;
  country: string;
  length_km: number;
  turns: number;
  drs_zones: number;
  lap_record_time: string;
  lap_record_driver: string;
  lap_record_year: number;
  overtaking_difficulty: string;
  tire_degradation: string;
  weather_probability: any; // JSONb
}

interface CircuitGuideProps {
  circuitName: string;
}

export default function CircuitGuide({ circuitName }: CircuitGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<CircuitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchCircuitData = async () => {
    if (data) return; // Already loaded
    setLoading(true);
    try {
      // Fetch all circuits and find match since API uses ID
      // Optimization: In real app, races should have circuit_id foreign key
      const res = await fetch("/api/circuits");
      if (res.ok) {
        const circuits: CircuitData[] = await res.json();
        const match = circuits.find(c => 
            c.name.includes(circuitName) || circuitName.includes(c.name)
        );
        if (match) {
            setData(match);
        } else {
            setError(true);
        }
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen && !data) fetchCircuitData();
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-2 w-full z-20 relative">
      <button 
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[var(--accent-cyan)] hover:text-white transition bg-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)]/20 px-2 py-1 rounded"
      >
        <Info className="w-3 h-3" />
        {isOpen ? "Close Intel" : "Track Intel"}
      </button>

      {/* Expanded Panel */}
      {isOpen && (
        <div 
            className="absolute top-full left-0 mt-2 w-full bg-[#0a0a0c] border border-[var(--glass-border)] rounded-lg shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} // Prevent card click
        >
            {loading ? (
                <div className="flex justify-center p-4">
                    <LoadingSpinner />
                </div>
            ) : error || !data ? (
                <div className="text-center text-xs text-gray-500 py-2">
                    Circuit data unavailable for {circuitName}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-white/10 pb-2">
                        <div>
                            <h4 className="font-bold text-white text-sm">{data.name}</h4>
                            <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                                <MapPin className="w-3 h-3" /> {data.country}
                            </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-black ${
                            data.overtaking_difficulty === 'Hard' ? 'bg-red-500' : 
                            data.overtaking_difficulty === 'Medium' ? 'bg-yellow-500' : 
                            'bg-green-500'
                        }`}>
                            {data.overtaking_difficulty} Pass
                        </div>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-2 rounded">
                            <p className="text-[10px] text-gray-400">Lap Record</p>
                            <p className="text-xs font-mono font-bold text-[var(--accent-gold)]">{data.lap_record_time}</p>
                            <p className="text-[10px] text-gray-500 truncate">{data.lap_record_driver} ({data.lap_record_year})</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded">
                            <p className="text-[10px] text-gray-400">Features</p>
                            <div className="flex gap-2 mt-1">
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                    <Wind className="w-3 h-3 text-[var(--accent-cyan)]" /> {data.drs_zones} DRS
                                </span>
                                <span className="text-xs font-bold text-white">
                                    {data.turns} Turns
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex justify-between text-[10px] text-gray-400 pt-2 border-t border-white/10">
                         <span className="flex items-center gap-1">
                            <TireIcon className="w-3 h-3" /> {data.tire_degradation} Wear
                         </span>
                         <span className="flex items-center gap-1">
                             <CloudSun className="w-3 h-3" /> {data.weather_probability?.rain_probability || 0}% Rain
                         </span>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

const TireIcon = ({ className }: {className?: string}) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="M12 8a4 4 0 0 0 0 8" />
    </svg>
);
