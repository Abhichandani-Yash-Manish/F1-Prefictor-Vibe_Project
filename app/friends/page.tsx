"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { config } from "../../lib/config";
import LoadingSpinner from "../components/LoadingSpinner";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Friend {
  friendship_id: number;
  friend_id: string;
  username: string;
  total_score: number;
  accepted_at: string;
}

interface PendingRequest {
  id: number;
  user_id?: string;
  friend_id?: string;
  created_at: string;
  profiles?: { username: string };
}

interface SearchResult {
  id: string;
  username: string;
  total_score: number;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<PendingRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "add">("friends");

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${config.apiUrl}/friends`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
        setPendingReceived(data.pending_received || []);
        setPendingSent(data.pending_sent || []);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearchLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${config.apiUrl}/users/search?q=${encodeURIComponent(searchQuery)}`,
        { headers: { "Authorization": `Bearer ${session.access_token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (username: string) => {
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${config.apiUrl}/friends/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setSearchResults(searchResults.filter(u => u.username !== username));
        fetchFriends();
      } else {
        setError(data.detail || "Failed to send request");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${config.apiUrl}/friends/${friendshipId}/accept`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        setSuccess("Friend request accepted!");
        fetchFriends();
      }
    } catch (err) {
      console.error("Error accepting:", err);
    }
  };

  const handleDeclineRequest = async (friendshipId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`${config.apiUrl}/friends/${friendshipId}/decline`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      fetchFriends();
    } catch (err) {
      console.error("Error declining:", err);
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    if (!confirm("Remove this friend?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`${config.apiUrl}/friends/${friendshipId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      fetchFriends();
    } catch (err) {
      console.error("Error removing:", err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Friends..." />;

  const tabs = [
    { key: "friends", label: `Friends (${friends.length})`, icon: "👥" },
    { key: "requests", label: "Requests", icon: "📨", badge: pendingReceived.length },
    { key: "add", label: "Add Friend", icon: "➕" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      {/* Racing stripe */}
      <div className="fixed top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--accent-gold)] via-[var(--accent-gold)]/50 to-transparent" />
      
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="badge badge-gold mb-4">Social</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            Friends
          </h1>
          <p className="text-[var(--text-muted)] max-w-md mx-auto">
            Connect with other predictors, challenge rivals, and climb together.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 p-1 bg-[var(--bg-onyx)] rounded-xl border border-[var(--glass-border)]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all relative ${
                activeTab === tab.key
                  ? "bg-[var(--accent-gold)] text-black"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--f1-red)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-[var(--f1-red-dim)] border border-[var(--f1-red)]/30 text-[var(--f1-red)] text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-[rgba(16,185,129,0.12)] border border-[var(--status-success)]/30 text-[var(--status-success)] text-sm">
            {success}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div className="glass-card overflow-hidden">
            {friends.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4 opacity-40">👥</div>
                <h3 className="text-xl font-bold text-white mb-2">No friends yet</h3>
                <p className="text-[var(--text-muted)] mb-4">Start building your racing network!</p>
                <button onClick={() => setActiveTab("add")} className="btn-gold px-6 py-3">
                  Add Friends
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--glass-border)]">
                {friends.map((friend) => (
                  <div key={friend.friendship_id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-graphite)] transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold)]/60 rounded-xl flex items-center justify-center text-black font-bold text-lg">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{friend.username}</div>
                        <div className="text-sm text-[var(--text-muted)]">
                          <span className="font-mono text-[var(--accent-cyan)]">{friend.total_score}</span> pts
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFriend(friend.friendship_id)} className="text-[var(--text-subtle)] hover:text-[var(--f1-red)] transition text-sm">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            {/* Received */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📥</span> Received ({pendingReceived.length})
              </h3>
              {pendingReceived.length === 0 ? (
                <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                  No pending requests
                </div>
              ) : (
                <div className="glass-card overflow-hidden divide-y divide-[var(--glass-border)]">
                  {pendingReceived.map((req) => (
                    <div key={req.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--accent-gold-dim)] rounded-full flex items-center justify-center text-[var(--accent-gold)]">
                          {req.profiles?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="font-bold text-white">{req.profiles?.username}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptRequest(req.id)} className="btn-teal px-4 py-2 text-sm">
                          Accept
                        </button>
                        <button onClick={() => handleDeclineRequest(req.id)} className="btn-ghost px-4 py-2 text-sm border border-[var(--glass-border)]">
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📤</span> Sent ({pendingSent.length})
              </h3>
              {pendingSent.length === 0 ? (
                <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                  No pending requests sent
                </div>
              ) : (
                <div className="glass-card overflow-hidden divide-y divide-[var(--glass-border)]">
                  {pendingSent.map((req) => (
                    <div key={req.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--bg-graphite)] rounded-full flex items-center justify-center text-[var(--text-muted)]">
                          {req.profiles?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-[var(--text-muted)]">{req.profiles?.username}</span>
                      </div>
                      <span className="text-sm text-[var(--status-warning)]">Pending...</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Friend Tab */}
        {activeTab === "add" && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Search for users</h3>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by username..."
                className="flex-1"
              />
              <button onClick={handleSearch} disabled={searchLoading || searchQuery.length < 2} className="btn-gold px-6 py-3">
                {searchLoading ? "..." : "Search"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="divide-y divide-[var(--glass-border)] border border-[var(--glass-border)] rounded-xl overflow-hidden">
                {searchResults.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-graphite)] transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--bg-graphite)] rounded-full flex items-center justify-center text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.username}</div>
                        <div className="text-xs text-[var(--text-muted)]">{user.total_score} pts</div>
                      </div>
                    </div>
                    <button onClick={() => handleSendRequest(user.username)} className="btn-gold px-4 py-2 text-sm">
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
              <div className="text-center text-[var(--text-muted)] py-8">
                No users found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
