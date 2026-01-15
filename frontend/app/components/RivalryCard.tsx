"use client";
import { useState } from "react";
import Link from "next/link";
import { getDriverName, getDriverNumber, TEAM_COLORS, getDriverTeam } from "../lib/drivers";

interface RivalryCardProps {
  player1: {
    id?: string;
    name: string;
    driver: string;
    points: number;
    avatar?: string;
  };
  player2?: {
    id?: string;
    name: string;
    driver: string;
    points: number;
    avatar?: string;
  };
  races: number;
  onChallenge?: () => void;
}

export default function RivalryCard({ player1, player2, races, onChallenge }: RivalryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Fallback if player2 is missing or same as player1 (e.g. only 1 user in system)
  const isSolo = !player2 || player1.name === player2.name;
  
  const p2 = isSolo ? {
    name: "THE GRID",
    driver: "",
    points: Math.floor(player1.points * 0.9), // Mock average
    avatar: ""
  } : player2;

  const pointDelta = player1.points - p2.points;
  // Calculate percentage safely
  const total = player1.points + p2.points;
  // If both are 0, default to 50%
  const p1Percentage = total === 0 ? 50 : (player1.points / total) * 100;
  
  const team1 = getDriverTeam(player1.driver);
  const team2 = isSolo ? null : getDriverTeam(p2.driver);
  
  const color1 = team1 ? TEAM_COLORS[team1] : "#45A29E"; // Default Cyan
  const color2 = team2 ? TEAM_COLORS[team2] : (isSolo ? "#F7B731" : "#C3073F"); // Amber for Grid, Red for Rival

  return (
    <div 
      className="relative overflow-hidden rounded-2xl group cursor-pointer transition-transform duration-300 hover:scale-[1.01] border border-white/5 hover:border-[var(--accent-cyan)]/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onChallenge}
    >
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30"
          style={{
            background: `linear-gradient(115deg, ${color1} 0%, ${color1} 45%, ${color2} 55%, ${color2} 100%)`
          }}
        />
        <div className="absolute inset-0 bg-[var(--bg-carbon)]/90 backdrop-blur-sm" />
        
        {/* Speed Lines Pattern - CSS based for production reliability */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-overlay" 
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            backgroundSize: '8px 100%'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 md:p-8">
        
        {/* Header Badge */}
        <div className="flex justify-center mb-8">
          <div className="px-6 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-orbitron font-bold tracking-[0.2em] text-[var(--text-silver)] uppercase">
              {races} RACE RIVALRY
            </span>
          </div>
        </div>

        {/* Players Face-off */}
        <div className="flex items-end justify-between gap-4 mb-8">
          
          {/* PLAYER 1 (LEFT) */}
          <div className="flex-1 text-left relative">
            {player1.id ? (
              <Link href={`/profile/${player1.id}`} className="relative z-10 block hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}>
                <div 
                  className="w-20 h-20 mb-4 rounded-2xl flex items-center justify-center border-b-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                  style={{ 
                    backgroundColor: `${color1}`,
                    borderColor: 'rgba(255,255,255,0.2)',
                    boxShadow: `0 0 20px -5px ${color1}40`
                  }}
                >
                  <span className="font-orbitron text-3xl font-black text-white mix-blend-overlay">
                    {getDriverNumber(getDriverName(player1.driver)) || "P1"}
                  </span>
                </div>
                <h3 className="font-orbitron font-black text-2xl text-white leading-none mb-1 tracking-tight hover:text-[var(--accent-cyan)] transition-colors">
                  {player1.name.toUpperCase()}
                </h3>
                <p className="font-mono text-xs font-bold opacity-60 uppercase tracking-wider" style={{ color: color1 }}>
                  {getDriverName(player1.driver) || "NO DRIVER"}
                </p>
              </Link>
            ) : (
                <div className="relative z-10">
                  {/* Previous Non-Link Content */}
                   <div 
                    className="w-20 h-20 mb-4 rounded-2xl flex items-center justify-center border-b-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform group-hover:-translate-y-2 duration-300"
                    style={{ 
                      backgroundColor: `${color1}`,
                      borderColor: 'rgba(255,255,255,0.2)',
                      boxShadow: `0 0 20px -5px ${color1}40`
                    }}
                  >
                    <span className="font-orbitron text-3xl font-black text-white mix-blend-overlay">
                      {getDriverNumber(getDriverName(player1.driver)) || "P1"}
                    </span>
                  </div>
                  <h3 className="font-orbitron font-black text-2xl text-white leading-none mb-1 tracking-tight">
                    {player1.name.toUpperCase()}
                  </h3>
                  <p className="font-mono text-xs font-bold opacity-60 uppercase tracking-wider" style={{ color: color1 }}>
                    {getDriverName(player1.driver) || "NO DRIVER"}
                  </p>
                </div>
            )}
            
            {/* Background Big Number */}
             <div className="absolute top-0 right-10 text-9xl font-black opacity-[0.03] select-none pointer-events-none" style={{ color: color1 }}>
               1
             </div>
          </div>

          {/* VS Divider */}
          <div className="pb-8 text-[var(--text-muted)] opacity-20 font-black italic text-4xl select-none">
            VS
          </div>

          {/* PLAYER 2 (RIGHT) */}
           <div className="flex-1 text-right relative">
            {p2.id && !isSolo ? (
                <Link href={`/profile/${p2.id}`} className="relative z-10 flex flex-col items-end hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}>
                    <div 
                        className="w-20 h-20 mb-4 rounded-2xl flex items-center justify-center border-b-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                        style={{ 
                        backgroundColor: `${color2}`,
                        borderColor: 'rgba(255,255,255,0.2)',
                        boxShadow: `0 0 20px -5px ${color2}40`
                        }}
                    >
                        <span className="font-orbitron text-3xl font-black text-white mix-blend-overlay">
                        {isSolo ? "AI" : (getDriverNumber(getDriverName(p2.driver)) || "P2")}
                        </span>
                    </div>
                    <h3 className="font-orbitron font-black text-2xl text-white leading-none mb-1 tracking-tight hover:text-[var(--accent-gold)] transition-colors">
                        {p2.name.toUpperCase()}
                    </h3>
                    <p className="font-mono text-xs font-bold opacity-60 uppercase tracking-wider" style={{ color: color2 }}>
                        {isSolo ? "AVERAGE SCORE" : (getDriverName(p2.driver) || "NO DRIVER")}
                    </p>
                </Link>
            ) : (
                <div className="relative z-10 flex flex-col items-end">
                    {/* Previous Non-Link Content */}
                    <div 
                        className="w-20 h-20 mb-4 rounded-2xl flex items-center justify-center border-b-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform group-hover:-translate-y-2 duration-300 delay-75"
                        style={{ 
                        backgroundColor: `${color2}`,
                        borderColor: 'rgba(255,255,255,0.2)',
                        boxShadow: `0 0 20px -5px ${color2}40`
                        }}
                    >
                        <span className="font-orbitron text-3xl font-black text-white mix-blend-overlay">
                        {isSolo ? "AI" : (getDriverNumber(getDriverName(p2.driver)) || "P2")}
                        </span>
                    </div>
                    <h3 className="font-orbitron font-black text-2xl text-white leading-none mb-1 tracking-tight">
                        {p2.name.toUpperCase()}
                    </h3>
                    <p className="font-mono text-xs font-bold opacity-60 uppercase tracking-wider" style={{ color: color2 }}>
                        {isSolo ? "AVERAGE SCORE" : (getDriverName(p2.driver) || "NO DRIVER")}
                    </p>
                </div>
            )}
             {/* Background Big Number */}
             <div className="absolute top-0 left-10 text-9xl font-black opacity-[0.03] select-none pointer-events-none" style={{ color: color2 }}>
               2
             </div>
          </div>

        </div>

        {/* Progress Bar / Stats */}
        <div className="relative pt-6 border-t border-white/5">
           <div className="flex justify-between mb-3 text-sm font-bold font-mono">
             <span style={{ color: color1 }}>{player1.points} PTS</span>
             <span className={`${pointDelta > 0 ? 'text-[var(--success-green)]' : 'text-[var(--alert-red)]'}`}>
               {pointDelta > 0 ? '+' : ''}{pointDelta}
             </span>
             <span style={{ color: color2 }}>{p2.points} PTS</span>
           </div>
           
           <div className="h-4 bg-black/50 rounded-full p-1 relative overflow-hidden backdrop-blur-sm shadow-inner">
             {/* Bar layer 1 */}
             <div className="absolute top-1 bottom-1 left-1 rounded-l-full transition-all duration-700 ease-out"
               style={{ width: `calc(${p1Percentage}% - 4px)`, background: color1 }} />
              
             {/* Bar layer 2 */}
             <div className="absolute top-1 bottom-1 right-1 rounded-r-full transition-all duration-700 ease-out"
               style={{ width: `calc(${100 - p1Percentage}% - 4px)`, background: color2 }} />

             {/* Lightning Divider */}
             <div className="absolute top-0 bottom-0 w-8 -ml-4 bg-white/10 skew-x-[-20deg] backdrop-filter backdrop-brightness-150 z-20"
               style={{ left: `${p1Percentage}%` }} />
           </div>
        </div>

      </div>

       {/* Hover Overlay CTA */}
       <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button className="px-8 py-4 bg-[var(--accent-cyan)] text-black font-orbitron font-black text-lg skew-x-[-10deg] hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(69,162,158,0.4)]">
            <span className="block skew-x-[10deg]">VIEW FULL RIVALRY</span>
          </button>
       </div>

    </div>
  );
}
