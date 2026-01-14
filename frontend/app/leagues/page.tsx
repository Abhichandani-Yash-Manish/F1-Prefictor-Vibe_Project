"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { api } from "../../lib/api";

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

      const result = await api.get<{ my_leagues: MyLeague[]; public_leagues: League[] }>(
        '/leagues',
        session.access_token
      );

      if (result.ok) {
        setMyLeagues(result.data.my_leagues || []);
        setPublicLeagues(result.data.public_leagues || []);
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

      const result = await api.get<{ invites: any[] }>('/invites', session.access_token);

      if (result.ok) {
        setPendingInvites(result.data.invites || []);
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
        setJoinLoading(false);
        return;
      }

      const result = await api.post<{ league?: { name: string } }>(
        '/leagues/join',
        { invite_code: inviteCode.toUpperCase() },
        session.access_token
      );

      if (result.ok) {
        setSuccess(`Successfully joined ${result.data.league?.name || "the league"}!`);
        setInviteCode("");
        fetchLeagues();
      } else {
        setError(result.error || "Failed to join league");
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

      const result = await api.post(`/invites/${inviteId}/accept`, {}, session.access_token);

      if (result.ok) {
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

      await api.post(`/invites/${inviteId}/decline`, {}, session.access_token);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-black font-orbitron text-white tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">LEAGUES</span>
            </h1>
            <p className="text-gray-500 mt-2">Compete with friends and rivals in private prediction leagues</p>
          </div>
          <Link 
            href="/leagues/create"
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all font-orbitron text-sm tracking-wider"
          >
            + CREATE LEAGUE
          </Link>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400">
            {success}
          </div>
        )}

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-amber-400 mb-4 font-orbitron">PENDING INVITES</h2>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between bg-black/30 p-4 rounded-lg">
                  <div>
                    <div className="font-bold">{invite.league_name}</div>
                    <div className="text-sm text-gray-500">Invited by {invite.inviter_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                      className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join League with Code */}
        <div className="mb-8 bg-[#121418] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 font-orbitron">JOIN WITH INVITE CODE</h2>
          <form onSubmit={handleJoinLeague} className="flex gap-4">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-character code"
              className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 uppercase tracking-widest"
              maxLength={8}
            />
            <button
              type="submit"
              disabled={joinLoading || !inviteCode.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all font-orbitron text-sm"
            >
              {joinLoading ? "JOINING..." : "JOIN"}
            </button>
          </form>
        </div>

        {/* My Leagues */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">MY LEAGUES</h2>
          {myLeagues.length === 0 ? (
            <div className="bg-[#121418] border border-gray-800 rounded-2xl p-8 text-center">
              <div className="text-gray-500">You haven't joined any leagues yet.</div>
              <div className="text-gray-600 text-sm mt-2">Create your own or join with an invite code!</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myLeagues.map((membership) => (
                <Link 
                  key={membership.league_id}
                  href={`/leagues/${membership.league_id}`}
                  className="bg-[#121418] border border-gray-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg group-hover:text-amber-400 transition-colors">
                      {membership.leagues.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      membership.role === 'owner' ? 'bg-amber-500/20 text-amber-400' :
                      membership.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {membership.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {membership.leagues.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-400 font-bold">{membership.season_points} pts</span>
                    <span className="text-gray-600">
                      {membership.leagues.is_public ? "Public" : "Private"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Public Leagues */}
        {publicLeagues.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">DISCOVER LEAGUES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicLeagues.map((league) => (
                <div 
                  key={league.id}
                  className="bg-[#121418] border border-gray-800 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg">{league.name}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                      PUBLIC
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {league.description || "No description"}
                  </p>
                  <button
                    onClick={() => {
                      setInviteCode(league.invite_code);
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    JOIN LEAGUE
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
