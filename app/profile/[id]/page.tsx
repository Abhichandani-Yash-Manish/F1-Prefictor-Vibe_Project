"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useParams } from "next/navigation";
import GlassCard from "../../components/ui/GlassCard";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/LoadingSpinner";
import { DRIVERS_2026, getDriverTeam, TEAM_COLORS, getDriverNumber, getDriverName, TEAMS_2026 } from "../../lib/drivers";
import F1Button from "../../components/ui/F1Button";

import { Profile, UserAchievement, Prediction, LeagueMember, FriendRequest } from "../../lib/types";

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

export default function UserProfilePage() {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leagues, setLeagues] = useState<LeagueMember[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State (Only if currentUser.id === profile.id)
  const [isEditing, setIsEditing] = useState(false);
  const [editTeam, setEditTeam] = useState("");
  const [editDriver, setEditDriver] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const router = useRouter();
  const params = useParams();
  const supabase = useSupabase();
  const targetUserId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch Target Profile Stats
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", targetUserId)
            .single();
            
        if (profileError || !profileData) {
            console.error("Profile not found");
            // Handle not found?
            setLoading(false);
            return;
        }

        setProfile(profileData);
        
        // Init edit state (only if owning)
        if (user && user.id === targetUserId) {
            setEditTeam(profileData.favorite_team || "");
            setEditDriver(profileData.favorite_driver || "");
            setEditUsername(profileData.username || "");
            if (!profileData.favorite_team) setIsEditing(true);
        }

        // Fetch Achievements (Target User)
        const { data: achievementData } = await supabase
            .from("user_achievements")
            .select("*, achievements(*)")
            .eq("user_id", targetUserId);
        setAchievements(achievementData || []);

        // Fetch Recent Predictions (Target User)
        const { data: predictionData } = await supabase
            .from("predictions")
            .select("*, races(*)")
            .eq("user_id", targetUserId)
            .order("curr_created_at", { ascending: false, foreignTable: "races" })
            .limit(5);
        setPredictions(predictionData || []);

        // Fetch Leagues (Target User)
        const { data: leagueData } = await supabase
            .from("league_members")
            .select("*, leagues(*)")
            .eq("user_id", targetUserId);
        setLeagues(leagueData || []);

        // Fetch Friends (Target User)
        const { data: friendData } = await supabase
            .from("friendships")
            .select("*, friend:profiles!friend_id(*)")
            .eq("user_id", targetUserId)
            .eq("status", "accepted");
        setFriends(friendData || []);

        // Retroactive Checks (Only if viewing OWN profile)
        if (user && user.id === targetUserId && predictionData && predictionData.length > 0) {
            const hasFirstBadge = achievementData?.some((a: any) => a.achievement_id === 'first_prediction');
            if (!hasFirstBadge) {
               await supabase
                    .from('user_achievements')
                    .insert({ user_id: user.id, achievement_id: 'first_prediction' });
               // We don't verify result here for simplicity, next load will show it
            }
        }

      } catch (error) {
        console.error("Profile Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase, router, targetUserId]);

  const handleSaveProfile = async () => {
    if (!currentUser || currentUser.id !== targetUserId) return;
    setSaving(true);
    setMessage(null);

    try {
        const { error: profileError } = await supabase
            .from("profiles")
            .update({ 
                username: editUsername,
                favorite_team: editTeam,
                favorite_driver: editDriver
            })
            .eq("id", currentUser.id);

        if (profileError) throw profileError;

        if (newPassword) {
            if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
            const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
            if (authError) throw authError;
        }

        setProfile({ 
            ...profile!, 
            username: editUsername, 
            favorite_team: editTeam, 
            favorite_driver: editDriver 
        } as Profile);
        setIsEditing(false);
        setNewPassword("");
        setMessage({ text: "Profile updated successfully!", type: 'success' });
        router.refresh(); 

    } catch (error: any) {
        setMessage({ text: error.message || "Failed to update profile", type: 'error' });
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner variant="f1" message="Loading Profile Data..." />;
  if (!profile) return <div className="text-white text-center pt-32">Profile not found.</div>;

  const isOwner = currentUser?.id === targetUserId;

  // Display Logic
  const displayTeam = isEditing ? editTeam : profile.favorite_team;
  const displayDriver = isEditing ? editDriver : profile.favorite_driver;
  const teamColor = displayTeam ? TEAM_COLORS[displayTeam] : 'var(--accent-gold)';
  const driverNumber = displayDriver ? getDriverNumber(displayDriver) : null;
  const driverName = displayDriver ? getDriverName(displayDriver) : null;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
            
            {/* Header Section */}
            <div className="mb-12 flex flex-col md:flex-row items-center gap-8 relative">
                {/* Back / Cancel Edit */}
                {isEditing && (
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="absolute top-0 right-0 text-xs text-[var(--text-subtle)] hover:text-white"
                    >
                        Cancel
                    </button>
                )}

                <div className="relative group">
                    <div 
                        className="w-32 h-32 rounded-full p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500"
                        style={{ 
                            background: `linear-gradient(135deg, ${teamColor}, transparent)`,
                            boxShadow: `0 0 30px ${teamColor}40`
                        }}
                    >
                        <div className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center text-5xl font-bold text-white relative overflow-hidden">
                            {profile.username?.charAt(0).toUpperCase() || "R"}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10" />
                        </div>
                    </div>
                     
                     {driverNumber && (
                        <div 
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-[var(--bg-void)] shadow-lg z-10"
                            style={{ backgroundColor: teamColor, color: '#fff' }}
                            title={`Fan of ${driverName}`}
                        >
                            {driverNumber}
                        </div>
                     )}
                </div>
                
                <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-4xl font-black text-white tracking-tight">{profile.username || "Racer"}</h1>
                        {displayTeam && !isEditing && (
                            <Badge variant="outline" className="text-xs" style={{ borderColor: teamColor, color: teamColor }}>
                                {displayTeam.toUpperCase()} FAN
                            </Badge>
                        )}
                        {profile.is_admin && <Badge variant="gold" size="sm" icon="🛡️">ADMIN</Badge>}
                    </div>
                    
                    {!isEditing ? (
                        <>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[var(--text-muted)] font-mono text-sm">
                                <span>Joined {profile.created_at ? new Date(profile.created_at).getFullYear() : 2026}</span>
                                {!isOwner && <span>•</span>}
                                {/* Add Friend Button logic could go here */}
                            </div>
                            
                            {isOwner && (
                                <div className="mt-4 flex gap-3 justify-center md:justify-start">
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs text-[var(--accent-cyan)] hover:text-white hover:underline flex items-center gap-1"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="mt-4 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--accent-gold)]/30 animate-fade-in-up max-w-md">
                            <h3 className="text-sm font-bold text-[var(--accent-gold)] mb-4 uppercase tracking-wider">Edit Profile</h3>
                            
                            {message && (
                                <div className={`mb-4 p-2 rounded text-xs ${message.type === 'success' ? 'text-[var(--status-success)] bg-[var(--status-success)]/10' : 'text-[var(--f1-red)] bg-[var(--f1-red)]/10'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-[var(--text-subtle)] mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="w-full bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-lg p-2 text-white text-sm focus:border-[var(--accent-gold)] outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-[var(--text-subtle)] mb-1">Favorite Team</label>
                                        <select
                                            value={editTeam}
                                            onChange={(e) => { setEditTeam(e.target.value); setEditDriver(""); }}
                                            className="w-full bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-lg p-2 text-white text-sm appearance-none"
                                        >
                                            <option value="">Select...</option>
                                            {Object.keys(TEAM_COLORS).map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs text-[var(--text-subtle)] mb-1">Favorite Driver</label>
                                        <select
                                            value={editDriver}
                                            onChange={(e) => setEditDriver(e.target.value)}
                                            disabled={!editTeam}
                                            className="w-full bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-lg p-2 text-white text-sm disabled:opacity-50 appearance-none"
                                        >
                                            <option value="">Select...</option>
                                            {editTeam && TEAMS_2026[editTeam]?.map(d => (
                                                <option key={d.driver} value={d.driver}>{d.driver}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/5">
                                    <label className="block text-xs text-[var(--text-subtle)] mb-1">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-lg p-2 text-white text-sm focus:border-[var(--accent-gold)] outline-none"
                                    />
                                </div>

                                <F1Button onClick={handleSaveProfile} disabled={saving} className="w-full mt-2">
                                    {saving ? "Saving..." : "Save Profile"}
                                </F1Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <GlassCard className="p-6 text-center">
                    <div className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">Total Score</div>
                    <div className="text-4xl font-bold text-[var(--accent-gold)] font-mono text-glow-gold">{profile.total_score}</div>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                    <div className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">Current Streak</div>
                    <div className="text-4xl font-bold text-[var(--f1-red)] font-mono flex items-center justify-center gap-2">
                        {profile.current_streak || 0} <span className="text-xl">🔥</span>
                    </div>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                    <div className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">Achievements</div>
                    <div className="text-4xl font-bold text-[var(--accent-cyan)] font-mono">{achievements.length}</div>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                    <div className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">Predictions</div>
                    <div className="text-4xl font-bold text-white font-mono">{predictions.length}</div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COL: Trophies & Garages */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Trophy Case */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><span>🏆</span> TROPHY CASE</h2>
                         {achievements.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {achievements.map((ua) => (
                                    <GlassCard key={ua.achievement_id} className="p-4 flex items-center gap-4 hover:border-[var(--accent-gold)] transition-colors">
                                        <div className="w-16 h-16 rounded-xl bg-[var(--bg-onyx)] flex items-center justify-center text-3xl shadow-inner border border-white/5">
                                            {ua.achievements.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg">{ua.achievements.name}</div>
                                            <div className="text-xs text-[var(--text-muted)] mb-1">{ua.achievements.description}</div>
                                            <div className="text-[10px] text-[var(--accent-gold)] font-mono uppercase">
                                                Unlocked {new Date(ua.unlocked_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        ) : (
                            <GlassCard className="p-12 text-center border-dashed border-[var(--text-muted)]/30">
                                <div className="text-4xl opacity-30 mb-4">🔒</div>
                                <p className="text-[var(--text-muted)]">No trophies unlocked yet.</p>
                            </GlassCard>
                        )}
                    </div>

                    {/* Leagues */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><span>🏳️</span> GARAGES</h2>
                        {leagues.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {leagues.map((lm) => (
                                    <GlassCard key={lm.league_id} className="p-5 flex items-center justify-between group cursor-pointer hover:bg-white/5" interactive onClick={() => router.push(`/leagues/${lm.league_id}`)}>
                                        <div>
                                            <div className="font-bold text-white text-lg group-hover:text-[var(--accent-cyan)]">{lm.leagues.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" size="sm" className="text-[10px]">{lm.role.toUpperCase()}</Badge>
                                                <span className="text-xs text-[var(--text-muted)]">{lm.leagues.members_count || '?'} Members</span>
                                            </div>
                                        </div>
                                        <div className="text-2xl opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</div>
                                    </GlassCard>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 rounded-xl border border-white/5 bg-[var(--bg-surface)] text-center">
                                <p className="text-[var(--text-muted)]">{isOwner ? "Not in any leagues yet." : "User is not in any leagues."}</p>
                                {isOwner && <F1Button href="/leagues" variant="secondary" size="sm" className="mt-3">Find a League</F1Button>}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COL: Friends & History */}
                <div className="space-y-8">
                    {/* Friends */}
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                            <span>👥 PADDOCK</span>
                            <span className="text-xs font-normal text-[var(--accent-gold)]">{friends.length} Friends</span>
                        </h3>
                        {friends.length > 0 ? (
                            <div className="space-y-3">
                                {friends.map((f) => (
                                    <div key={f.friend_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/profile/${f.friend_id}`)}>
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                                            style={{ backgroundColor: f.friend?.favorite_team ? TEAM_COLORS[f.friend.favorite_team] : '#fff' }}
                                        >
                                            {f.friend?.username?.[0]?.toUpperCase() || 'F'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-white truncate">{f.friend?.username || 'Unknown'}</div>
                                            <div className="text-[10px] text-[var(--text-subtle)] truncate">{f.friend?.favorite_team || 'Free Agent'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-xs text-[var(--text-muted)]">No friends details available.</div>
                        )}
                    </GlassCard>

                     {/* History */}
                     <GlassCard className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span>📜</span> HISTORY</h3>
                        <div className="space-y-4">
                            {predictions.length > 0 ? predictions.map((pred, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-onyx)] border border-[var(--glass-border)]">
                                    <div className="text-[10px] font-bold text-[var(--text-muted)] font-mono text-center leading-tight">
                                        RACE<br/><span className="text-white text-sm">{i+1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white truncate">{pred.races?.name || "Unknown GP"}</div>
                                        <div className="text-xs text-[var(--accent-cyan)] font-mono">{pred.manual_score || 0} Pts</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-[var(--text-muted)] text-sm italic py-2">No recent history.</div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    </div>
  );
}
