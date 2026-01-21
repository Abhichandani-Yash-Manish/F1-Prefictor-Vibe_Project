"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "../components/LoadingSpinner";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import F1Button from "../components/ui/F1Button";
import { TEAM_COLORS, getDriverTeam, getDriverNumber } from "../lib/drivers";
import AdUnit from "../components/AdUnit";

interface HistoryItem {
  id: number;
  race_id: number;
  points_total: number;
  manual_score: number;
  quali_p1_driver: string;
  quali_p2_driver: string;
  quali_p3_driver: string;
  race_p1_driver: string;
  race_p2_driver: string;
  race_p3_driver: string;
  wild_prediction: string;
  biggest_flop: string;
  biggest_surprise: string;
  races: {
    name: string;
    race_time: string;
    circuit: string;
    is_sprint: boolean;
  };
}

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("predictions")
          .select("*, races(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPredictions(data || []);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [router, supabase]);

  if (loading) return <LoadingSpinner message="Retrieving Mission Logs..." />;

  const DriverBadge = ({ driver, label }: { driver: string, label: string }) => {
    if (!driver) return null;
    const team = getDriverTeam(driver);
    const color = team ? TEAM_COLORS[team] : "#fff";
    const number = getDriverNumber(driver);
    
    return (
      <div className="flex items-center gap-3 bg-[var(--bg-onyx)] p-2 rounded-lg border border-[var(--glass-border)]">
        <div 
          className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-white text-xs border border-white/10"
          style={{ backgroundColor: color }}
        >
          {number || driver.charAt(0)}
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</div>
          <div className="text-sm font-bold text-white truncate max-w-[120px]">{driver.split('(')[0].trim()}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      {/* Background Effect */}
      <div className="fixed top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--accent-cyan)] via-[var(--accent-cyan)]/50 to-transparent" />
      
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-12 border-b border-[var(--glass-border)] pb-6 relative animate-fade-in">
           <div>
              <span className="badge badge-cyan mb-4">Archive</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
                MISSION <span className="text-[var(--accent-cyan)]">LOGS</span>
              </h1>
              <p className="text-[var(--text-muted)] max-w-lg">
                Complete history of your race strategies and results.
              </p>
           </div>
           
           <div className="hidden md:block text-right">
              <div className="text-sm text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Entries</div>
              <div className="text-4xl font-mono font-bold text-white">{predictions.length}</div>
           </div>
        </div>

        {/* Content */}
        {predictions.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-6 opacity-20 grayscale">🏎️</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Mission Logs Found</h2>
            <p className="text-[var(--text-muted)] mb-8">You haven't made any predictions yet.</p>
            <F1Button href="/calendar">View Upcoming Races</F1Button>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {predictions.map((pred, index) => {
              const raceDate = new Date(pred.races.race_time);
              const isPast = raceDate < new Date();
              const points = pred.points_total || 0;
              const showAd = index === 2 && predictions.length > 3; // Show ad after 3rd item
              
              return (
                <>
                <GlassCard key={pred.id} className="p-0 overflow-hidden group">
                  {/* Card Header */}
                  <div className="bg-[#15171c] p-6 border-b border-[var(--glass-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0a0a0c] rounded-xl flex flex-col items-center justify-center border border-[var(--glass-border)] text-[var(--text-muted)]">
                        <span className="text-xs font-bold uppercase">{raceDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-bold text-white">{raceDate.getDate()}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[var(--accent-cyan)] transition-colors">
                          {pred.races.name}
                        </h3>
                        <div className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                           <span>📍 {pred.races.circuit}</span>
                           {pred.races.is_sprint && <Badge variant="gold" size="sm" className="ml-2">SPRINT</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Points</div>
                          <div className={`text-2xl font-mono font-bold ${points > 0 ? "text-[var(--accent-gold)] text-glow-gold" : "text-white"}`}>
                            {points}
                          </div>
                       </div>
                       <div className="h-10 w-[1px] bg-[var(--glass-border)] hidden md:block" />
                       <div className="text-right hidden md:block">
                          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Status</div>
                          <div className={`text-sm font-bold ${isPast ? "text-[var(--status-success)]" : "text-[var(--accent-cyan)]"}`}>
                            {isPast ? "COMPLETED" : "UPCOMING"}
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Card Body - Predictions */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[var(--bg-surface)]/50 backdrop-blur-sm">
                     
                     {/* Podium Picks */}
                     <div>
                        <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-[var(--f1-red)]"></span> Race Podium
                        </h4>
                        <div className="space-y-2">
                           <DriverBadge label="Winner" driver={pred.race_p1_driver} />
                           <DriverBadge label="2nd Place" driver={pred.race_p2_driver} />
                           <DriverBadge label="3rd Place" driver={pred.race_p3_driver} />
                        </div>
                     </div>

                     {/* Bonus & Quali Quick View */}
                     <div className="space-y-6">
                        <div>
                           <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)]"></span> Bonus Intel
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-[var(--bg-onyx)] rounded-lg border border-[var(--glass-border)]">
                                 <div className="text-[10px] text-[var(--accent-gold)] uppercase font-bold mb-1">Wildcard</div>
                                 <div className="text-sm text-white italic">"{pred.wild_prediction}"</div>
                              </div>
                              <div className="p-3 bg-[var(--bg-onyx)] rounded-lg border border-[var(--glass-border)]">
                                 <div className="text-[10px] text-[var(--f1-red)] uppercase font-bold mb-1">Biggest Flop</div>
                                 <div className="text-sm text-white md:truncate" title={pred.biggest_flop}>{pred.biggest_flop}</div>
                              </div>
                           </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Pole Position Pick</h4>
                            <div className="flex items-center gap-2">
                               <span className="text-sm font-bold text-white">{pred.quali_p1_driver?.split('(')[0]}</span>
                               <span className="text-xs text-[var(--text-muted)] font-mono">
                                  ({getDriverTeam(pred.quali_p1_driver) || "F1"})
                               </span>
                            </div>
                        </div>
                     </div>

                  </div>
                </GlassCard>
                {showAd && (
                  <AdUnit 
                    slot="content_inline"
                    format="horizontal"
                    style={{ minHeight: "90px" }}
                    label="Sponsored"
                  />
                )}
                </>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
