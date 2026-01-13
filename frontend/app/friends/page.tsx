"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
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
        `${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        }
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/request`, {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/${friendshipId}/accept`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
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

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/${friendshipId}/decline`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
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

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/${friendshipId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      fetchFriends();
    } catch (err) {
      console.error("Error removing:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white font-orbitron animate-pulse text-xl tracking-widest">
          LOADING FRIENDS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-black font-orbitron text-white tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">FRIENDS</span>
          </h1>
          <p className="text-gray-500">
            Connect with other predictors, challenge rivals, and invite friends to leagues
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-gray-900/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === "friends"
                ? "bg-purple-600 text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            👥 Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all relative ${
              activeTab === "requests"
                ? "bg-purple-600 text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            📨 Requests
            {pendingReceived.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingReceived.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === "add"
                ? "bg-purple-600 text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            ➕ Add Friend
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Friends List Tab */}
        {activeTab === "friends" && (
          <div className="bg-[#121418] border border-gray-800 rounded-2xl overflow-hidden">
            {friends.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-white mb-2">No friends yet</h3>
                <p className="text-gray-500 mb-4">Search for users and send friend requests!</p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Add Friends
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {friends.map((friend) => (
                  <div key={friend.friendship_id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-xl font-bold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{friend.username}</div>
                        <div className="text-sm text-gray-500">
                          <span className="font-mono text-purple-400">{friend.total_score}</span> pts
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemoveFriend(friend.friendship_id)}
                        className="text-gray-500 hover:text-red-400 transition text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            {/* Received Requests */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                📥 Received Requests ({pendingReceived.length})
              </h3>
              {pendingReceived.length === 0 ? (
                <div className="bg-[#121418] border border-gray-800 rounded-xl p-6 text-center text-gray-500">
                  No pending requests
                </div>
              ) : (
                <div className="bg-[#121418] border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                  {pendingReceived.map((req) => (
                    <div key={req.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-400">
                          {req.profiles?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="font-bold text-white">{req.profiles?.username}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                📤 Sent Requests ({pendingSent.length})
              </h3>
              {pendingSent.length === 0 ? (
                <div className="bg-[#121418] border border-gray-800 rounded-xl p-6 text-center text-gray-500">
                  No pending requests sent
                </div>
              ) : (
                <div className="bg-[#121418] border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                  {pendingSent.map((req) => (
                    <div key={req.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                          {req.profiles?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-gray-400">{req.profiles?.username}</span>
                      </div>
                      <span className="text-sm text-yellow-500">Pending...</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Friend Tab */}
        {activeTab === "add" && (
          <div className="bg-[#121418] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Search for users</h3>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by username..."
                className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading || searchQuery.length < 2}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                {searchLoading ? "..." : "Search"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden">
                {searchResults.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.total_score} pts</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user.username)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
              <div className="text-center text-gray-500 py-8">
                No users found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
