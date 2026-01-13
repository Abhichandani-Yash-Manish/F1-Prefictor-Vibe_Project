"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

// Initialize Supabase client
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

interface MyLeague {
  league_id: number;
  role: string;
  season_points: number;
  joined_at: string;
  leagues: League;
}

export default function LeaguesPage() {
  const [myLeagues, setMyLeagues] = useState<MyLeague[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  useEffect(() => {
    fetchLeagues();
    fetchInvites();
  }, []);

  const fetchLeagues = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyLeagues(data.my_leagues || []);
        setPublicLeagues(data.public_leagues || []);
      }
    } catch (err) {
      console.error("Error fetching leagues:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingInvites(data.invites || []);
      }
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoinLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to join a league");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ invite_code: inviteCode.toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully joined ${data.league?.name || "the league"}!`);
        setInviteCode("");
        fetchLeagues();
      } else {
        setError(data.detail || "Failed to join league");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/${inviteId}/accept`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        setSuccess("Successfully joined the league!");
        fetchLeagues();
        fetchInvites();
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
    }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/${inviteId}/decline`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      fetchInvites();
    } catch (err) {
      console.error("Error declining invite:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white font-orbitron animate-pulse text-xl tracking-widest">
          LOADING LEAGUES...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center border-b-4 border-emerald-600 pb-10 bg-gradient-to-b from-gray-900/50 to-transparent pt-10 rounded-t-3xl">
          <h1 className="text-5xl md:text-7xl font-black font-orbitron text-white tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            PREDICTION <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">LEAGUES</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Create your own league, invite friends, and compete for glory. Or discover public leagues and join the competition!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Join & Create */}
        <div className="space-y-6">
          {/* Join League Card */}
          <div className="bg-[#121418] border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold font-orbitron text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🔑</span> Join a League
            </h2>
            <form onSubmit={handleJoinLeague} className="space-y-4">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-lg tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 uppercase"
                maxLength={8}
              />
              <button
                type="submit"
                disabled={joinLoading || !inviteCode.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 font-orbitron tracking-wider"
              >
                {joinLoading ? "JOINING..." : "JOIN LEAGUE"}
              </button>
            </form>

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

          {/* Create League Card */}
          <Link href="/leagues/create">
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-700/50 rounded-2xl p-6 shadow-2xl hover:border-emerald-500 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-orbitron text-white mb-2 flex items-center gap-2">
                    <span className="text-2xl">➕</span> Create League
                  </h2>
                  <p className="text-gray-400 text-sm">Start your own prediction league and invite friends</p>
                </div>
                <div className="text-4xl group-hover:translate-x-2 transition-transform">→</div>
              </div>
            </div>
          </Link>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="bg-[#121418] border border-yellow-700/50 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold font-orbitron text-yellow-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">📨</span> Pending Invites ({pendingInvites.length})
              </h2>
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="bg-black/30 rounded-lg p-4 border border-gray-800">
                    <div className="font-bold text-white">{invite.leagues?.name}</div>
                    <div className="text-sm text-gray-500">From: {invite.profiles?.username}</div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAcceptInvite(invite.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2 px-4 rounded transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(invite.id)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center & Right: My Leagues */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold font-orbitron text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">🏆</span> My Leagues
          </h2>

          {myLeagues.length === 0 ? (
            <div className="bg-[#121418] border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🏁</div>
              <h3 className="text-xl font-bold text-white mb-2">No leagues yet</h3>
              <p className="text-gray-500 mb-6">Join a league with an invite code or create your own!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myLeagues.map((membership) => (
                <Link key={membership.league_id} href={`/leagues/${membership.league_id}`}>
                  <div className="bg-[#121418] border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold font-orbitron text-white group-hover:text-emerald-400 transition">
                          {membership.leagues?.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                          membership.role === 'owner' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : membership.role === 'admin'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {membership.role}
                        </span>
                      </div>
                      {membership.leagues?.invite_code === 'F1APEX2026' && (
                        <span className="text-2xl">🌐</span>
                      )}
                    </div>

                    {membership.leagues?.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {membership.leagues.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Your Points</div>
                        <div className="text-2xl font-mono font-bold text-emerald-400">
                          {membership.season_points || 0}
                        </div>
                      </div>
                      <div className="text-gray-600 group-hover:text-emerald-400 transition">
                        View →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Public Leagues Discovery */}
          {publicLeagues.filter(pl => !myLeagues.some(ml => ml.league_id === pl.id)).length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold font-orbitron text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🔍</span> Discover Public Leagues
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicLeagues
                  .filter(pl => !myLeagues.some(ml => ml.league_id === pl.id))
                  .map((league) => (
                    <Link key={league.id} href={`/leagues/${league.id}`}>
                      <div className="bg-[#121418] border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
                        <h3 className="text-lg font-bold font-orbitron text-white group-hover:text-blue-400 transition mb-2">
                          {league.name}
                        </h3>
                        {league.description && (
                          <p className="text-gray-500 text-sm line-clamp-2">{league.description}</p>
                        )}
                        <div className="mt-4 text-sm text-gray-600">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">PUBLIC</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
