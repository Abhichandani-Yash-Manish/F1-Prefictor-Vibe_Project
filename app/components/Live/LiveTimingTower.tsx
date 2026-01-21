"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAM_COLORS } from "../../lib/drivers";
import { Flag, Timer, Zap } from "lucide-react";

interface DriverLiveStats {
  position: number;
  driver_code: string; // VER, HAM
  team: string; // Red Bull Racing
  gap: string; // "+1.2s" or "Interval" for P2+
  interval: string;
  last_lap: string;
  sector1: 'purple' | 'green' | 'yellow';
  sector2: 'purple' | 'green' | 'yellow';
  sector3: 'purple' | 'green' | 'yellow';
  tire: 'S' | 'M' | 'H' | 'I' | 'W';
}

interface LiveTimingTowerProps {
  initialData?: DriverLiveStats[];
  simulate?: boolean;
}

const MOCK_START_GRID: DriverLiveStats[] = [
  { position: 1, driver_code: "VER", team: "Red Bull Racing", gap: "Leader", interval: "-", last_lap: "1:32.4", sector1: "purple", sector2: "green", sector3: "green", tire: "M" },
  { position: 2, driver_code: "HAM", team: "Ferrari", gap: "+1.2s", interval: "+1.2s", last_lap: "1:32.6", sector1: "green", sector2: "yellow", sector3: "purple", tire: "M" },
  { position: 3, driver_code: "NOR", team: "McLaren", gap: "+2.5s", interval: "+1.3s", last_lap: "1:32.5", sector1: "green", sector2: "green", sector3: "green", tire: "H" },
  { position: 4, driver_code: "PIA", team: "McLaren", gap: "+4.1s", interval: "+1.6s", last_lap: "1:33.0", sector1: "yellow", sector2: "green", sector3: "yellow", tire: "H" },
  { position: 5, driver_code: "LEC", team: "Ferrari", gap: "+5.2s", interval: "+1.1s", last_lap: "1:32.9", sector1: "green", sector2: "green", sector3: "green", tire: "M" },
  { position: 6, driver_code: "RUS", team: "Mercedes", gap: "+8.9s", interval: "+3.7s", last_lap: "1:33.5", sector1: "yellow", sector2: "yellow", sector3: "green", tire: "H" },
  { position: 7, driver_code: "ALO", team: "Aston Martin", gap: "+12.1s", interval: "+3.2s", last_lap: "1:34.1", sector1: "yellow", sector2: "yellow", sector3: "yellow", tire: "S" },
  { position: 8, driver_code: "ALB", team: "Williams", gap: "+15.4s", interval: "+3.3s", last_lap: "1:34.2", sector1: "green", sector2: "yellow", sector3: "green", tire: "M" },
  // ... can add more
];

export default function LiveTimingTower({ initialData, simulate = false }: LiveTimingTowerProps) {
  const [drivers, setDrivers] = useState<DriverLiveStats[]>(initialData || MOCK_START_GRID);
  const [lap, setLap] = useState(42);
  const [totalLaps] = useState(57);

  // Simulation Logic
  useEffect(() => {
    if (!simulate) return;

    const interval = setInterval(() => {
      setDrivers(prev => {
        // Randomly swap positions for demo
        const newOrder = [...prev];
        if (Math.random() > 0.7) {
           // Swap P2/P3 or P4/P5
           const idx = Math.floor(Math.random() * (newOrder.length - 2)) + 1;
           [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
           
           // Update position numbers
           newOrder.forEach((d, i) => d.position = i + 1);
        }
        
        // Randomly update sectors color
        return newOrder.map(d => ({
            ...d,
            sector1: Math.random() > 0.8 ? 'purple' : Math.random() > 0.5 ? 'green' : 'yellow',
            last_lap: `1:3${Math.floor(Math.random()*4)}.${Math.floor(Math.random()*9)}`,
            gap: d.position === 1 ? 'Leader' : `+${(d.position * 1.5 + Math.random()).toFixed(1)}s` 
        })) as DriverLiveStats[];
      });
      
      // Lap counter
      if (Math.random() > 0.95) setLap(l => Math.min(l + 1, totalLaps));

    }, 3000);

    return () => clearInterval(interval);
  }, [simulate, totalLaps]);

  const getSectorColor = (color: string) => {
    switch(color) {
        case 'purple': return 'bg-purple-500';
        case 'green': return 'bg-[var(--success-green)]';
        default: return 'bg-[var(--accent-gold)]';
    }
  };

  const getTireColor = (tire: string) => {
    switch(tire) {
        case 'S': return 'text-red-500 border-red-500';
        case 'M': return 'text-yellow-400 border-yellow-400';
        case 'H': return 'text-white border-white';
        case 'I': return 'text-green-500 border-green-500';
        case 'W': return 'text-blue-500 border-blue-500';
        default: return 'text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="bg-[#0B0C10] border border-[var(--glass-border)] rounded-xl overflow-hidden max-w-md shadow-2xl">
        {/* Header */}
        <div className="bg-[#1F2833] p-3 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-2">
                <span className="animate-pulse w-2 h-2 rounded-full bg-[var(--f1-red)]"></span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Timing</h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-white font-bold">
                <Flag className="w-4 h-4 text-white" />
                <span>{lap}/{totalLaps}</span>
            </div>
        </div>

        {/* Legend / Columns Header */}
        <div className="grid grid-cols-12 gap-1 px-4 py-2 bg-[#0B0C10] text-[10px] text-[var(--text-muted)] uppercase font-bold border-b border-white/5">
            <div className="col-span-1 text-center">Pos</div>
            <div className="col-span-1"></div>
            <div className="col-span-3">Driver</div>
            <div className="col-span-3 text-right">Gap</div>
            <div className="col-span-2 text-center">Tire</div>
            <div className="col-span-2 text-center">Sectors</div>
        </div>

        {/* List */}
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-2 space-y-1">
            <AnimatePresence>
                {drivers.map((driver) => (
                    <motion.div
                        key={driver.driver_code}
                        layoutId={driver.driver_code}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-12 gap-1 items-center bg-[#1F2833]/50 p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                        {/* Pos */}
                        <div className="col-span-1 text-center font-bold text-white font-mono">
                            {driver.position}
                        </div>
                        
                        {/* Team Color Stripe */}
                        <div className="col-span-1 flex justify-center">
                            <div 
                                className="w-1 h-6 rounded-full"
                                style={{ backgroundColor: TEAM_COLORS[driver.team] || '#666' }}
                            />
                        </div>

                        {/* Name */}
                        <div className="col-span-3 font-bold text-white text-sm tracking-wide">
                            {driver.driver_code}
                        </div>

                        {/* Gap */}
                        <div className="col-span-3 text-right font-mono text-xs text-[var(--text-secondary)]">
                            {driver.gap}
                        </div>

                        {/* Tire */}
                        <div className="col-span-2 flex justify-center">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${getTireColor(driver.tire)}`}>
                                {driver.tire}
                            </div>
                        </div>

                        {/* Sectors */}
                        <div className="col-span-2 flex gap-0.5 justify-center">
                            <div className={`w-2 h-2 rounded-sm ${getSectorColor(driver.sector1)}`} />
                            <div className={`w-2 h-2 rounded-sm ${getSectorColor(driver.sector2)}`} />
                            <div className={`w-2 h-2 rounded-sm ${getSectorColor(driver.sector3)}`} />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    </div>
  );
}
