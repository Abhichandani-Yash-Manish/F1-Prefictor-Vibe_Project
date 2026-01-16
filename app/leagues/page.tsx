"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { api } from "../../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import F1Button from "../components/ui/F1Button";
import PageHeader from "../components/ui/PageHeader";

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

  if (loading) return <LoadingSpinner message="Loading Leagues..." />;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <PageHeader 
              title="Leagues" 
              highlight="" 
              badgeText="Compete" 
              badgeVariant="gold"
              description="Join prediction leagues to compete with friends and rivals. Create your own or explore public leagues."
            />
          </div>
          <F1Button 
            href="/leagues/create"
            variant="gold"
            className="shrink-0"
            icon="+"
          >
            Create League
          </F1Button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--f1-red-dim)] border border-[var(--f1-red)]/30 text-[var(--f1-red)] text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-[rgba(16,185,129,0.12)] border border-[var(--status-success)]/30 text-[var(--status-success)] text-sm">
            {success}
          </div>
        )}

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="mb-10 telemetry-panel p-6">
            <h2 className="text-lg font-bold text-[var(--accent-gold)] mb-4 flex items-center gap-2">
              <span>✉️</span> Pending Invites
            </h2>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between bg-[var(--bg-onyx)] p-4 rounded-xl border border-[var(--glass-border)]">
                  <div>
                    <div className="font-semibold text-white">{invite.league_name}</div>
                    <div className="text-sm text-[var(--text-muted)]">From {invite.inviter_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.id)}
                      className="btn-teal px-4 py-2 text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                      className="btn-ghost px-4 py-2 text-sm border border-[var(--glass-border)]"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join with Invite Code */}
        <GlassCard className="mb-10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🔗</span> Join with Invite Code
          </h2>
          <form onSubmit={handleJoinLeague} className="flex gap-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-character code"
              className="flex-1 px-4 py-3 uppercase tracking-[0.15em] text-center font-mono rounded-lg bg-[var(--bg-onyx)] border border-[var(--glass-border)] text-white focus:outline-none focus:border-[var(--accent-gold)]"
              maxLength={8}
            />
            <F1Button
              type="submit"
              disabled={joinLoading || !inviteCode.trim()}
              variant="primary"
              className="px-6 py-3"
            >
              {joinLoading ? "Joining..." : "Join"}
            </F1Button>
          </form>
        </GlassCard>

        {/* My Leagues */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🏆</span> My Leagues
          </h2>
          {myLeagues.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="text-4xl mb-4 opacity-40">🏁</div>
              <div className="text-[var(--text-muted)] mb-2">You haven't joined any leagues yet.</div>
              <div className="text-sm text-[var(--text-subtle)]">Create your own or join with an invite code!</div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myLeagues.map((membership) => (
                <Link 
                  key={membership.league_id}
                  href={`/leagues/${membership.league_id}`}
                  className="group telemetry-panel p-6 hover:border-[var(--accent-gold)]/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-white group-hover:text-[var(--accent-gold)] transition-colors">
                      {membership.leagues.name}
                    </h3>
                    <span className={`badge ${
                      membership.role === 'owner' ? 'badge-gold' :
                      membership.role === 'admin' ? 'badge-cyan' :
                      'bg-[var(--bg-graphite)] text-[var(--text-muted)] border border-[var(--glass-border)]'
                    }`}>
                      {membership.role}
                    </span>
                  </div>
                  <p className="text-[var(--text-muted)] text-sm mb-4 line-clamp-2">
                    {membership.leagues.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--accent-cyan)] font-bold font-mono">{membership.season_points} pts</span>
                    <span className="text-[var(--text-subtle)]">
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
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🌐</span> Discover Public Leagues
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicLeagues.map((league) => (
                <GlassCard 
                  key={league.id}
                  className="p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-white">{league.name}</h3>
                    <Badge variant="cyan">Public</Badge>
                  </div>
                  <p className="text-[var(--text-muted)] text-sm mb-4 line-clamp-2">
                    {league.description || "No description"}
                  </p>
                  <F1Button
                    onClick={() => setInviteCode(league.invite_code)}
                    variant="secondary"
                    className="w-full py-2.5 text-sm"
                  >
                    Join League
                  </F1Button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
