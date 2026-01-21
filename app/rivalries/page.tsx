"use client";
import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RivalryCard from "../components/RivalryCard";
import GauntletModal from "../components/GauntletModal";
import { teamRadio } from "../components/TeamRadioToast";
import { DRIVERS_2026, getDriverTeam, TEAM_COLORS } from "../lib/drivers";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import F1Button from "../components/ui/F1Button";
import AdUnit from "../components/AdUnit";

// Safe initialization of Supabase client
function useSupabase() {
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  return supabase;
}

interface Rivalry {
  id: number;
  challenger_id: string;
  challenger_name: string;
  opponent_id: string;
  opponent_name: string;
  challenger_driver: string;
  opponent_driver: string;
  race_duration: number;
  races_completed: number;
  challenger_points: number;
  opponent_points: number;
  status: 'pending' | 'active' | 'completed' | 'declined';
  created_at: string;
}

interface LeaderboardUser {
  id: string;
  username: string;
  total_score: number;
}

interface LeagueOption {
  id: number;
  name: string;
}

export default function RivalriesPage() {
  const router = useRouter(); 
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [opponents, setOpponents] = useState<LeaderboardUser[]>([]);
  const [myLeagues, setMyLeagues] = useState<LeagueOption[]>([]);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Matchmaking State
  const [source, setSource] = useState<string>("global"); // "global", "friends", or league_id
  const [matchmakingLoading, setMatchmakingLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<LeaderboardUser | null>(null);
  
  // Accept challenge state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Rivalry | null>(null);
  const [acceptDriver, setAcceptDriver] = useState("");
  const [acceptLoading, setAcceptLoading] = useState(false);

  const supabase = useSupabase();

  const fetchRivalries = useCallback(async () => {
    const { data, error } = await supabase
      .from("rivalries")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setRivalries(data);
    }
  }, [supabase]);

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser({ id: authUser.id, email: authUser.email || "" });
          
          // Fetch User's Leagues
          const { data: leaguesData } = await supabase
            .from("league_members")
            .select("league_id, leagues(id, name)")
            .eq("user_id", authUser.id);
          
          if (leaguesData) {
            const leagueOptions = leaguesData.map((item: any) => ({
                id: item.leagues.id,
                name: item.leagues.name
            }));
            setMyLeagues(leagueOptions);
          }
        }
        await fetchRivalries();
        // Initial fetch of global opponents
        await fetchOpponents("global");
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [supabase, fetchRivalries]);

  // Fetch Opponents based on source
  const fetchOpponents = async (selectedSource: string) => {
    if (matchmakingLoading) return;
    setMatchmakingLoading(true);
    setOpponents([]);

    try {
        let data: any[] | null = null;

        if (selectedSource === "global") {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, username, total_score")
                .order("total_score", { ascending: false })
                .limit(20);
            data = profiles;
        } else if (selectedSource === "friends") {
             // Fetch friends (bidirectional check)
             const { data: friendships } = await supabase
                .from("friendships")
                .select("user_id, friend_id, status")
                .eq("status", "accepted")
                .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);
            
             if (friendships) {
                 const friendIds = friendships.map(f => f.user_id === user?.id ? f.friend_id : f.user_id);
                 if (friendIds.length > 0) {
                     const { data: friends } = await supabase
                        .from("profiles")
                        .select("id, username, total_score")
                        .in("id", friendIds);
                     data = friends;
                 }
             }
        } else {
            // It's a league ID
            const leagueId = parseInt(selectedSource);
            if (!isNaN(leagueId)) {
                const { data: members } = await supabase
                    .from("league_members")
                    .select("user_id")
                    .eq("league_id", leagueId);
                
                if (members && members.length > 0) {
                    const memberIds = members.map(m => m.user_id);
                    const { data: profiles } = await supabase
                        .from("profiles")
                        .select("id, username, total_score")
                        .in("id", memberIds);
                    data = profiles;
                }
            }
        }

        if (data) {
            // Filter out self
            setOpponents(data.filter(u => u.id !== user?.id));
        }
    } catch (err) {
        console.error("Opponent Fetch Error:", err);
    } finally {
        setMatchmakingLoading(false);
    }
  };

  const handleSourceChange = (newSource: string) => {
      setSource(newSource);
      fetchOpponents(newSource);
  };

  // Actions
  const handleDeclineChallenge = async (rivalryId: number) => {
    const { error } = await supabase
      .from("rivalries")
      .update({ status: 'declined' })
      .eq("id", rivalryId);

    if (error) {
      teamRadio.error("Failed to decline challenge");
    } else {
      teamRadio.info("Challenge declined");
      await fetchRivalries();
    }
  };

  const handleAcceptChallenge = async () => {
    if (!acceptDriver) {
      teamRadio.error("Select your champion driver first!");
      return;
    }
    if (!selectedChallenge) return;

    setAcceptLoading(true);

    try {
      const { error } = await supabase
        .from("rivalries")
        .update({
          opponent_driver: acceptDriver,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq("id", selectedChallenge.id);

      if (error) {
        teamRadio.error("Failed to accept challenge: " + error.message);
      } else {
        teamRadio.success(`Rivalry accepted! Game on! 🏁`);
        setShowAcceptModal(false);
        setSelectedChallenge(null);
        setAcceptDriver("");
        await fetchRivalries();
      }
    } catch (err) {
      console.error("Accept error:", err);
      teamRadio.error("Something went wrong");
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleChallengeUser = (opponent: LeaderboardUser) => {
    if (!user) {
      teamRadio.error("Please log in to challenge opponents");
      return;
    }
    setSelectedOpponent(opponent);
    setShowModal(true);
  };

  const openAcceptModal = (challenge: Rivalry) => {
    setSelectedChallenge(challenge);
    setAcceptDriver("");
    setShowAcceptModal(true);
  };

  // Filter lists
  const myRivalries = rivalries.filter(
    r => r.challenger_id === user?.id || r.opponent_id === user?.id
  );
  const pendingChallenges = myRivalries.filter(
    r => r.status === 'pending' && r.opponent_id === user?.id
  );
  const sentChallenges = myRivalries.filter(
    r => r.status === 'pending' && r.challenger_id === user?.id
  );
  const activeRivalries = myRivalries.filter(r => r.status === 'active');


  if (loading) return <LoadingSpinner message="Loading Rivalries..." />;

  const selectedTeam = acceptDriver ? getDriverTeam(acceptDriver) : null;
  const teamColor = selectedTeam ? TEAM_COLORS[selectedTeam] : "#66FCF1";

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      {/* Racing stripe */}
      <div className="fixed top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--f1-red)] via-[var(--f1-red)]/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <PageHeader 
            title="RIVALRIES" 
            highlight="HEAD-TO-HEAD" 
            badgeText="PvP Battles" 
            badgeVariant="red"
            description="Challenge opponents to head-to-head duels. Pick your champion driver and battle for supremacy!"
        />

        {/* Pending Challenges (Incoming) */}
        {pendingChallenges.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[var(--alert-red)] mb-6 flex items-center gap-3 animate-pulse">
                <span>🔥</span> INCOMING CHALLENGES ({pendingChallenges.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingChallenges.map(challenge => (
                <GlassCard 
                  key={challenge.id} 
                  className="p-6 border-l-4 border-l-[var(--alert-red)]"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--alert-red)]/20 flex items-center justify-center text-2xl">
                        ⚔️
                      </div>
                      <div>
                        <Link href={`/profile/${challenge.challenger_id}`} className="hover:underline hover:text-[var(--alert-red)] transition-colors">
                            <div className="font-bold text-lg text-white">{challenge.challenger_name}</div>
                        </Link>
                        <div className="text-sm text-[var(--text-muted)]">
                           Champions: <span className="text-white font-mono">{challenge.challenger_driver}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <F1Button 
                            onClick={() => openAcceptModal(challenge)}
                            variant="primary"
                            className="flex-1 py-2 text-sm"
                        >
                            Accept
                        </F1Button>
                        <F1Button 
                            onClick={() => handleDeclineChallenge(challenge.id)}
                            variant="ghost"
                            className="flex-1 py-2 text-sm"
                        >
                            Decline
                        </F1Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Sent Challenges */}
        {sentChallenges.length > 0 && (
           <div className="mb-12">
             <h2 className="text-lg font-bold text-[var(--text-muted)] mb-4 flex items-center gap-3">
                <span>⏳</span> WAITING FOR RESPONSE ({sentChallenges.length})
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
               {sentChallenges.map(challenge => (
                 <div key={challenge.id} className="p-4 rounded-lg bg-[var(--bg-onyx)] border border-[var(--glass-border)] flex items-center gap-3 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)] text-xs">
                        ⏱️
                    </div>
                    <div>
                        <Link href={`/profile/${challenge.opponent_id}`} className="hover:underline hover:text-[var(--accent-gold)] transition-colors">
                            <div className="text-sm font-bold text-white">{challenge.opponent_name}</div>
                        </Link>
                        <div className="text-xs text-[var(--text-muted)]">Challenge Sent</div>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* Active Rivalries */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="cyan" pulse>LIVE</Badge>
            <h2 className="text-2xl font-bold text-white">ACTIVE BATTLES</h2>
          </div>
          
          {activeRivalries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRivalries.map(rivalry => (
                <RivalryCard
                  key={rivalry.id}
                  player1={{
                    id: rivalry.challenger_id,
                    name: rivalry.challenger_name,
                    driver: rivalry.challenger_driver,
                    points: rivalry.challenger_points
                  }}
                  player2={{
                    id: rivalry.opponent_id,
                    name: rivalry.opponent_name,
                    driver: rivalry.opponent_driver || "",
                    points: rivalry.opponent_points
                  }}
                  races={rivalry.race_duration}
                  onChallenge={() => router.push(`/rivalries/${rivalry.id}`)}
                />
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <span className="text-5xl mb-4 block opacity-50">🏁</span>
              <p className="text-xl text-white font-bold mb-2">No Active Rivalries</p>
              <p className="text-[var(--text-muted)]">Challenge someone below to start a duel!</p>
            </GlassCard>
          )}
        </section>

        {/* === AD PLACEMENT === */}
        <div className="my-8">
          <AdUnit 
            slot="content_inline"
            format="horizontal"
            style={{ minHeight: "90px" }}
            label="Sponsored"
          />
        </div>

        {/* Matchmaking Section */}
        <section className="pt-8 border-t border-[var(--glass-border)]">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span>🎯</span> PROVING GROUNDS
            </h2>

            {/* Source Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1">
                    <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Find Opponents From</label>
                    <select 
                        value={source}
                        onChange={(e) => handleSourceChange(e.target.value)}
                        className="w-full md:w-auto min-w-[300px] p-3 rounded-lg bg-[var(--bg-onyx)] border border-[var(--glass-border)] text-white focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
                    >
                        <option value="global">🌍 Global Leaderboard</option>
                        <option value="friends">👥 My Friends</option>
                        <optgroup label="My Leagues">
                            {myLeagues.map(l => (
                                <option key={l.id} value={l.id}>🏆 {l.name}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* Opponent Grid */}
            {matchmakingLoading ? (
                <div className="py-20 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-[var(--text-muted)]">Scouting opponents...</p>
                </div>
            ) : opponents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {opponents.map((opponent, index) => (
                        <GlassCard 
                            key={opponent.id} 
                            interactive
                            className="p-4 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[var(--bg-graphite)] flex items-center justify-center font-bold text-[var(--text-muted)]">
                                    #{index + 1}
                                </div>
                                <div>
                                    <Link href={`/profile/${opponent.id}`} className="hover:underline hover:text-[var(--accent-cyan)] transition-colors">
                                        <div className="font-bold text-white text-lg">
                                            {opponent.username}
                                        </div>
                                    </Link>
                                    <div className="text-xs text-[var(--text-muted)] font-mono">
                                        {opponent.total_score} pts
                                    </div>
                                </div>
                            </div>
                            <F1Button 
                                onClick={() => handleChallengeUser(opponent)}
                                variant="secondary"
                                className="px-4 py-2 text-sm"
                            >
                                Challenge
                            </F1Button>
                        </GlassCard>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-[var(--bg-onyx)] rounded-xl border border-[var(--glass-border)] border-dashed">
                    <p className="text-[var(--text-muted)]">
                        No opponents found in {source === 'global' ? 'Global' : source === 'friends' ? 'Friends List' : 'this League'}.
                    </p>
                    {source === 'friends' && (
                        <p className="text-sm text-[var(--accent-cyan)] mt-2">Add friends to challenge them!</p>
                    )}
                </div>
            )}
        </section>

      </div>

      {/* Gauntlet Modal (Create Challenge) */}
      <GauntletModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOpponent(null);
        }}
        currentUser={{
          id: user?.id || "",
          name: user?.email?.split("@")[0] || "You"
        }}
        opponent={selectedOpponent ? {
          id: selectedOpponent.id,
          name: selectedOpponent.username
        } : undefined}
        onSuccess={fetchRivalries}
      />

      {/* Accept Challenge Modal - Keeping Custom UI for Drama */}
      {showAcceptModal && selectedChallenge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          <div className="absolute inset-0" onClick={() => setShowAcceptModal(false)} />
          
          <div className="relative z-10 w-full max-w-lg bg-[#1F2833] rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-fade-in-up">
            
            <div 
              className="p-6 border-b border-white/10"
              style={{ 
                background: `linear-gradient(135deg, ${teamColor}20 0%, transparent 100%)`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-4xl mb-2 block">⚔️</span>
                  <h2 className="font-orbitron text-2xl font-black text-white">
                    ACCEPT CHALLENGE
                  </h2>
                  <p className="font-mono text-sm text-gray-400 mt-1">
                    vs <span className="text-[var(--alert-red)] font-bold">{selectedChallenge.challenger_name}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowAcceptModal(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <p className="text-sm text-gray-400">
                  <span className="text-white font-bold">{selectedChallenge.challenger_name}</span> has picked 
                  <span className="text-[var(--accent-cyan)] font-bold"> {selectedChallenge.challenger_driver}</span> 
                  {" "}as their champion. Now pick yours!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  🏎️ Select Your Champion Driver
                </label>
                <select
                  value={acceptDriver}
                  onChange={(e) => setAcceptDriver(e.target.value)}
                  className="w-full p-4 bg-[#0B0C10] border border-gray-700 rounded-xl text-white focus:border-[var(--success-green)] outline-none appearance-none text-lg font-mono"
                  style={{ 
                    borderColor: acceptDriver ? teamColor : undefined,
                    boxShadow: acceptDriver ? `0 0 10px ${teamColor}40` : undefined
                  }}
                >
                  <option value="">Choose a driver...</option>
                  {DRIVERS_2026.map(driver => (
                    <option key={driver} value={driver}>{driver}</option>
                  ))}
                </select>
                
                {acceptDriver && (
                  <div 
                    className="mt-2 px-3 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-bold"
                    style={{ backgroundColor: `${teamColor}30`, color: teamColor }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
                    {selectedTeam}
                  </div>
                )}
              </div>

              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                 <p className="text-xs text-gray-400 leading-relaxed">
                   <span className="text-white font-bold">Rivalry Terms:</span> {selectedChallenge.race_duration} races. 
                   Points tallied from prediction scores. May the best predictor win! 🏆
                 </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20">
              <div className="flex gap-3">
                <F1Button
                  onClick={() => setShowAcceptModal(false)}
                  variant="ghost"
                  className="flex-1"
                >
                  Cancel
                </F1Button>
                <F1Button
                  onClick={handleAcceptChallenge}
                  disabled={acceptLoading || !acceptDriver}
                  variant="primary"
                  className="flex-1"
                >
                   {acceptLoading ? "Accepting..." : "⚔️ Accept & Fight!"}
                </F1Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
