"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";

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
        setLoading(false);
        return;
      }

      const result = await api.post<{ league: { id: number } }>(
        '/leagues',
        {
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          max_members: maxMembers
        },
        session.access_token
      );

      if (result.ok) {
        router.push(`/leagues/${result.data.league.id}`);
      } else {
        setError(result.error || "Failed to create league");
      }
    } catch (err: unknown) {
      console.error("League creation error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10">
          <Link href="/leagues" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors mb-6 text-sm">
            <span>←</span> Back to Leagues
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Create <span className="text-gradient-gold">League</span>
          </h1>
          <p className="text-[var(--text-muted)]">
            Set up your own prediction league and invite friends to compete.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10">
          
          {/* League Name */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] mb-3">
              League Name <span className="text-[var(--f1-red)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pit Lane Crew"
              className="w-full"
              maxLength={50}
              required
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[var(--text-subtle)]">Choose a memorable name</span>
              <span className="text-xs text-[var(--text-subtle)]">{name.length}/50</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] mb-3">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell members what this league is about..."
              className="w-full resize-none h-24"
              maxLength={250}
            />
            <div className="text-xs text-[var(--text-subtle)] text-right mt-2">{description.length}/250</div>
          </div>

          {/* Visibility */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] mb-4">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  !isPublic 
                    ? 'border-[var(--accent-gold)] bg-[var(--accent-gold-dim)]' 
                    : 'border-[var(--glass-border)] hover:border-[var(--glass-border-light)]'
                }`}
              >
                <div className="text-2xl mb-2">🔒</div>
                <div className={`font-semibold ${!isPublic ? 'text-[var(--accent-gold)]' : 'text-white'}`}>Private</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Invite only</div>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  isPublic 
                    ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan-dim)]' 
                    : 'border-[var(--glass-border)] hover:border-[var(--glass-border-light)]'
                }`}
              >
                <div className="text-2xl mb-2">🌐</div>
                <div className={`font-semibold ${isPublic ? 'text-[var(--accent-cyan)]' : 'text-white'}`}>Public</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Discoverable</div>
              </button>
            </div>
          </div>

          {/* Max Members */}
          <div className="mb-10">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] mb-4">
              Max Members: <span className="text-[var(--accent-gold)] font-mono">{maxMembers}</span>
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--bg-graphite)] rounded-full appearance-none cursor-pointer accent-[var(--accent-gold)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-subtle)] mt-3">
              <span>5</span>
              <span>200</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--f1-red-dim)] border border-[var(--f1-red)]/30 text-[var(--f1-red)] text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full btn-gold py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create League"}
          </button>

          {/* Tip */}
          <div className="mt-8 p-4 rounded-xl bg-[var(--bg-graphite)] border border-[var(--glass-border)]">
            <div className="text-sm text-[var(--text-muted)]">
              <span className="text-[var(--accent-gold)]">💡</span> After creation, you'll receive a unique invite code to share with friends.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
