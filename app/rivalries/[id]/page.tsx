"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../components/LoadingSpinner";
import GlassCard from "../../components/ui/GlassCard";
import Badge from "../../components/ui/Badge";
import { getDriverName, getDriverNumber, TEAM_COLORS, getDriverTeam } from "../../lib/drivers";
import F1Button from "../../components/ui/F1Button";

// Initial Supabase Setup
function useSupabase() {
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  return supabase;
}

interface RivalryMatchup {
    race_id: number;
    race_name: string;
    race_date: string;
    flag_url?: string;
    p1_score: number;
    p2_score: number;
    winner: 'p1' | 'p2' | 'draw';
}

export default function RivalryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = useSupabase();
    const rivalryId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [rivalry, setRivalry] = useState<any>(null);
    const [matchups, setMatchups] = useState<RivalryMatchup[]>([]);
    
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // 1. Fetch Rivalry
                const { data: riv, error } = await supabase
                    .from("rivalries")
                    .select("*")
                    .eq("id", rivalryId)
                    .single();

                if (error || !riv) throw new Error("Rivalry not found");
                setRivalry(riv);

                // 2. Fetch Races & Predictions relevant to this rivalry
                // Logic: Find races that started AFTER rivalry creation
                // Note: accurate querying depends on schema dates. 
                // We'll fetch completed races and match predictions for both users.
                
                const { data: races } = await supabase
                    .from("races")
                    .select("*")
                    .eq("status", "completed") // Only completed races count for points
                    .gte("date", riv.created_at.split('T')[0]) // Simple date check
                    .order("date", { ascending: true })
                    .limit(riv.race_duration);

                if (races && races.length > 0) {
                    const raceIds = races.map(r => r.id);
                    
                    // Fetch Predictions for P1
                    const { data: p1Preds } = await supabase
                        .from("predictions")
                        .select("race_id, manual_score")
                        .eq("user_id", riv.challenger_id)
                        .in("race_id", raceIds);

                    // Fetch Predictions for P2
                    const { data: p2Preds } = await supabase
                        .from("predictions")
                        .select("race_id, manual_score")
                        .eq("user_id", riv.opponent_id)
                        .in("race_id", raceIds);

                    // Combine
                    const combined: RivalryMatchup[] = races.map(race => {
                        const s1 = p1Preds?.find(p => p.race_id === race.id)?.manual_score || 0;
                        const s2 = p2Preds?.find(p => p.race_id === race.id)?.manual_score || 0;
                        let winner: 'p1'|'p2'|'draw' = 'draw';
                        if (s1 > s2) winner = 'p1';
                        if (s2 > s1) winner = 'p2';

                        return {
                            race_id: race.id,
                            race_name: race.name,
                            race_date: race.date,
                            p1_score: s1,
                            p2_score: s2,
                            winner
                        };
                    });
                    setMatchups(combined);
                }

            } catch (err) {
                console.error("Error loading rivalry:", err);
            } finally {
                setLoading(false);
            }
        };

        if (rivalryId) fetchDetails();
    }, [rivalryId, supabase]);

    if (loading) return <LoadingSpinner variant="f1" message="Analyzing Telemetry..." />;
    if (!rivalry) return <div className="text-white text-center pt-32">Rivalry not found.</div>;

    // Derived Constants
    const t1 = getDriverTeam(rivalry.challenger_driver);
    const t2 = getDriverTeam(rivalry.opponent_driver);
    const color1 = t1 ? TEAM_COLORS[t1] : '#45A29E';
    const color2 = t2 ? TEAM_COLORS[t2] : '#C3073F';

    return (
        <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6">
                
                {/* Back Link */}
                <Link href="/rivalries" className="text-[var(--text-muted)] hover:text-white flex items-center gap-2 mb-8 transition-colors">
                    ← Back to Rivalries
                </Link>

                {/* Main Header Card */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-12">
                    {/* Dynamic Split Background */}
                     <div className="absolute inset-0 flex">
                        <div className="flex-1 transition-all duration-1000" style={{ background: `linear-gradient(45deg, ${color1}20, transparent)` }} />
                        <div className="flex-1 transition-all duration-1000" style={{ background: `linear-gradient(-45deg, ${color2}20, transparent)` }} />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-12">
                        {/* Status Badge */}
                        <div className="text-center mb-8">
                             <Badge variant={rivalry.status === 'active' ? 'cyan' : 'outline'} pulse={rivalry.status === 'active'}>
                                {rivalry.status.toUpperCase()}
                             </Badge>
                             <div className="mt-2 text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
                                {matchups.length} / {rivalry.race_duration} Races Completed
                             </div>
                        </div>

                        {/* Head to Head Display */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                            
                            {/* P1 Section */}
                            <div className="text-center md:text-left md:flex-1">
                                <Link href={`/profile/${rivalry.challenger_id}`} className="group block">
                                    <div className="flex flex-col items-center md:items-start">
                                        <div 
                                            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white border-b-4 mb-4 transition-transform group-hover:-translate-y-2"
                                            style={{ backgroundColor: color1, borderColor: 'rgba(255,255,255,0.2)', boxShadow: `0 0 40px ${color1}40` }}
                                        >
                                            {getDriverNumber(getDriverName(rivalry.challenger_driver))}
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-black text-white leading-none mb-1 group-hover:text-[var(--accent-cyan)] transition-colors">
                                            {rivalry.challenger_name}
                                        </h2>
                                        <p className="text-[var(--text-muted)] font-mono text-sm uppercase tracking-wider">
                                            {getDriverName(rivalry.challenger_driver)}
                                        </p>
                                    </div>
                                </Link>
                                <div className="mt-6 md:hidden text-6xl font-black text-white font-mono">{rivalry.challenger_points}</div>
                            </div>

                            {/* Center Score (Desktop) */}
                            <div className="hidden md:flex flex-col items-center justify-center w-64 mx-8">
                                <div className="text-8xl font-black text-white font-mono flex items-center gap-4 text-shadow-glow">
                                    <span style={{ color: rivalry.challenger_points > rivalry.opponent_points ? color1 : 'white' }}>{rivalry.challenger_points}</span>
                                    <span className="text-4xl text-[var(--text-muted)] opacity-30">-</span>
                                    <span style={{ color: rivalry.opponent_points > rivalry.challenger_points ? color2 : 'white' }}>{rivalry.opponent_points}</span>
                                </div>
                                <div className="mt-2 text-[var(--accent-gold)] font-bold tracking-widest uppercase text-sm animate-pulse">Points Differential</div>
                            </div>

                             {/* P2 Section */}
                             <div className="text-center md:text-right md:flex-1">
                                <Link href={`/profile/${rivalry.opponent_id}`} className="group block">
                                    <div className="flex flex-col items-center md:items-end">
                                        <div 
                                            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white border-b-4 mb-4 transition-transform group-hover:-translate-y-2"
                                            style={{ backgroundColor: color2, borderColor: 'rgba(255,255,255,0.2)', boxShadow: `0 0 40px ${color2}40` }}
                                        >
                                            {getDriverNumber(getDriverName(rivalry.opponent_driver)) || "?"}
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-black text-white leading-none mb-1 group-hover:text-[var(--accent-gold)] transition-colors">
                                            {rivalry.opponent_name}
                                        </h2>
                                        <p className="text-[var(--text-muted)] font-mono text-sm uppercase tracking-wider">
                                            {getDriverName(rivalry.opponent_driver)}
                                        </p>
                                    </div>
                                </Link>
                                <div className="mt-6 md:hidden text-6xl font-black text-white font-mono">{rivalry.opponent_points}</div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Matchup History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Race Log */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>🏁</span> Race Log
                        </h3>
                        {matchups.length > 0 ? (
                            <div className="space-y-3">
                                {matchups.map((race) => (
                                    <GlassCard key={race.race_id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-lg">{race.race_name}</span>
                                            <span className="text-xs text-[var(--text-muted)]">{new Date(race.race_date).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            {/* P1 Score */}
                                            <div className={`text-center ${race.winner === 'p1' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
                                                <div className="text-xl font-black font-mono" style={{ color: race.winner === 'p1' ? color1 : 'white' }}>
                                                    {race.p1_score}
                                                </div>
                                            </div>

                                            <div className="text-[var(--text-subtle)] font-bold text-xs">VS</div>

                                             {/* P2 Score */}
                                             <div className={`text-center ${race.winner === 'p2' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
                                                <div className="text-xl font-black font-mono" style={{ color: race.winner === 'p2' ? color2 : 'white' }}>
                                                    {race.p2_score}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        ) : (
                             <GlassCard className="p-12 text-center border-dashed border-[var(--text-muted)]/30">
                                <div className="text-4xl opacity-30 mb-4">🏎️</div>
                                <p className="text-[var(--text-muted)]">No races completed yet in this rivalry.</p>
                                <p className="text-sm mt-2 text-[var(--accent-cyan)]">Wait for the next Grand Prix!</p>
                            </GlassCard>
                        )}
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <h3 className="text-sm font-bold text-[var(--accent-gold)] uppercase tracking-wider mb-4">Breakdown</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span style={{ color: color1 }}>{rivalry.challenger_name} Wins</span>
                                    <span className="font-mono">{matchups.filter(m => m.winner === 'p1').length}</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${(matchups.filter(m => m.winner === 'p1').length / (matchups.length || 1)) * 100}%`, backgroundColor: color1 }} />
                                    <div style={{ width: `${(matchups.filter(m => m.winner === 'p2').length / (matchups.length || 1)) * 100}%`, backgroundColor: color2 }} />
                                </div>
                                 <div className="flex justify-between items-center text-sm">
                                    <span style={{ color: color2 }}>{rivalry.opponent_name} Wins</span>
                                    <span className="font-mono">{matchups.filter(m => m.winner === 'p2').length}</span>
                                </div>
                            </div>
                        </GlassCard>

                         <GlassCard className="p-6">
                            <h3 className="text-sm font-bold text-[var(--accent-cyan)] uppercase tracking-wider mb-4">Performance</h3>
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-[var(--text-muted)]">Accuracy</span>
                                <span className="text-xs text-white">Coming Soon</span>
                            </div>
                            {/* Placeholder for future detailed stats */}
                        </GlassCard>
                    </div>
                </div>

            </div>
        </div>
    );
}
