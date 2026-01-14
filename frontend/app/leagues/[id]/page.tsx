"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";
import LeagueChat from "../../components/LeagueChat";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface League {
  id: number;
  name: string;
  description: string | null;
  invite_code: string;
  is_public: boolean;
  max_members: number;
  owner_id: string;
  created_at: string;
}

interface Standing {
  position: number;
  user_id: string;
  username: string;
  role: string;
  season_points: number;
  joined_at: string;
}

export default function LeagueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    fetchLeagueData();
  }, [leagueId]);

  const fetchLeagueData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      setCurrentUserId(session.user.id);

      const result = await api.get<{ league: League; standings: Standing[] }>(
        `/leagues/${leagueId}/standings`,
        session.access_token
      );

      if (result.ok) {
        setLeague(result.data.league);
        setStandings(result.data.standings || []);
        setIsMember(result.data.standings?.some((s: Standing) => s.user_id === session.user.id) || false);
      } else if (result.status === 403) {
        setError("You don't have access to this private league");
      } else if (result.status === 404) {
        setError("League not found");
      } else {
        setError(result.error || "Failed to load league");
      }
    } catch (err) {
      console.error("Error fetching league:", err);
      setError("Failed to load league data");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (league?.invite_code) {
      navigator.clipboard.writeText(league.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;

    setInviteLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const result = await api.post<{ message: string }>(
        `/leagues/${leagueId}/invite`,
        { username_or_email: inviteUsername.trim() },
        session.access_token
      );

      if (result.ok) {
        setSuccess(result.data.message);
        setInviteUsername("");
        setShowInviteModal(false);
      } else {
        setError(result.error || "Failed to send invite");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleLeaveLeague = async () => {
    if (!confirm("Are you sure you want to leave this league?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const result = await api.post(`/leagues/${leagueId}/leave`, {}, session.access_token);

      if (result.ok) {
        router.push("/leagues");
      } else {
        setError(result.error || "Failed to leave league");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleDeleteLeague = async () => {
    if (!confirm("Are you sure you want to DELETE this league? This action cannot be undone!")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const result = await api.delete(`/leagues/${leagueId}`, session.access_token);

      if (result.ok) {
        router.push("/leagues");
      } else {
        setError(result.error || "Failed to delete league");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const isOwner = league?.owner_id === currentUserId;
  const isGlobalLeague = league?.invite_code === "F1APEX2026";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white font-orbitron animate-pulse text-xl tracking-widest">
          LOADING LEAGUE DATA...
        </div>
      </div>
    );
  }

  if (error && !league) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">{error}</h1>
        <Link href="/leagues" className="text-emerald-400 hover:underline mt-4">
          ← Back to Leagues
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link href="/leagues" className="text-gray-500 hover:text-white transition flex items-center gap-2 mb-6">
          ← Back to Leagues
        </Link>

        {/* League Header */}
        <div className="bg-[#121418] border border-gray-800 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-black font-orbitron text-white">
                  {league?.name}
                </h1>
                {isGlobalLeague && <span className="text-3xl">🌐</span>}
                {isOwner && !isGlobalLeague && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full font-bold uppercase">
                    Owner
                  </span>
                )}
              </div>
              {league?.description && (
                <p className="text-gray-400 mt-2 max-w-2xl">{league.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  👥 {standings.length} / {league?.max_members} members
                </span>
                <span className="flex items-center gap-2">
                  {league?.is_public ? '🌐 Public' : '🔒 Private'}
                </span>
              </div>
            </div>

            {/* Invite Code Box */}
            {isMember && (
              <div className="bg-black/50 border border-gray-700 rounded-xl p-4 text-center min-w-[200px]">
                <div className="text-xs text-gray-500 uppercase mb-1">Invite Code</div>
                <div className="font-mono text-2xl tracking-widest text-emerald-400 mb-2">
                  {league?.invite_code}
                </div>
                <button
                  onClick={handleCopyInviteCode}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded transition"
                >
                  {copied ? "Copied! ✓" : "Copy Code"}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isMember && (
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-800">
              {isOwner && (
                <Link
                  href={`/leagues/${leagueId}/manage`}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
                >
                  <span>⚙️</span> Manage League
                </Link>
              )}
              
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <span>📨</span> Invite Friends
              </button>
              
              {!isGlobalLeague && !isOwner && (
                <button
                  onClick={handleLeaveLeague}
                  className="bg-gray-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Leave League
                </button>
              )}

              {isOwner && !isGlobalLeague && (
                <button
                  onClick={handleDeleteLeague}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Delete League
                </button>
              )}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">
              {success}
            </div>
          )}
        </div>

        {/* Standings Table */}
        <div className="bg-[#121418] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-3">
              <span className="text-3xl">🏆</span> League Standings
            </h2>
          </div>

          {standings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No members yet. Be the first to make a prediction!
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-black text-gray-500 text-xs uppercase tracking-[0.2em] font-bold font-orbitron">
                  <th className="p-4 text-center w-20">Pos</th>
                  <th className="p-4 text-left">Predictor</th>
                  <th className="p-4 text-center hidden md:table-cell">Role</th>
                  <th className="p-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing, idx) => (
                  <tr 
                    key={standing.user_id}
                    className={`border-t border-gray-800/50 hover:bg-white/[0.02] transition ${
                      standing.user_id === currentUserId ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      {idx === 0 ? (
                        <span className="text-3xl">🥇</span>
                      ) : idx === 1 ? (
                        <span className="text-3xl">🥈</span>
                      ) : idx === 2 ? (
                        <span className="text-3xl">🥉</span>
                      ) : (
                        <span className="font-mono text-2xl font-bold text-gray-500">{standing.position}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-10 bg-gray-700 rounded-full" 
                          style={{
                            backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#f97316' : undefined
                          }}
                        />
                        <div>
                          <span className={`font-bold text-lg ${
                            standing.user_id === currentUserId ? 'text-emerald-400' : 'text-white'
                          }`}>
                            {standing.username}
                            {standing.user_id === currentUserId && ' (You)'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                        standing.role === 'owner' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : standing.role === 'admin'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {standing.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-mono text-2xl font-bold ${
                        idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-white'
                      }`}>
                        {standing.season_points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* League Chat */}
        {isMember && (
          <div className="mt-8">
            <LeagueChat 
              leagueId={parseInt(leagueId)} 
              isExpanded={showChat}
              onToggle={() => setShowChat(!showChat)}
            />
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121418] border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold font-orbitron text-white mb-4">
                Invite to {league?.name}
              </h3>
              
              <form onSubmit={handleInviteUser}>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 mb-4"
                />
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading || !inviteUsername.trim()}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    {inviteLoading ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
                Or share this invite code: <span className="font-mono text-emerald-400">{league?.invite_code}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
