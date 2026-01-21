"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import GlassCard from "../components/ui/GlassCard";
import AdUnit from "../components/AdUnit";

export default function StandingsPage() {
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [teamStandings, setTeamStandings] = useState<any[]>([]);
  const [view, setView] = useState<"drivers" | "teams">("drivers");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchDrivers = async () => {
             const res = await fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json");
             const data = await res.json();
             return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        };

        const fetchTeams = async () => {
             const res = await fetch("https://api.jolpi.ca/ergast/f1/current/constructorStandings.json");
             const data = await res.json();
             return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
        };

        const [driversResult, teamsResult] = await Promise.allSettled([fetchDrivers(), fetchTeams()]);

        if (driversResult.status === "fulfilled") setDriverStandings(driversResult.value);
        if (teamsResult.status === "fulfilled") setTeamStandings(teamsResult.value);
        
      } catch (err) {
        console.error("Error fetching standings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentData = view === "drivers" ? driverStandings : teamStandings;
  const top3 = currentData.slice(0, 3);
  const rest = currentData.slice(3);

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header - Always Visible */}
        <div className="text-center mb-12">
          <span className="badge badge-cyan mb-4">Live Data</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            {view === "drivers" ? "Driver" : "Constructor"} <span className="text-gradient-gold">Standings</span>
          </h1>
          
          {/* Toggle */}
          <div className="inline-flex bg-[var(--bg-onyx)] p-1 rounded-xl border border-[var(--glass-border)] mt-6">
            <button 
              onClick={() => setView("drivers")}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                view === "drivers" 
                  ? "bg-[var(--accent-cyan)] text-black" 
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              Drivers
            </button>
            <button 
              onClick={() => setView("teams")}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                view === "teams" 
                  ? "bg-[var(--f1-red)] text-white" 
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              Constructors
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
             <div className="py-20">
                <LoadingSpinner message="Updating Standings..." />
             </div>
        ) : currentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="text-5xl mb-6 opacity-40">🏁</div>
             <h2 className="text-2xl font-bold text-white mb-3">Standings Not Available</h2>
             <p className="text-[var(--text-muted)] max-w-md">
               The 2026 F1 season hasn't started yet or data is unavailable.
             </p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-16 px-4">
              
              {/* P2 */}
              {top3[1] && (
                <GlassCard className="flex-1 p-6 md:p-8 text-center order-2 md:order-1 relative group hover:bg-[var(--bg-surface)]">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-black font-bold border-4 border-[var(--bg-void)]">
                    2
                  </div>
                  <div className="text-[var(--text-subtle)] text-xs font-medium uppercase tracking-wider mt-4 mb-3">Second</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-[var(--accent-gold)] transition-colors">
                    {view === "drivers" ? top3[1].Driver.familyName.toUpperCase() : top3[1].Constructor.name.toUpperCase()}
                  </div>
                  {view === "drivers" && (
                    <div className="text-sm text-[var(--text-muted)] mb-4">{top3[1].Constructors[0].name}</div>
                  )}
                  <div className="text-4xl md:text-5xl font-bold text-gray-300 font-mono">{top3[1].points}</div>
                </GlassCard>
              )}

              {/* P1 */}
              {top3[0] && (
                <GlassCard variant="gold" className="flex-[1.2] p-8 md:p-10 text-center order-1 md:order-2 relative z-10 scale-105 group">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl border-4 border-[var(--bg-void)] shadow-[var(--shadow-glow-gold)]">
                    🏆
                  </div>
                  <div className="text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-[0.2em] mt-6 mb-3 animate-pulse">Championship Leader</div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1 group-hover:text-[var(--accent-gold)] transition-colors">
                    {view === "drivers" ? top3[0].Driver.familyName.toUpperCase() : top3[0].Constructor.name.toUpperCase()}
                  </div>
                  {view === "drivers" && (
                    <div className="text-sm text-[var(--text-muted)] mb-4">{top3[0].Constructors[0].name}</div>
                  )}
                  <div className="text-5xl md:text-7xl font-bold text-[var(--accent-gold)] font-mono text-glow-gold">{top3[0].points}</div>
                </GlassCard>
              )}

              {/* P3 */}
              {top3[2] && (
                <GlassCard className="flex-1 p-6 md:p-8 text-center order-3 relative group hover:bg-[var(--bg-surface)]">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center text-white font-bold border-4 border-[var(--bg-void)]">
                    3
                  </div>
                  <div className="text-[var(--text-subtle)] text-xs font-medium uppercase tracking-wider mt-4 mb-3">Third</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-[var(--accent-gold)] transition-colors">
                    {view === "drivers" ? top3[2].Driver.familyName.toUpperCase() : top3[2].Constructor.name.toUpperCase()}
                  </div>
                  {view === "drivers" && (
                    <div className="text-sm text-[var(--text-muted)] mb-4">{top3[2].Constructors[0].name}</div>
                  )}
                  <div className="text-4xl md:text-5xl font-bold text-orange-500 font-mono">{top3[2].points}</div>
                </GlassCard>
              )}
            </div>

            {/* === AD PLACEMENT === */}
            <div className="my-8">
              <AdUnit 
                slot="standings_between"
                format="horizontal"
                style={{ minHeight: "90px" }}
                label="Sponsored"
              />
            </div>

            {/* Full Table */}
            <GlassCard className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--bg-carbon)] text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    <th className="p-5 text-center border-b border-[var(--glass-border)]">Pos</th>
                    <th className="p-5 text-left border-b border-[var(--glass-border)]">{view === "drivers" ? "Driver" : "Team"}</th>
                    {view === "drivers" && <th className="p-5 text-left hidden md:table-cell border-b border-[var(--glass-border)]">Team</th>}
                    <th className="p-5 text-center border-b border-[var(--glass-border)]">Wins</th>
                    <th className="p-5 text-right border-b border-[var(--glass-border)]">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((item: any) => (
                    <tr key={item.position} className="border-b border-[var(--glass-border)] hover:bg-[var(--bg-graphite)] transition-colors group">
                      <td className="p-5 text-center font-mono text-xl font-bold text-[var(--text-subtle)] group-hover:text-white">
                        {item.position}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-[var(--glass-border)] group-hover:bg-[var(--accent-gold)] transition-colors rounded-full" />
                          <div>
                            <span className="font-bold text-white block">{view === "drivers" ? item.Driver.familyName.toUpperCase() : item.Constructor.name.toUpperCase()}</span>
                            {view === "drivers" && (
                              <span className="text-xs text-[var(--text-muted)]">{item.Driver.givenName}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      {view === "drivers" && (
                        <td className="p-5 hidden md:table-cell text-[var(--text-muted)] text-sm">{item.Constructors[0].name}</td>
                      )}
                      <td className="p-5 text-center font-mono text-[var(--text-muted)] group-hover:text-white">{item.wins}</td>
                      <td className="p-5 text-right">
                        <span className="font-mono text-2xl font-bold text-white group-hover:text-[var(--accent-cyan)]">{item.points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}