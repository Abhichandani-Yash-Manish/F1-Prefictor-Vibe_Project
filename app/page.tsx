"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { config } from "../lib/config";
import LaunchSequence from "./components/LaunchSequence";
import RivalryCard from "./components/RivalryCard";
import LoadingSpinner from "./components/LoadingSpinner";

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
          // Fallback to first race of season if no next race
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
        // Show UI immediately after checking for race data
        setLoading(false);
      }

      // 2. Secondary Data: Stats & Standings (Background - Parallel)
      // These will populate as they arrive without blocking the UI
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

        // Fire all in parallel
        await Promise.allSettled([fetchResults(), fetchDrivers(), fetchUserStandings()]);
      };

      fetchSecondaryData();
    };

    fetchData();
  }, [supabase]);

  if (loading) return <LoadingSpinner message="Initializing Command Center..." />;


  // All navigation items - comprehensive hub
  const navItems = [
    { href: '/calendar', icon: '📅', label: 'Race Calendar', desc: 'Full 2026 Schedule', color: 'cyan' },
    { href: '/leaderboard', icon: '🏆', label: 'Leaderboard', desc: 'Prediction Rankings', color: 'gold' },
    { href: '/leagues', icon: '👥', label: 'My Leagues', desc: 'Compete & Chat', color: 'cyan' },
    { href: '/standings', icon: '📊', label: 'F1 Standings', desc: 'Driver & Team', color: 'cyan' },
    { href: '/rivalries', icon: '⚔️', label: 'Rivalries', desc: 'Head-to-Head', color: 'red' },
    { href: '/friends', icon: '🤝', label: 'Friends', desc: 'Social Hub', color: 'gold' },
    { href: '/classification', icon: '🏁', label: 'Results', desc: 'Past Predictions', color: 'cyan' },
    { href: '/admin', icon: '⚙️', label: 'Admin', desc: 'Manage Races', color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-void)] relative overflow-hidden">
      
      {/* === HERO SECTION === */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 border-b border-[var(--glass-border)]">
        {/* Racing stripe accents */}
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--f1-red)] via-[var(--f1-red)]/50 to-transparent" />
        <div className="absolute top-0 left-4 w-1 h-1/2 bg-gradient-to-b from-[var(--accent-gold)] to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6">
          {/* Top Row - Branding */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--f1-red)]/10 border border-[var(--f1-red)]/30 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--f1-red)] animate-pulse" />
                <span className="text-xs font-bold text-[var(--f1-red)] tracking-wider uppercase">Live • 2026 Season</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2 font-orbitron">
                <span className="text-white">F1</span>
                <span className="text-[var(--f1-red)] ml-2">APEX</span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] max-w-md">
                The ultimate F1 prediction hub. Compete, predict, and dominate.
              </p>
            </div>

            {/* User Quick Stats (if logged in) */}
            {userStandings.length > 0 && (
              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold)]/60 flex items-center justify-center text-black font-bold text-lg">
                  🏁
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Top Predictor</div>
                  <div className="text-lg font-bold text-white">{userStandings[0]?.username?.split('@')[0] || 'Leader'}</div>
                  <div className="text-sm text-[var(--accent-gold)] font-mono font-bold">{userStandings[0]?.total_score || 0} pts</div>
                </div>
              </div>
            )}
          </div>

          {/* NEXT RACE - Big Featured Card */}
          {nextRace && (
            <div className="relative mb-10">
              {/* Featured race card with racing aesthetics */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-carbon)] via-[var(--bg-onyx)] to-[var(--bg-carbon)] border border-[var(--glass-border)] p-8 md:p-10">
                {/* Racing stripes background */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-full h-2 bg-[var(--f1-red)]" />
                  <div className="absolute top-4 left-0 w-3/4 h-1 bg-[var(--f1-red)]" />
                  <div className="absolute bottom-0 right-0 w-full h-2 bg-[var(--accent-gold)]" />
                </div>
                
                <div className="relative z-10">
                  {/* Badges */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="badge badge-red">NEXT RACE</span>
                    {nextRace.is_sprint && <span className="badge badge-cyan">SPRINT WEEKEND</span>}
                    <span className="badge badge-gold">{getRaceWeekendDates(nextRace.race_time)}</span>
                  </div>
                  
                  {/* LARGE GP NAME - User requested this to be bigger */}
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-2 font-orbitron tracking-tight">
                    {nextRace.name.replace(' Grand Prix', '')}
                  </h2>
                  <div className="text-xl md:text-2xl font-semibold text-[var(--accent-gold)] mb-6">
                    GRAND PRIX
                  </div>
                  
                  {/* Circuit */}
                  <div className="flex items-center gap-3 text-[var(--text-muted)] mb-8">
                    <span className="text-[var(--f1-red)]">📍</span>
                    <span className="text-lg">{nextRace.circuit}</span>
                  </div>

                  {/* Countdown - Smaller than GP name */}
                  <div className="mb-8">
                    {nextRace.quali_time ? (
                      <div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">Predictions Close In</div>
                        <LaunchSequence targetTime={nextRace.quali_time} label="" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan-dim)] border border-[var(--accent-cyan)]/30">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                        <span className="text-sm font-medium text-[var(--accent-cyan)]">Session times TBC</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link 
                    href={`/predict/${nextRace.id}`}
                    className="inline-flex items-center gap-3 bg-[var(--f1-red)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[var(--f1-red-bright)] transition-all hover:scale-105 shadow-[0_0_30px_rgba(225,6,0,0.3)]"
                  >
                    <span className="text-2xl">🏎️</span>
                    <span>MAKE PREDICTIONS</span>
                    <span className="text-2xl">→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* === NAVIGATION HUB === All pages accessible */}
      <section className="py-12 px-6 border-b border-[var(--glass-border)]">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-center text-sm font-bold text-[var(--text-muted)] tracking-[0.3em] uppercase mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--accent-gold)]" />
            Command Center
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--accent-gold)]" />
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative p-5 rounded-xl border transition-all duration-300 text-center
                  ${item.color === 'red' 
                    ? 'border-[var(--f1-red)]/30 hover:border-[var(--f1-red)] hover:bg-[var(--f1-red)]/10'
                    : item.color === 'gold'
                    ? 'border-[var(--accent-gold)]/20 hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10'
                    : 'border-[var(--glass-border)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10'
                  }
                  bg-[var(--bg-onyx)]
                `}
              >
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">{item.icon}</div>
                <div className={`font-bold text-sm mb-1 transition-colors
                  ${item.color === 'red' ? 'text-white group-hover:text-[var(--f1-red)]'
                    : item.color === 'gold' ? 'text-white group-hover:text-[var(--accent-gold)]'
                    : 'text-white group-hover:text-[var(--accent-cyan)]'
                  }
                `}>
                  {item.label}
                </div>
                <div className="text-xs text-[var(--text-subtle)]">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === LIVE DATA PANELS === */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PODIUM */}
          <div className="telemetry-panel p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="text-lg font-bold text-white">Last Race Podium</h3>
                <p className="text-xs text-[var(--text-muted)]">Live F1 Data</p>
              </div>
            </div>
            
            {lastResults.length > 0 ? (
              <div className="space-y-3">
                {lastResults.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-onyx)] border border-[var(--glass-border)] hover:border-[var(--accent-gold)]/50 transition-all group"
                  >
                    <div className={`
                      w-10 h-10 flex items-center justify-center rounded-lg font-bold font-mono
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                        'bg-gradient-to-br from-orange-600 to-orange-700 text-white'}
                    `}>
                      P{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{result.Driver.familyName.toUpperCase()}</div>
                      <div className="text-xs text-[var(--text-muted)]">{result.Constructor.name}</div>
                    </div>
                    <div className="text-xl font-bold text-[var(--accent-cyan)] font-mono">+{result.points || 0}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <span className="text-3xl opacity-40">🏁</span>
                <p className="mt-2 text-sm">Season not started</p>
              </div>
            )}
          </div>
          
          {/* CHAMPIONSHIP */}
          <div className="telemetry-panel p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-lg font-bold text-white">Championship</h3>
                <p className="text-xs text-[var(--text-muted)]">Driver Standings</p>
              </div>
            </div>
            
            {topDrivers.length > 0 ? (
              <div className="space-y-2">
                {topDrivers.map((driver, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all
                      ${index === 0 
                        ? 'bg-[var(--accent-gold-dim)] border border-[var(--accent-gold)]/30' 
                        : 'bg-[var(--bg-onyx)] border border-[var(--glass-border)] hover:border-[var(--glass-border-light)]'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold font-mono text-sm
                      ${index === 0 ? 'bg-[var(--accent-gold)] text-black' : 'bg-[var(--bg-graphite)] text-[var(--text-muted)]'}
                    `}>
                      {driver.position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${index === 0 ? 'text-[var(--accent-gold)]' : 'text-white'}`}>
                        {driver.Driver.familyName.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">{driver.points}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <span className="text-3xl opacity-40">📈</span>
                <p className="mt-2 text-sm">Awaiting first race</p>
              </div>
            )}
            
            <Link 
              href="/standings" 
              className="mt-4 block text-center text-sm text-[var(--accent-cyan)] hover:text-white transition-colors"
            >
              View Full Standings →
            </Link>
          </div>
        </div>
      </section>

      {/* === RIVALRY SECTION === */}
      {userStandings.length >= 2 && (
        <section className="py-12 px-6 border-t border-[var(--glass-border)]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-2xl">⚔️</span>
              <h2 className="text-xl font-bold text-white">Featured Rivalry</h2>
            </div>
            <RivalryCard 
              player1={{
                name: userStandings[0].username.split('@')[0],
                driver: "Max Verstappen (Red Bull)",
                points: userStandings[0].total_score,
              }}
              player2={{
                name: userStandings[1].username.split('@')[0],
                driver: "Lewis Hamilton (Ferrari)",
                points: userStandings[1].total_score,
              }}
              races={1}
            />
          </div>
        </section>
      )}

      {/* === FOOTER CTA === */}
      <section className="py-16 px-6 text-center bg-gradient-to-t from-[var(--bg-midnight)] to-transparent">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Race?</h3>
          <p className="text-[var(--text-muted)] mb-8">
            Join thousands of F1 fans making predictions every race weekend.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="btn-primary px-8 py-4 text-base">
              Get Started Free
            </Link>
            <Link href="/calendar" className="btn-ghost px-8 py-4 text-base border border-[var(--glass-border)]">
              View Schedule
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}