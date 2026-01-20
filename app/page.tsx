"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { config } from "../lib/config";
import TelemetryLoader from "./components/TelemetryLoader";
import LoadingSpinner from "./components/LoadingSpinner";
import GlassCard from "./components/ui/GlassCard";
import F1Button from "./components/ui/F1Button";
import Badge from "./components/ui/Badge";
import LaunchSequence from "./components/LaunchSequence";

interface Race {
  id: number;
  name: string;
  circuit: string;
  race_time: string;
  quali_time?: string;
  is_sprint?: boolean;
}

export default function Home() {
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [lastResults, setLastResults] = useState<any[]>([]);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [userStandings, setUserStandings] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const getRaceWeekendDates = (raceDateIso: string) => {
    if (!raceDateIso) return "TBD";
    const raceDate = new Date(raceDateIso);
    const sunday = new Date(raceDate);
    const friday = new Date(sunday);
    friday.setDate(sunday.getDate() - 2);
    const start = friday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
    const end = sunday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
    return `${start} - ${end}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Critical Data: Next Race (Supabase - Fast)
        const today = new Date().toISOString();
        const { data } = await supabase
          .from("races")
          .select("*")
          .gt("race_time", today)
          .order("race_time", { ascending: true })
          .limit(1);

        if (data && data.length > 0) {
          setNextRace(data[0]);
        } else {
          // Fallback to first race of season
          const { data: allRaces } = await supabase
            .from("races")
            .select("*")
            .order("race_time", { ascending: true })
            .limit(1);
          if (allRaces && allRaces.length > 0) {
            setNextRace(allRaces[0]);
          }
        }
      } catch (err) {
        console.error("Critical Data Error:", err);
      } finally {
        setLoading(false);
      }

      // 2. Secondary Data: Stats & Standings (Parallel)
      const fetchSecondaryData = async () => {
        const fetchResults = async () => {
            try {
                const res = await fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json");
                const data = await res.json();
                if (data.MRData.RaceTable.Races.length > 0) {
                  setLastResults(data.MRData.RaceTable.Races[0].Results.slice(0, 3));
                }
            } catch (e) { console.error("Results Error", e); }
        };

        const fetchDrivers = async () => {
            try {
                const res = await fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json");
                const data = await res.json();
                if (data.MRData.StandingsTable.StandingsLists.length > 0) {
                  setTopDrivers(data.MRData.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 5));
                }
            } catch (e) { console.error("Drivers Error", e); }
        };

        const fetchUserStandings = async () => {
            try {
                const res = await fetch(`${config.apiUrl}/standings`);
                if (res.ok) {
                  const data = await res.json();
                  setUserStandings(data);
                }
            } catch (e) { console.error("User Standings Error", e); }
        };

        await Promise.allSettled([fetchResults(), fetchDrivers(), fetchUserStandings()]);
      };

      fetchSecondaryData();
    };

    fetchData();
  }, [supabase]);

  // Combined Loading State: Show loader if Animation is running OR critical data is loading
  if (!introFinished || loading) {
     return <TelemetryLoader onComplete={() => setIntroFinished(true)} />;
  }

  // Nav Items Configuration
  const navItems = [
    { href: '/calendar', icon: '📅', label: 'CALENDAR', desc: 'Full 2026 Schedule', color: 'cyan' },
    { href: '/leaderboard', icon: '🏆', label: 'LEADERBOARD', desc: 'Global Rankings', color: 'gold' },
    { href: '/leagues', icon: '👥', label: 'LEAGUES', desc: 'Squad Battles', color: 'cyan' },
    { href: '/standings', icon: '📊', label: 'STANDINGS', desc: 'Driver & Constructor', color: 'cyan' },
    { href: '/rivalries', icon: '⚔️', label: 'RIVALRIES', desc: 'Head-to-Head', color: 'red' },
    { href: '/profile', icon: '👤', label: 'PROFILE', desc: 'Stats & History', color: 'gold' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-void)] relative overflow-x-hidden selection:bg-[var(--accent-gold)] selection:text-black">
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent-cyan)] opacity-[0.04] blur-[180px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--f1-red)] opacity-[0.04] blur-[180px] rounded-full" />
      </div>

      {/* === HERO SECTION === */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-40 border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent z-10">
        <div className="max-w-7xl mx-auto px-6 relative">
          
          <div className="flex flex-col lg:flex-row items-end justify-between gap-16 lg:gap-8">
            {/* Left Content */}
            <div className="max-w-3xl animate-fade-in-up relative z-20">
              
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                   <div className="flex gap-1.5">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--f1-red)] animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                   </div>
                   <span className="text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">Season 2026 Live</span>
                </div>
                
                {/* Unofficial Fan Project Badge - Copyright Protection */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 backdrop-blur-md">
                   <span className="text-[10px] font-bold tracking-[0.15em] text-[var(--accent-cyan)] uppercase">⚡ Unofficial Fan Project</span>
                </div>
              </div>
              
              <h1 className="text-7xl md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter mb-8 font-orbitron leading-[0.85] uppercase">
                <span className="text-white block drop-shadow-2xl">Predict.</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--f1-red)] via-[var(--f1-red-bright)] to-[var(--f1-red)] block animate-gradient-x">Dominate.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-xl leading-relaxed mb-12 font-light">
                The advanced telemetry hub for true F1 enthusiasts. Analyze data, outsmart the grid, and claim the championship.
              </p>

              <div className="flex flex-wrap gap-5">
                 <F1Button href="/calendar" variant="primary" size="xl" icon="🏎️" pulse className="shadow-[0_0_40px_rgba(225,6,0,0.3)] hover:shadow-[0_0_60px_rgba(225,6,0,0.5)] border-none">
                    START PREDICTING
                 </F1Button>
                 <F1Button href="/leagues" variant="outline" size="xl" className="backdrop-blur-sm hover:bg-white/10">
                    JOIN LEAGUE
                 </F1Button>
              </div>
            </div>

            {/* Right Content - Featured Race Card */}
            {nextRace && (
                <div className="w-full lg:w-[480px] animate-fade-in-up relative z-20" style={{ animationDelay: '0.2s' }}>
                    <div className="relative group perspective-1000">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-[var(--f1-red)] to-[var(--accent-gold)] rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        
                        <GlassCard variant="default" className="p-8 relative overflow-hidden h-full transform transition-all duration-500 hover:-translate-y-2 hover:rotate-1 border-white/10 shadow-2xl" withNoise>
                             {/* Circuit Track SVG Overlay (Subtle) */}
                             <div className="absolute -top-10 -right-10 w-80 h-80 opacity-[0.07] rotate-12 pointer-events-none">
                                <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none stroke-[2]">
                                    <path d="M20,50 Q40,20 60,50 T90,50" />
                                </svg>
                             </div>

                             <div className="flex items-start justify-between mb-10 relative">
                                <div>
                                    <h3 className="text-[10px] font-bold text-[var(--accent-gold)] tracking-[0.2em] uppercase mb-2">UPCOMING EVENT</h3>
                                    <div className="text-4xl font-black text-white font-orbitron leading-none">{nextRace.name.split(' ')[0]}</div>
                                    <div className="text-xl font-bold text-white/50 font-orbitron">GRAND PRIX</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">Round</div>
                                    <div className="text-3xl font-bold text-white font-mono">01</div>
                                </div>
                             </div>

                             <div className="space-y-6 relative">
                                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-[var(--f1-red)]">📍</span>
                                    <span className="font-medium tracking-wide">{nextRace.circuit}</span>
                                </div>
                                
                                <div>
                                    {nextRace.quali_time ? (
                                        <LaunchSequence targetTime={nextRace.quali_time} label="PREDICTION WINDOW" />
                                    ) : (
                                        <div className="text-center p-8 border border-white/10 rounded-xl bg-black/20">
                                            <div className="text-xl font-mono text-[var(--text-muted)] animate-pulse">TIMING TBC</div>
                                        </div>
                                    )}
                                </div>
                             </div>
                             
                             <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                <Badge variant="gold" className="bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border-[var(--accent-gold)]/20">{getRaceWeekendDates(nextRace.race_time)}</Badge>
                                <Link href={`/predict/${nextRace.id}`} className="flex items-center gap-2 text-white text-xs font-bold tracking-[0.15em] hover:text-[var(--accent-cyan)] transition-colors group/link uppercase">
                                   Enter Paddock <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                                </Link>
                             </div>
                        </GlassCard>
                    </div>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* === COMMAND CENTER GRID === */}
      <section className="py-24 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                 <div>
                    <h2 className="text-3xl md:text-5xl font-black text-white font-orbitron mb-4">
                        COMMAND CENTER
                    </h2>
                    <div className="h-1 w-24 bg-[var(--f1-red)] shadow-[0_0_15px_var(--f1-red)] rounded-full text-left" />
                 </div>
                 
                 {userStandings.length > 0 && (
                     <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 border border-white/5 backdrop-blur-sm">
                        <div className="text-right">
                           <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Current Ranking</div>
                           <div className="text-white font-bold text-sm tracking-wide">GLOBAL LEAGUE</div>
                        </div>
                        <div className="text-4xl font-bold text-[var(--accent-gold)] font-mono">#1</div>
                     </div>
                 )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {navItems.map((item, i) => (
                     <Link key={item.href} href={item.href} className="group h-full">
                         <GlassCard 
                            className="h-full p-8 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-white/20 bg-gradient-to-b from-white/[0.03] to-transparent"
                            variant="default"
                            interactive
                         >
                            <div className="flex justify-between items-start mb-8">
                                <div className={`text-4xl p-4 rounded-2xl transition-all duration-500 bg-white/5 border border-white/5 group-hover:scale-110
                                    ${item.color === 'cyan' ? 'text-[var(--accent-cyan)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]' : 
                                      item.color === 'gold' ? 'text-[var(--accent-gold)] group-hover:shadow-[0_0_30px_rgba(201,169,98,0.2)]' :
                                      'text-[var(--f1-red)] group-hover:shadow-[0_0_30px_rgba(225,6,0,0.2)]'}
                                `}>
                                    {item.icon}
                                </div>
                                <div className={`text-2xl transition-all duration-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0
                                    ${item.color === 'cyan' ? 'text-[var(--accent-cyan)]' : item.color === 'gold' ? 'text-[var(--accent-gold)]' : 'text-[var(--f1-red)]'}
                                `}>→</div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2 font-orbitron tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                                {item.label}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm group-hover:text-white/80 transition-colors leading-relaxed">
                                {item.desc}
                            </p>
                         </GlassCard>
                     </Link>
                 ))}
             </div>
          </div>
      </section>

      {/* === LIVE TELEMETRY SECTION === */}
      <section className="py-24 px-6 border-t border-white/5 bg-black/20 relative z-10">
          <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Podium Module - Linked to Classification (Results) */}
                  <Link href="/classification" className="group block">
                      <div className="bg-[var(--bg-carbon)] rounded-3xl border border-white/5 p-8 relative overflow-hidden h-full transition-all duration-300 group-hover:border-[var(--accent-gold)]/50 group-hover:shadow-[0_0_30px_rgba(201,169,98,0.1)]">
                          <div className="absolute top-0 right-0 p-32 bg-[var(--accent-gold)] opacity-[0.03] blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-[0.08]"></div>
                          
                          <div className="flex items-center justify-between mb-8">
                              <div>
                                  <h3 className="text-xl font-bold text-white font-orbitron mb-1 group-hover:text-[var(--accent-gold)] transition-colors">RECENT RESULTS</h3>
                                  <div className="text-[10px] text-[var(--accent-gold)] tracking-widest uppercase font-bold">Latest Podium</div>
                              </div>
                              <Badge variant="outline" className="group-hover:bg-[var(--accent-gold)] group-hover:text-black transition-colors">LAST RACE</Badge>
                          </div>

                          {lastResults.length > 0 ? (
                              <div className="space-y-4 relative z-10">
                                  {lastResults.map((result, i) => (
                                      <div key={i} className="flex items-center gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-all">
                                          <div className={`text-2xl font-black font-mono w-8 ${i===0 ? 'text-[var(--accent-gold)] drop-shadow-[0_0_8px_rgba(201,169,98,0.5)]' : 'text-white/30'}`}>0{i+1}</div>
                                          <div className="flex-1">
                                              <div className="font-bold text-white text-lg tracking-wide transition-colors">{result.Driver.familyName.toUpperCase()}</div>
                                              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{result.Constructor.name}</div>
                                          </div>
                                          <div className="text-right">
                                              <div className="text-xl font-bold text-white font-mono gap-1 flex items-center justify-end">
                                                 <span className="text-[var(--accent-cyan)] text-sm">+</span>
                                                 {result.points}
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="h-48 flex flex-col items-center justify-center text-[var(--text-muted)] border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                                  <span className="text-4xl mb-4 grayscale opacity-20">🏁</span>
                                  <span className="text-sm tracking-widest uppercase">Awaiting Season Start</span>
                              </div>
                          )}
                      </div>
                  </Link>

                  {/* Championship Module - Linked to Standings */}
                  <Link href="/standings" className="group block">
                      <div className="bg-[var(--bg-carbon)] rounded-3xl border border-white/5 p-8 relative overflow-hidden h-full transition-all duration-300 group-hover:border-[var(--f1-red)]/50 group-hover:shadow-[0_0_30px_rgba(225,6,0,0.1)]">
                           <div className="absolute top-0 left-0 p-32 bg-[var(--f1-red)] opacity-[0.03] blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-[0.08]"></div>

                           <div className="flex items-center justify-between mb-8">
                              <div>
                                 <h3 className="text-xl font-bold text-white font-orbitron mb-1 group-hover:text-[var(--f1-red)] transition-colors">WDC STANDINGS</h3>
                                 <div className="text-[10px] text-[var(--f1-red)] tracking-widest uppercase font-bold">Driver Championship</div>
                              </div>
                              <Badge variant="outline" className="group-hover:bg-[var(--f1-red)] group-hover:text-white transition-colors">LIVE</Badge>
                          </div>

                          {topDrivers.length > 0 ? (
                              <div className="space-y-2 relative z-10">
                                  {topDrivers.map((driver, i) => (
                                      <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-4">
                                          <div className="flex items-center gap-4">
                                              <span className={`text-xs font-bold font-mono w-6 ${i===0 ? 'text-[var(--accent-gold)]' : 'text-white/30'}`}>{driver.position}</span>
                                              <span className="font-bold text-white text-sm tracking-wide">{driver.Driver.familyName.toUpperCase()}</span>
                                          </div>
                                          <span className="font-mono font-bold text-[var(--text-secondary)] text-sm">{driver.points} <span className="text-[10px] text-[var(--text-muted)]">PTS</span></span>
                                      </div>
                                  ))}
                                  <div className="pt-4 text-center">
                                      <span className="inline-block text-[10px] text-[var(--accent-cyan)] group-hover:text-white tracking-[0.2em] uppercase font-bold transition-all border-b border-transparent group-hover:border-white pb-1">View Full Standings →</span>
                                  </div>
                              </div>
                           ) : (
                              <div className="h-48 flex flex-col items-center justify-center text-[var(--text-muted)] border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                                  <span className="text-4xl mb-4 grayscale opacity-20">📊</span>
                                  <span className="text-sm tracking-widest uppercase">Data Unavailable</span>
                              </div>
                           )}
                      </div>
                  </Link>

              </div>
          </div>
      </section>

      {/* === CTA FOOTER with Parallax Feel === */}
      <section className="py-40 px-6 text-center relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--f1-red)]/20 via-transparent to-transparent z-0 pointer-events-none"></div>
          {/* Glowing Orb */}
          <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--f1-red)] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

          <div className="max-w-4xl mx-auto relative z-10">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 font-orbitron tracking-tighter">
                  LIGHTS OUT AND<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">AWAY WE GO.</span>
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-12 max-w-xl mx-auto font-light leading-relaxed">
                 Join the most immersive F1 prediction league on the web. It's free, it's fast, and the paddock is waiting for you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <F1Button href="/login" variant="primary" size="xl" className="shadow-[0_0_60px_rgba(225,6,0,0.4)] hover:shadow-[0_0_90px_rgba(225,6,0,0.6)] px-12 py-5 text-lg">
                    CREATE FREE ACCOUNT
                 </F1Button>
              </div>
          </div>
      </section>

    </div>
  );
}