"use client";

import Link from "next/link";
import { Zap, Radio, Activity } from "lucide-react";

export default function LiveSessionBanner() {
  return (
    <div className="w-full bg-[var(--f1-red)]/90 backdrop-blur-md border-b border-red-500/50 sticky top-[64px] z-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                <span className="font-bold text-white text-sm uppercase tracking-widest">Live Session</span>
                <span className="text-[10px] md:text-xs text-white/80 font-mono hidden md:block">| BAHRAIN GP • LAP 42/57</span>
            </div>
         </div>

         <Link 
            href="/live"
            className="group flex items-center gap-2 px-4 py-1.5 bg-black/30 hover:bg-black/50 rounded text-xs font-bold text-white transition-all border border-white/10 hover:border-white/30"
         >
            <Activity className="w-3 h-3 group-hover:text-[var(--accent-cyan)] transition-colors" />
            OPEN TELEMETRY
            <span className="group-hover:translate-x-1 transition-transform">→</span>
         </Link>
      </div>
      
      {/* Scanline effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
    </div>
  );
}
