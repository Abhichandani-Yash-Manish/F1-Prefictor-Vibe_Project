"use client";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { TEAMS_2026, TEAM_COLORS } from "../lib/drivers";
import LaunchSequence from "../components/LaunchSequence";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import F1Button from "../components/ui/F1Button";
import AdUnit from "../components/AdUnit";
import CircuitGuide from "../components/CircuitGuide";

interface Race {
  id: number;
  name: string;
  circuit: string;
  race_time: string;
  quali_time?: string;
  fp1_time?: string;
  fp2_time?: string;
  fp3_time?: string;
  sprint_time?: string;
  is_sprint_weekend?: boolean;
}

// Map race names to country codes and regions
const getRaceCode = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("australian")) return "AUS";
  if (n.includes("bahrain")) return "BHR";
  if (n.includes("saudi")) return "SAU";
  if (n.includes("japanese")) return "JPN";
  if (n.includes("chinese")) return "CHN";
  if (n.includes("miami")) return "MIA";
  if (n.includes("emilia") || n.includes("imola")) return "EMI"; // Emilia Romagna
  if (n.includes("monaco")) return "MCO";
  if (n.includes("spanish") || n.includes("spain") || n.includes("catalunya")) return "ESP";
  if (n.includes("canadian") || n.includes("canada")) return "CAN";
  if (n.includes("austrian") || n.includes("austria")) return "AUT";
  if (n.includes("british") || n.includes("silverstone")) return "GBR";
  if (n.includes("hungarian") || n.includes("hungary")) return "HUN";
  if (n.includes("belgian") || n.includes("spa")) return "BEL";
  if (n.includes("dutch") || n.includes("netherlands")) return "NED";
  if (n.includes("italian") || n.includes("monza")) return "ITA";
  if (n.includes("madrid")) return "MAD";
  if (n.includes("azerbaijan") || n.includes("baku")) return "AZE";
  if (n.includes("singapore")) return "SGP";
  if (n.includes("united states") || n.includes("austin")) return "USA";
  if (n.includes("mexico")) return "MEX";
  if (n.includes("brazil") || n.includes("são paulo")) return "BRA";
  if (n.includes("las vegas")) return "LVS";
  if (n.includes("qatar")) return "QAT";
  if (n.includes("abu dhabi")) return "ABU";
  return "GP";
};

const getRaceRegion = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("bahrain") || n.includes("saudi") || n.includes("qatar") || n.includes("abu dhabi")) return "Middle East";
  if (n.includes("australian") || n.includes("japanese") || n.includes("chinese") || n.includes("singapore")) return "Asia Pacific";
  if (n.includes("monaco") || n.includes("emilia") || n.includes("spanish") || n.includes("british") || n.includes("belgian") || n.includes("dutch") || n.includes("hungarian") || n.includes("austrian") || n.includes("italian") || n.includes("madrid") || n.includes("azerbaijan") || n.includes("imola")) return "Europe";
  if (n.includes("miami") || n.includes("canadian") || n.includes("united states") || n.includes("austin") || n.includes("mexico") || n.includes("brazil") || n.includes("las vegas")) return "Americas";
  return "Other";
};

// Accurate Track SVG Paths (ViewBox 0 0 100 100 approx)
// Note: These are simplified but recognizable representations of the actual circuits.
const TRACK_PATHS: Record<string, string> = {
  // Albert Park (Australia) - fluid lake shape
  AUS: "M75,25 L85,30 L85,45 L70,55 L65,75 L55,75 L45,85 L30,80 L20,70 L25,60 L20,50 L30,30 L50,25 Z",
  
  // Bahrain - stop-start, tight corners
  BHR: "M80,20 L85,35 L70,40 L60,35 L50,45 L40,40 L35,50 L25,45 L20,30 L30,25 L45,20 L60,25 Z",
  
  // Jeddah (Saudi) - long, winding
  SAU: "M85,15 L90,80 L80,90 L70,80 L65,85 L55,80 L50,90 L40,80 L35,85 L25,80 L20,30 L30,20 L40,25 L50,20 Z",
  
  // Suzuka (Japan) - Figure 8
  JPN: "M30,70 L20,60 L30,50 L40,55 L50,45 L45,35 L55,25 L65,30 L70,25 L80,30 L85,45 L75,55 L65,50 L55,60 L60,70 L50,80 L40,75 Z",
  
  // Shanghai (China) - "Snail"
  CHN: "M30,30 C20,20 40,10 50,30 L80,30 L85,70 L70,80 L40,80 L30,60 L40,50 L35,40 Z",
  
  // Miami - Stadium section
  MIA: "M30,20 L70,20 L80,30 L80,50 L75,60 L80,80 L60,80 L50,70 L40,75 L30,70 L25,50 L30,40 Z",
  
  // Imola (Emilia Romagna)
  EMI: "M25,60 L35,50 L50,55 L70,45 L80,50 L85,70 L60,75 L50,70 L40,75 Z",

  // Monaco - Tight corners
  MCO: "M35,35 L50,30 L60,35 L70,30 L75,45 L80,50 L75,60 L60,65 L50,60 L45,65 L35,60 L30,50 Z",
  
  // Barcelona (Spain)
  ESP: "M25,70 L25,30 L40,25 L65,30 L80,25 L85,45 L75,60 L65,65 L50,60 L40,70 Z",
  
  // Montreal (Canada)
  CAN: "M20,60 L30,30 L50,25 L75,25 L85,40 L80,70 L65,75 L55,70 L40,75 Z",
  
  // Red Bull Ring (Austria) - Short
  AUT: "M30,60 L35,40 L60,30 L80,35 L85,55 L70,65 L45,70 Z",
  
  // Silverstone (UK)
  GBR: "M40,70 L30,60 L35,40 L50,30 L65,35 L75,30 L85,45 L80,60 L65,65 L55,60 L50,65 Z",
  
  // Hungaroring (Hungary)
  HUN: "M35,70 L30,50 L40,30 L55,35 L65,30 L80,35 L80,55 L70,60 L60,55 L50,65 Z",
  
  // Spa (Belgium) - Long
  BEL: "M30,75 L25,50 L40,35 L55,30 L70,25 L85,35 L80,55 L65,60 L55,55 L45,65 Z",
  
  // Zandvoort (Netherlands)
  NED: "M35,60 L30,40 L45,30 L60,35 L75,30 L80,50 L70,65 L55,60 L45,65 Z",
  
  // Monza (Italy) - High speed
  ITA: "M30,70 L35,30 L65,25 L80,30 L85,50 L75,70 L55,65 L45,70 Z",
  
  // Madrid (New) - Estimated
  MAD: "M30,40 L70,30 L80,50 L70,70 L50,75 L40,70 L30,60 Z",
  
  // Baku (Azerbaijan) - Castle
  AZE: "M20,60 L85,60 L85,40 L75,30 L65,40 L55,35 L45,40 L35,35 L25,40 L20,50 Z",
  
  // Singapore - Marina Bay
  SGP: "M25,65 L25,35 L40,30 L60,35 L75,30 L80,50 L75,70 L60,75 L50,70 L40,75 Z",
  
  // Austin (USA)
  USA: "M30,75 L25,50 L35,30 L55,35 L70,30 L80,50 L75,70 L60,65 L50,75 Z",
  
  // Mexico City
  MEX: "M30,60 L25,40 L40,30 L70,30 L80,50 L75,70 L60,65 L50,75 Z",
  
  // Interlagos (Brazil)
  BRA: "M35,70 L30,50 L40,40 L55,35 L75,40 L80,60 L65,70 L50,65 Z",
  
  // Las Vegas - Strip
  LVS: "M20,65 L25,30 L45,30 L50,45 L70,45 L75,30 L85,30 L85,65 L75,75 L30,75 Z",
  
  // Lusail (Qatar)
  QAT: "M30,60 L35,30 L55,25 L75,30 L80,55 L70,70 L50,75 Z",
  
  // Yas Marina (Abu Dhabi)
  ABU: "M30,70 L25,45 L40,30 L70,30 L80,50 L75,75 L60,70 L50,75 Z",
  
  // Fallback
  GP: "M30,50 L50,25 L70,50 L50,75 Z"
};

export default function CalendarPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'timeline' | 'teams'>('timeline');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const timelineRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchRaces = async () => {
      const { data } = await supabase
        .from("races")
        .select("*")
        .order("race_time", { ascending: true });
      if (data) setRaces(data);
      setLoading(false);
    };
    fetchRaces();
  }, []);

  const nextRace = races.find(r => new Date(r.race_time) > new Date());
  const pastRaces = races.filter(r => new Date(r.race_time) < new Date());
  const upcomingRaces = races.filter(r => new Date(r.race_time) >= new Date());
  const nextRaceIndex = nextRace ? races.findIndex(r => r.id === nextRace.id) : 0;
  const seasonProgress = races.length > 0 ? Math.round((pastRaces.length / races.length) * 100) : 0;
  
  const regions = ['All', 'Europe', 'Middle East', 'Americas', 'Asia Pacific'];
  const filteredRaces = regionFilter === 'All' 
    ? races 
    : races.filter(r => getRaceRegion(r.name) === regionFilter);
  
  // Auto-scroll to next race
  useEffect(() => {
    if (!loading && timelineRef.current && nextRace) {
      const nextRaceCard = document.getElementById(`race-${nextRace.id}`);
      if (nextRaceCard) {
        nextRaceCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [loading, nextRace]);

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      {/* Racing stripe */}
      <div className="fixed top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--accent-cyan)] via-[var(--accent-cyan)]/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">

        {/* === HEADER === */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <PageHeader 
                title="Race Calendar" 
                highlight="2026" 
                badgeText="Season Overview" 
                badgeVariant="cyan"
                description={`${races.length || "?"} Grands Prix • ${pastRaces.length} Completed • ${upcomingRaces.length} Remaining`}
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 p-1 bg-[var(--bg-onyx)] rounded-xl border border-[var(--glass-border)]">
              <button
                onClick={() => setView('timeline')}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  view === 'timeline' 
                    ? 'bg-[var(--accent-gold)] text-black' 
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                📅 Races
              </button>
              <button
                onClick={() => setView('teams')}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  view === 'teams' 
                    ? 'bg-[var(--accent-gold)] text-black' 
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                🏎️ Teams & Drivers
              </button>
            </div>
          </div>

          {/* Season Progress Bar */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Season Progress</span>
                {nextRace && (
                  <span className="badge badge-gold text-xs">Round {nextRaceIndex + 1} Next</span>
                )}
              </div>
              <span className="text-lg font-bold text-[var(--accent-cyan)] font-mono">{seasonProgress}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-graphite)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-gold)] to-[var(--f1-red)] rounded-full transition-all duration-1000"
                style={{ width: `${seasonProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[var(--text-subtle)]">
              <span>Australia</span>
              <span>Abu Dhabi</span>
            </div>
          </GlassCard>
        </div>

        {loading ? (
           <div className="py-20">
              <LoadingSpinner message="Loading Calendar..." />
           </div>
        ) : (
          <>
            {/* === FEATURED NEXT RACE === */}
            {nextRace && view === 'timeline' && (
              <div className="mb-10">
                <GlassCard variant="gold" className="p-8 md:p-10 relative overflow-hidden">
                  {/* Racing stripe pattern */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--f1-red)] via-[var(--accent-gold)] to-[var(--accent-cyan)]" />
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="gold" icon="⭐">Next Race</Badge>
                        <Badge variant="cyan">Round {nextRaceIndex + 1}</Badge>
                        {nextRace.is_sprint_weekend && <Badge variant="red">Sprint Weekend</Badge>}
                      </div>
                      
                      {/* LARGE GP NAME */}
                      <h2 className="text-4xl md:text-6xl font-black text-white mb-1 tracking-tight">
                        {nextRace.name.replace(' Grand Prix', '')}
                      </h2>
                      <div className="text-xl md:text-2xl font-semibold text-[var(--accent-gold)] mb-6">
                        GRAND PRIX
                      </div>
                      
                      {/* Circuit */}
                      <div className="flex items-center gap-2 text-[var(--text-muted)] mb-6">
                        <span className="text-[var(--f1-red)]">📍</span>
                        <span>{nextRace.circuit}</span>
                        <CircuitGuide circuitName={nextRace.circuit} />
                      </div>

                      {/* Countdown */}
                      {nextRace.quali_time && (
                        <div className="mb-8">
                          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Predictions Close In</div>
                          <LaunchSequence targetTime={nextRace.quali_time} label="" />
                        </div>
                      )}

                      {/* CTA */}
                      <F1Button 
                        href={`/predict/${nextRace.id}`}
                        variant="primary"
                        className="hover:scale-105 shadow-[var(--shadow-glow-red)] text-lg px-8 py-4"
                        icon="🏎️"
                      >
                        MAKE PREDICTIONS →
                      </F1Button>
                    </div>

                    {/* Track Outline */}
                    <div className="hidden lg:block">
                      <div className="w-48 h-48 relative">
                        <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
                          <path 
                            d={TRACK_PATHS[getRaceCode(nextRace.name)] || TRACK_PATHS.GP}
                            fill="none"
                            stroke="var(--accent-gold)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl font-black text-[var(--accent-gold)]/30 font-mono">
                            {getRaceCode(nextRace.name)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* === TIMELINE VIEW === */}
            {view === 'timeline' && (
              <div>
                {/* Region Filter Tabs */}
                <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                  <span className="text-xs text-[var(--text-subtle)] uppercase tracking-wider whitespace-nowrap">Filter:</span>
                  {regions.map(region => (
                    <button
                      key={region}
                      onClick={() => setRegionFilter(region)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        regionFilter === region
                          ? 'bg-[var(--accent-cyan)] text-black'
                          : 'bg-[var(--bg-onyx)] text-[var(--text-muted)] hover:text-white border border-[var(--glass-border)]'
                      }`}
                    >
                      {region} {region !== 'All' && `(${races.filter(r => getRaceRegion(r.name) === region).length})`}
                    </button>
                  ))}
                </div>

                {/* Race Cards Grid */}
                <div 
                  ref={timelineRef}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {filteredRaces.map((race, index) => {
                    const isPast = new Date(race.race_time) < new Date();
                    const isNext = nextRace?.id === race.id;
                    const raceCode = getRaceCode(race.name);
                    const raceIndex = races.findIndex(r => r.id === race.id) + 1;
                    
                    return (
                      <Link
                        key={race.id}
                        id={`race-${race.id}`}
                        href={isPast ? `/submissions/${race.id}` : `/predict/${race.id}`}
                        className={`group relative p-6 rounded-xl border transition-all duration-300 overflow-hidden
                          ${isNext 
                            ? 'border-[var(--accent-gold)] bg-[var(--accent-gold-dim)] shadow-[var(--shadow-glow-gold)]' 
                            : isPast 
                            ? 'border-[var(--glass-border)] bg-[var(--bg-onyx)] opacity-60 hover:opacity-80' 
                            : 'border-[var(--glass-border)] bg-[var(--bg-onyx)] hover:border-[var(--accent-cyan)] hover:shadow-[var(--shadow-glow-cyan)]'
                          }
                        `}
                      >
                        {/* Round Number */}
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs font-mono ${isNext ? 'text-[var(--accent-gold)]' : 'text-[var(--text-subtle)]'}`}>
                            R{raceIndex.toString().padStart(2, '0')}
                          </span>
                        </div>

                        {/* Status Badge */}
                        {isNext && (
                          <div className="absolute top-3 left-3">
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--accent-gold)] text-black text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                              NEXT
                            </span>
                          </div>
                        )}
                        {isPast && (
                          <div className="absolute top-3 left-3">
                            <span className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
                              ✓ Complete
                            </span>
                          </div>
                        )}

                        {/* Race Code */}
                        <div className={`text-4xl font-black tracking-wide mb-3 mt-6 font-mono
                          ${isNext ? 'text-[var(--accent-gold)]' : isPast ? 'text-[var(--text-subtle)]' : 'text-white'}
                        `}>
                          {raceCode}
                        </div>

                        {/* Track Mini */}
                        <div className="h-16 mb-3">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <path 
                              d={TRACK_PATHS[raceCode] || TRACK_PATHS.GP}
                              fill="none"
                              stroke={isNext ? 'var(--accent-gold)' : isPast ? 'var(--text-subtle)' : 'var(--accent-cyan)'}
                              strokeWidth="2"
                              strokeLinecap="round"
                              className="opacity-50 group-hover:opacity-100 transition-opacity"
                            />
                          </svg>
                        </div>

                        {/* Race Name */}
                        <div className={`text-sm font-bold mb-1 truncate ${isNext ? 'text-white' : isPast ? 'text-[var(--text-muted)]' : 'text-white'}`}>
                          {race.name}
                        </div>
                        
                        {/* Circuit */}
                        <div className="text-xs text-[var(--text-subtle)] truncate mb-3">
                          {race.circuit}
                          <CircuitGuide circuitName={race.circuit} />
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2">
                          {race.is_sprint_weekend && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[var(--f1-red)]/20 text-[var(--f1-red)]">Sprint</span>
                          )}
                          <span className="text-xs text-[var(--text-subtle)]">
                            {new Date(race.race_time).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* === AD PLACEMENT === */}
            <div className="my-8">
              <AdUnit 
                slot="calendar_grid"
                format="horizontal"
                style={{ minHeight: "90px" }}
                label="Sponsored"
              />
            </div>

            {/* === TEAMS VIEW === */}
            {view === 'teams' && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="badge badge-gold">2026 Grid</span>
                  <span className="text-sm text-[var(--text-muted)]">11 Teams • 22 Drivers</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Object.entries(TEAMS_2026).map(([team, drivers]) => (
                    <GlassCard 
                      key={team}
                      className="group relative overflow-hidden transition-all hover:border-[var(--glass-border-light)]"
                    >
                      {/* Team color accent */}
                      <div 
                        className="absolute top-0 left-0 w-full h-1 opacity-80"
                        style={{ backgroundColor: TEAM_COLORS[team] || '#666' }}
                      />
                      
                      <div className="p-6">
                        {/* Team Header */}
                        <div className="flex items-center gap-3 mb-6">
                          <div 
                            className="w-1 h-10 rounded-full"
                            style={{ backgroundColor: TEAM_COLORS[team] || '#666' }}
                          />
                          <div>
                            <h4 className="font-bold text-white">{team}</h4>
                            <p className="text-xs text-[var(--text-muted)]">2026 Season</p>
                          </div>
                        </div>
                        
                        {/* Drivers */}
                        <div className="space-y-3">
                          {drivers.map((d) => (
                            <div 
                              key={d.number}
                              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-graphite)] border border-[var(--glass-border)]"
                            >
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                                style={{ backgroundColor: TEAM_COLORS[team] || '#666' }}
                              >
                                {d.number}
                              </div>
                              <span className="text-sm text-white font-medium">{d.driver}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* === STATS FOOTER === */}
            <div className="mt-16 pt-8 border-t border-[var(--glass-border)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: races.length, label: "Total Races", color: "var(--accent-cyan)" },
                  { value: upcomingRaces.length, label: "Remaining", color: "var(--accent-gold)" },
                  { value: races.filter(r => r.is_sprint_weekend).length, label: "Sprint Weekends", color: "var(--f1-red)" },
                  { value: 11, label: "Teams", color: "white" },
                ].map((stat) => (
                  <GlassCard key={stat.label} className="p-4 text-center">
                    <div className="text-3xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">{stat.label}</div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
