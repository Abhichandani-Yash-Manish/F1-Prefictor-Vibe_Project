"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateLeaguePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [maxMembers, setMaxMembers] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || name.length < 3) {
      setError("League name must be at least 3 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to create a league");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          max_members: maxMembers
        })
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/leagues/${data.league.id}`);
      } else {
        setError(data.detail || "Failed to create league");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/leagues" className="text-gray-500 hover:text-white transition flex items-center gap-2 mb-4">
            ← Back to Leagues
          </Link>
          <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white tracking-tighter">
            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">League</span>
          </h1>
          <p className="text-gray-500 mt-2">Set up your own prediction league and invite friends to compete!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#121418] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* League Name */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              League Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Office Pit Lane Crew"
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              maxLength={50}
              required
            />
            <div className="text-xs text-gray-600 mt-1">{name.length}/50 characters</div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell members what this league is about..."
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 resize-none h-24"
              maxLength={250}
            />
            <div className="text-xs text-gray-600 mt-1">{description.length}/250 characters</div>
          </div>

          {/* Visibility Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Visibility
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                  !isPublic 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                    : 'border-gray-700 text-gray-500 hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">🔒</div>
                <div className="font-bold">Private</div>
                <div className="text-xs text-gray-500 mt-1">Invite-only</div>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                  isPublic 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                    : 'border-gray-700 text-gray-500 hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">🌐</div>
                <div className="font-bold">Public</div>
                <div className="text-xs text-gray-500 mt-1">Discoverable</div>
              </button>
            </div>
          </div>

          {/* Max Members Slider */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Max Members: <span className="text-emerald-400">{maxMembers}</span>
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>5</span>
              <span>200</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 font-orbitron tracking-wider text-lg shadow-lg shadow-emerald-500/20"
          >
            {loading ? "CREATING..." : "CREATE LEAGUE"}
          </button>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-sm text-gray-500">
            <strong className="text-gray-400">💡 Pro Tip:</strong> Once created, you'll get a unique invite code to share with friends. 
            You can also invite them directly by username!
          </div>
        </form>
      </div>
    </div>
  );
}
