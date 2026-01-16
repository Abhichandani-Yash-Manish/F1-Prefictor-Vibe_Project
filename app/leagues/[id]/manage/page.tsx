"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { config } from "../../../../lib/config";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Prediction {
  id: number;
  user_id: string;
  race_id: number;
  wild_prediction: string;
  biggest_flop: string;
  biggest_surprise: string;
  profiles?: { username: string };
  races?: { name: string };
  league_grade?: {
    wild_points: number;
    flop_points: number;
    surprise_points: number;
    notes: string;
  };
}

interface Race {
  id: number;
  name: string;
  race_time: string;
}

interface Member {
  user_id: string;
  role: string;
  season_points: number;
  joined_at: string;
  profiles?: { username: string };
}

export default function LeagueManagePage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [activeTab, setActiveTab] = useState<"grading" | "members" | "activity">("grading");
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [leagueName, setLeagueName] = useState("");
  
  // Grading state
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [gradingQueue, setGradingQueue] = useState<Prediction[]>([]);
  const [ungradedCount, setUngradedCount] = useState(0);
  
  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  
  // Activity state
  const [activity, setActivity] = useState<any[]>([]);
  
  const [status, setStatus] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkPermissions();
    fetchRaces();
  }, [leagueId]);

  const checkPermissions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Check if user can manage this league
      const { data: member } = await supabase
        .from("league_members")
        .select("role, leagues(name)")
        .eq("league_id", parseInt(leagueId))
        .eq("user_id", session.user.id)
        .single();

      if (member && ["owner", "admin", "grader"].includes(member.role)) {
        setCanManage(true);
        setLeagueName((member.leagues as any)?.name || "League");
      } else {
        // Check global admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.is_admin) {
          setCanManage(true);
          // Fetch league name
          const { data: league } = await supabase.from("leagues").select("name").eq("id", parseInt(leagueId)).single();
          setLeagueName(league?.name || "League");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRaces = async () => {
    const { data } = await supabase
      .from("races")
      .select("id, name, race_time")
      .order("race_time", { ascending: false });
    if (data) setRaces(data);
  };

  const fetchPredictions = async (raceId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(
      `${config.apiUrl}/leagues/${leagueId}/predictions/${raceId}`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      setPredictions(data.predictions || []);
    }
  };

  const fetchGradingQueue = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(
      `${config.apiUrl}/leagues/${leagueId}/grading-queue`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      setGradingQueue(data.predictions || []);
      setUngradedCount(data.ungraded_count || 0);
    }
  };

  const fetchMembers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(
      `${config.apiUrl}/leagues/${leagueId}/members`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      setMembers(data.members || []);
    }
  };

  const fetchActivity = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(
      `${config.apiUrl}/leagues/${leagueId}/activity`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      setActivity(data.activity || []);
    }
  };

  useEffect(() => {
    if (canManage) {
      if (activeTab === "grading") {
        fetchGradingQueue();
      } else if (activeTab === "members") {
        fetchMembers();
      } else if (activeTab === "activity") {
        fetchActivity();
      }
    }
  }, [activeTab, canManage]);

  useEffect(() => {
    if (selectedRaceId) {
      fetchPredictions(selectedRaceId);
    }
  }, [selectedRaceId]);

  const handleGrade = async (predictionId: number, wildPts: number, flopPts: number, surprisePts: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(
      `${config.apiUrl}/leagues/${leagueId}/grade`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prediction_id: predictionId,
          wild_points: wildPts,
          flop_points: flopPts,
          surprise_points: surprisePts
        })
      }
    );

    if (response.ok) {
      setStatus("✅ Grade saved!");
      setTimeout(() => setStatus(""), 2000);
      // Refresh
      if (selectedRaceId) fetchPredictions(selectedRaceId);
      fetchGradingQueue();
    }
  };

  const handleSyncPoints = async () => {
    setSyncing(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(
      `${config.apiUrl}/leagues/${leagueId}/sync-points`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      setStatus(`✅ ${data.message}`);
      fetchMembers();
    } else {
      setStatus("❌ Sync failed");
    }
    setSyncing(false);
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from("league_members")
      .update({ role: newRole })
      .eq("league_id", parseInt(leagueId))
      .eq("user_id", memberId);

    if (!error) {
      fetchMembers();
      setStatus("✅ Role updated");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white font-orbitron animate-pulse text-xl tracking-widest">
          VERIFYING PERMISSIONS...
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500">You don't have permission to manage this league</p>
        <Link href={`/leagues/${leagueId}`} className="text-emerald-400 hover:underline mt-4">
          ← Back to League
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/leagues/${leagueId}`} className="text-gray-500 hover:text-white transition flex items-center gap-2 mb-4">
            ← Back to {leagueName}
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white tracking-tighter">
              LEAGUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">MANAGER</span>
            </h1>
            <span className="bg-orange-500/20 text-orange-400 text-xs px-3 py-1 rounded-full font-bold uppercase">
              Admin
            </span>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className={`mb-6 p-3 rounded-lg ${status.includes("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {status}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("grading")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === "grading"
                ? "bg-orange-600 text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            📝 Grading {ungradedCount > 0 && `(${ungradedCount})`}
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === "members"
                ? "bg-orange-600 text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            👥 Members
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === "activity"
                ? "bg-orange-600 text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            📊 Activity
          </button>
        </div>

        {/* Grading Tab */}
        {activeTab === "grading" && (
          <div className="space-y-6">
            {/* Race Selector */}
            <div className="bg-[#121418] border border-gray-800 rounded-xl p-6">
              <label className="block text-sm font-bold text-gray-400 uppercase mb-3">
                Select Race to Grade
              </label>
              <select
                value={selectedRaceId}
                onChange={(e) => setSelectedRaceId(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">-- Select Race --</option>
                {races.map((race) => (
                  <option key={race.id} value={race.id}>
                    {race.name} ({new Date(race.race_time).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Predictions to Grade */}
            {selectedRaceId && predictions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Predictions to Grade</h3>
                {predictions.map((pred) => (
                  <div key={pred.id} className="bg-[#121418] border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-white text-lg">{pred.profiles?.username || "Unknown"}</div>
                        <div className="text-xs text-gray-500">Prediction #{pred.id}</div>
                      </div>
                      {pred.league_grade && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                          ✓ Graded
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div className="text-xs font-bold text-yellow-500 uppercase mb-1">Wild Prediction</div>
                        <div className="text-white">{pred.wild_prediction || "—"}</div>
                        <div className="mt-3 flex gap-1">
                          {[0, 2, 5, 13].map((pts) => (
                            <button
                              key={pts}
                              onClick={() => handleGrade(pred.id, pts, pred.league_grade?.flop_points || 0, pred.league_grade?.surprise_points || 0)}
                              className={`px-3 py-1 rounded text-xs font-bold ${
                                pred.league_grade?.wild_points === pts
                                  ? "bg-yellow-500 text-black"
                                  : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40"
                              }`}
                            >
                              +{pts}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-xs font-bold text-blue-400 uppercase mb-1">Biggest Flop</div>
                        <div className="text-white">{pred.biggest_flop || "—"}</div>
                        <div className="mt-3 flex gap-1">
                          {[0, 2, 5].map((pts) => (
                            <button
                              key={pts}
                              onClick={() => handleGrade(pred.id, pred.league_grade?.wild_points || 0, pts, pred.league_grade?.surprise_points || 0)}
                              className={`px-3 py-1 rounded text-xs font-bold ${
                                pred.league_grade?.flop_points === pts
                                  ? "bg-blue-500 text-black"
                                  : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/40"
                              }`}
                            >
                              +{pts}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="text-xs font-bold text-green-400 uppercase mb-1">Biggest Surprise</div>
                        <div className="text-white">{pred.biggest_surprise || "—"}</div>
                        <div className="mt-3 flex gap-1">
                          {[0, 2, 5].map((pts) => (
                            <button
                              key={pts}
                              onClick={() => handleGrade(pred.id, pred.league_grade?.wild_points || 0, pred.league_grade?.flop_points || 0, pts)}
                              className={`px-3 py-1 rounded text-xs font-bold ${
                                pred.league_grade?.surprise_points === pts
                                  ? "bg-green-500 text-black"
                                  : "bg-green-500/20 text-green-400 hover:bg-green-500/40"
                              }`}
                            >
                              +{pts}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {pred.league_grade && (
                      <div className="text-right text-lg font-bold text-orange-400">
                        Total: {(pred.league_grade.wild_points || 0) + (pred.league_grade.flop_points || 0) + (pred.league_grade.surprise_points || 0)} pts
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedRaceId && predictions.length === 0 && (
              <div className="bg-[#121418] border border-gray-800 rounded-xl p-12 text-center text-gray-500">
                No predictions from league members for this race
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">League Members</h3>
              <button
                onClick={handleSyncPoints}
                disabled={syncing}
                className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {syncing ? "Syncing..." : "🔄 Sync Points"}
              </button>
            </div>

            <div className="bg-[#121418] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-black text-gray-500 text-xs uppercase">
                    <th className="p-4 text-left">Member</th>
                    <th className="p-4 text-center">Role</th>
                    <th className="p-4 text-right">Points</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.user_id} className="border-t border-gray-800">
                      <td className="p-4">
                        <span className="font-bold text-white">{member.profiles?.username || "Unknown"}</span>
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                          disabled={member.role === "owner"}
                        >
                          <option value="member">Member</option>
                          <option value="grader">Grader</option>
                          <option value="admin">Admin</option>
                          <option value="owner" disabled>Owner</option>
                        </select>
                      </td>
                      <td className="p-4 text-right font-mono text-orange-400">
                        {member.season_points}
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xs text-gray-500">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            {activity.length === 0 ? (
              <div className="bg-[#121418] border border-gray-800 rounded-xl p-12 text-center text-gray-500">
                No activity yet
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map((item) => (
                  <div key={item.id} className="bg-[#121418] border border-gray-800 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400">
                      {item.activity_type === "prediction_submitted" && "📝"}
                      {item.activity_type === "joined_league" && "🏆"}
                      {item.activity_type === "achievement_earned" && "🏅"}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-white">{item.profiles?.username || "User"}</span>
                      <span className="text-gray-400 ml-2">
                        {item.activity_type === "prediction_submitted" && "submitted a prediction"}
                        {item.activity_type === "joined_league" && "joined the league"}
                        {item.activity_type === "achievement_earned" && "earned an achievement"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
