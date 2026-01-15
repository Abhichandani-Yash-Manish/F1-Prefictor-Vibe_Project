"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { config } from "../../lib/config";
import LoadingSpinner from "../components/LoadingSpinner";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import F1Button from "../components/ui/F1Button";

interface UserStanding {
  id: string;
  username: string;
  total_score: number;
  is_admin: boolean;
  latest_points?: number;
  last_races?: { code: string; points: number }[];
}

export default function LeaderboardPage() {
  const [standings, setStandings] = useState<UserStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        // Fetch standings from API
        const response = await fetch(`${config.apiUrl}/standings`);
        if (response.ok) {
          const data = await response.json();
          setStandings(data);
        }
      } catch (err) {
        console.error("Error fetching standings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPositionStyle = (position: number) => {
    if (position === 1) return {
      bg: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      badge: 'bg-yellow-500 text-black'
    };
    if (position === 2) return {
      bg: 'bg-gradient-to-r from-gray-400/20 to-gray-500/10',
      border: 'border-gray-400/50',
      text: 'text-gray-300',
      badge: 'bg-gray-400 text-black'
    };
    if (position === 3) return {
      bg: 'bg-gradient-to-r from-orange-600/20 to-orange-700/10',
      border: 'border-orange-600/50',
      text: 'text-orange-400',
      badge: 'bg-orange-600 text-white'
    };
    return {
      bg: 'bg-[var(--bg-onyx)]',
      border: 'border-[var(--glass-border)]',
      text: 'text-[var(--text-muted)]',
      badge: 'bg-[var(--bg-graphite)] text-[var(--text-muted)]'
    };
  };

  if (loading) return <LoadingSpinner message="Loading Leaderboard..." />;

  const top3 = standings.slice(0, 3);
  const rest = standings.slice(3);
  const currentUserRank = standings.findIndex(s => s.id === currentUserId) + 1;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      {/* Racing stripe */}
      <div className="fixed top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--accent-gold)] via-[var(--accent-gold)]/50 to-transparent" />
      
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-gold-dim)] border border-[var(--accent-gold)]/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse" />
            <span className="text-xs font-bold text-[var(--accent-gold)] tracking-wider uppercase">Prediction Championship</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 font-orbitron">
            LEADERBOARD
          </h1>
          <p className="text-[var(--text-muted)] max-w-lg mx-auto">
            The best F1 predictors of the 2026 season. Climb the ranks by making accurate predictions.
          </p>
          
          {/* Current user rank highlight */}
          {currentUserRank > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--accent-cyan-dim)] border border-[var(--accent-cyan)]/30">
              <span className="text-[var(--accent-cyan)]">📍</span>
              <span className="text-[var(--text-secondary)]">Your Position:</span>
              <span className="text-2xl font-black text-[var(--accent-cyan)] font-mono">#{currentUserRank}</span>
            </div>
          )}
        </div>

        {/* Podium - Top 3 */}
        {top3.length >= 3 && (
          <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-16 pt-8">
            {/* P2 */}
            <GlassCard interactive className="flex-1 p-6 text-center order-2 md:order-1 relative group !overflow-visible">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-black font-bold border-4 border-[var(--bg-void)] shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20">
                2
              </div>
              <div className="mt-8 text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Silver</div>
              <Link href={`/profile/${top3[1]?.id}`} className="block hover:underline hover:text-[var(--text-secondary)] transition-colors">
                <div className="text-2xl font-bold text-white mb-1 truncate">{top3[1]?.username?.split('@')[0] || 'Racer'}</div>
              </Link>
              <div className="text-3xl font-black text-gray-300 font-mono">{top3[1]?.total_score || 0}</div>
              <div className="text-xs text-[var(--text-muted)]">points</div>
              
              {/* Recent Form P2 */}
              <div className="mt-4 flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                 {top3[1]?.last_races?.map((race, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${race.points > 15 ? 'bg-[var(--status-success)]' : 'bg-gray-600'}`} />
                 ))}
              </div>
            </GlassCard>

            {/* P1 */}
            <GlassCard variant="gold" className="flex-[1.2] p-8 text-center order-1 md:order-2 relative scale-105 group !overflow-visible z-10">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-3xl border-4 border-[var(--bg-void)] shadow-[var(--shadow-glow-gold)] z-20">
                🏆
              </div>
              <div className="mt-10 text-xs text-[var(--accent-gold)] uppercase tracking-[0.2em] mb-2 animate-pulse">Champion</div>
              <Link href={`/profile/${top3[0]?.id}`} className="block hover:underline hover:text-[var(--accent-gold)] transition-colors">
                <div className="text-4xl font-bold text-white mb-1 truncate">{top3[0]?.username?.split('@')[0] || 'Champion'}</div>
              </Link>
              <div className="text-6xl font-black text-[var(--accent-gold)] font-mono text-glow-gold">{top3[0]?.total_score || 0}</div>
              <div className="text-xs text-[var(--text-muted)]">points</div>
              
               {/* Recent Form P1 */}
              <div className="mt-6 flex justify-center gap-2">
                 {top3[0]?.last_races?.slice(0, 3).map((race, i) => (
                    <span key={i} className="text-xs font-mono bg-[var(--accent-gold-dim)] text-[var(--accent-gold)] px-2 py-1 rounded border border-[var(--accent-gold)]/20">
                        {race.code}
                    </span>
                 ))}
              </div>
            </GlassCard>

            {/* P3 */}
            <GlassCard interactive className="flex-1 p-6 text-center order-3 relative group !overflow-visible">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center text-white font-bold border-4 border-[var(--bg-void)] shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20">
                3
              </div>
              <div className="mt-8 text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Bronze</div>
              <Link href={`/profile/${top3[2]?.id}`} className="block hover:underline hover:text-[var(--text-secondary)] transition-colors">
                 <div className="text-2xl font-bold text-white mb-1 truncate">{top3[2]?.username?.split('@')[0] || 'Racer'}</div>
              </Link>
              <div className="text-3xl font-black text-orange-400 font-mono">{top3[2]?.total_score || 0}</div>
              <div className="text-xs text-[var(--text-muted)]">points</div>
               {/* Recent Form P3 */}
               <div className="mt-4 flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                 {top3[2]?.last_races?.map((race, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${race.points > 15 ? 'bg-[var(--status-success)]' : 'bg-gray-600'}`} />
                 ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Rest of standings */}
        <GlassCard className="overflow-hidden">
          <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--bg-carbon)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[var(--accent-gold)] text-xl">📊</span>
              <span className="font-bold text-lg text-white">Full Standings</span>
            </div>
            <div className="hidden md:flex text-sm text-[var(--text-muted)] gap-8 pr-6 uppercase tracking-wider font-bold">
                <span className="w-[100px] text-center">Recent Form</span>
                <span className="w-24 text-right">Points</span>
            </div>
          </div>
          
          {standings.length === 0 ? (
            <div className="p-16 text-center text-[var(--text-muted)]">
              <span className="text-5xl mb-6 block opacity-40">🏁</span>
              <p className="text-lg">No predictions yet. Be the first to compete!</p>
              <Link href="/calendar" className="mt-6 inline-block text-[var(--accent-cyan)] hover:underline text-lg">
                View upcoming races →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--glass-border)]">
              {standings.map((user, index) => {
                const position = index + 1;
                const style = getPositionStyle(position);
                const isCurrentUser = user.id === currentUserId;
                
                return (
                  <div 
                    key={user.id}
                    className={`flex items-center gap-6 p-6 transition-all hover:bg-[var(--bg-graphite)] ${
                      isCurrentUser ? 'bg-[var(--accent-cyan-dim)] border-l-4 border-l-[var(--accent-cyan)]' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Position */}
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold font-mono text-lg shrink-0 ${style.badge}`}>
                      {position <= 3 ? (position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉') : position}
                    </div>
                    
                    {/* User */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${user.id}`} className="block hover:underline">
                        <div className={`font-bold text-lg truncate ${isCurrentUser ? 'text-[var(--accent-cyan)]' : 'text-white'}`}>
                            {user.username?.split('@')[0] || 'Anonymous'}
                            {isCurrentUser && <span className="ml-2 text-sm text-[var(--accent-cyan)] font-normal">(You)</span>}
                        </div>
                      </Link>
                      {user.is_admin && (
                        <Badge variant="gold" size="sm" icon="⭐" className="mt-1">
                          TEAM PRINCIPAL
                        </Badge>
                      )}
                    </div>

                    {/* Recent Form (Desktop Only) */}
                    <div className="hidden md:flex gap-3 w-[120px] justify-center">
                        {user.last_races && user.last_races.length > 0 ? (
                            user.last_races.slice(0, 3).map((race, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="text-[10px] text-[var(--text-muted)] leading-none mb-1">{race.code}</span>
                                    <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                                        race.points >= 20 ? 'text-[var(--status-success)] bg-[var(--status-success)]/10' : 
                                        race.points >= 10 ? 'text-[var(--accent-gold)] bg-[var(--accent-gold)]/10' : 'text-gray-500'
                                    }`}>
                                        {race.points}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <span className="text-[var(--text-subtle)] text-sm opacity-50">-</span>
                        )}
                    </div>
                    
                    {/* Score */}
                    <div className="text-right w-24 shrink-0">
                      <div className={`text-3xl font-black font-mono ${position <= 3 ? style.text : 'text-white'}`}>
                        {user.total_score}
                      </div>
                      <div className="text-xs text-[var(--text-subtle)] uppercase tracking-wider">PTS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-[var(--text-muted)] mb-4">Want to climb the ranks?</p>
          <F1Button href="/calendar" variant="primary" className="px-8 py-4" icon="🏎️">
            Make Predictions
          </F1Button>
        </div>
      </div>
    </div>
  );
}
