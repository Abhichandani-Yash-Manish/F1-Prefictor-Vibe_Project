"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { config } from "../../lib/config";
import { useRouter } from "next/navigation";
import { DRIVERS_2026 } from "../lib/drivers";
import LoadingSpinner from "../components/LoadingSpinner";

// Use centralized driver list (no placeholder needed for admin selects)
const DRIVERS = DRIVERS_2026;

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  const [races, setRaces] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [userPredictions, setUserPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [raceIntel, setRaceIntel] = useState({
    previous_winner: "",
    track_condition: "",
    forecast: ""
  });

  const [results, setResults] = useState({
    quali_p1: "", quali_p2: "", quali_p3: "",
    race_p1: "", race_p2: "", race_p3: ""
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login"); 
            return;
        }
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (profile && profile.is_admin) {
            setIsAdmin(true); 
            setCheckingAuth(false);
        } else {
            alert("ACCESS DENIED: You are not an Admin.");
            router.push("/"); 
        }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
        supabase.from("races").select("*").order("race_time", { ascending: true })
          .then(({ data }) => { if (data) setRaces(data); });
    }
  }, [isAdmin]);

  // Helper to get auth header
  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {};
  };

  useEffect(() => {
    if (isAdmin && selectedRaceId) {
        // Fetch predictions with auth header
        const fetchPredictions = async () => {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${config.apiUrl}/admin/predictions/${selectedRaceId}`, {
                headers: authHeaders
            });
            const data = await res.json();
            setUserPredictions(data || []);
        };
        fetchPredictions();
        
        supabase.from("races").select("*").eq("id", selectedRaceId).single()
            .then(({ data }) => {
                if (data) {
                    setRaceIntel({
                        previous_winner: data.previous_winner || "",
                        track_condition: data.track_condition || "",
                        forecast: data.forecast || ""
                    });
                }
            });
    }
  }, [selectedRaceId, isAdmin]);

  const handleChange = (field: string, value: string) => {
    setResults(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveIntel = async () => {
    const { error } = await supabase
        .from("races")
        .update(raceIntel)
        .eq("id", selectedRaceId);
    
    if (error) alert("Error saving intel!");
    else alert("✅ Race Intel Updated!");
  };

  const handleGrade = async (predId: number, currentScore: number, addPoints: number) => {
    const newScore = currentScore + addPoints;
    setUserPredictions(prev => prev.map(p => p.id === predId ? { ...p, manual_score: newScore } : p));
    const authHeaders = await getAuthHeader();
    await fetch(`${config.apiUrl}/admin/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ prediction_id: predId, manual_score: newScore })
    });
  };

  const handleResetGrade = async (predId: number) => {
    setUserPredictions(prev => prev.map(p => p.id === predId ? { ...p, manual_score: 0 } : p));
    const authHeaders = await getAuthHeader();
    await fetch(`${config.apiUrl}/admin/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ prediction_id: predId, manual_score: 0 })
    });
  };

  // --- SETTLEMENT LOGIC (FIXED) ---
  const handleSettle = async () => {
    if (!selectedRaceId) return alert("Select race!");
    setLoading(true);
    setStatus("CALCULATING SCORES...");

    try {
        const authHeaders = await getAuthHeader();
        const response = await fetch(`${config.apiUrl}/admin/settle`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({
                race_id: Number(selectedRaceId),
                quali_p1_driver: results.quali_p1,
                quali_p2_driver: results.quali_p2,
                quali_p3_driver: results.quali_p3,
                race_p1_driver: results.race_p1,
                race_p2_driver: results.race_p2,
                race_p3_driver: results.race_p3
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            setStatus("✅ " + data.message);
        } else {
            // FIX: Handle Array Errors nicely
            if (Array.isArray(data.detail)) {
                // If it's a list of errors, format them readable
                const errorMsg = data.detail.map((e: any) => e.msg).join(", ");
                setStatus("❌ Validation Error: " + errorMsg);
            } else {
                setStatus("❌ Error: " + data.detail);
            }
        }
    } catch (err) {
        setStatus("❌ SYSTEM ERROR");
    } finally {
        setLoading(false);
    }
  };

  const DriverSelect = ({ label, value, onChange }: any) => (
    <div className="mb-4">
      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">{label}</label>
      <div className="relative">
        <select 
            className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white font-mono focus:border-red-500 outline-none appearance-none hover:bg-gray-900 transition"
            value={value} 
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">-- SELECT DRIVER --</option>
            {DRIVERS.map(driver => <option key={driver} value={driver}>{driver}</option>)}
        </select>
        <div className="absolute right-3 top-4 pointer-events-none text-gray-500 text-xs">▼</div>
      </div>
    </div>
  );

  if (checkingAuth) return <LoadingSpinner message="Verifying Credentials..." />;

  if (!isAdmin) return null; 

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-white pt-24 pb-16 px-6">
        {/* Racing stripe */}
        <div className="fixed top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--f1-red)] via-[var(--f1-red)]/50 to-transparent" />
        
        <div className="max-w-6xl mx-auto border-b border-[var(--f1-red)]/50 pb-10 mb-12 flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div>
                <span className="badge badge-red mb-4">Restricted</span>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
                    ADMIN <span className="text-[var(--f1-red)]">CONTROL</span>
                </h1>
                <p className="text-[var(--text-muted)]">
                    Race Settlement System
                </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[var(--f1-red-dim)] border border-[var(--f1-red)]/30 text-[var(--f1-red)] text-xs font-bold uppercase tracking-widest">
                ⚡ Authorized Access
            </div>
        </div>

        <div className="max-w-7xl mx-auto">
            
            {/* 1. SELECT RACE */}
            <div className="mb-16 bg-[#121418] p-8 rounded-2xl border border-gray-800 shadow-2xl">
                <label className="block text-sm font-bold text-red-500 uppercase mb-3 tracking-widest">1. Select Event to Settle</label>
                <select 
                    className="w-full p-5 bg-black border border-gray-700 rounded-xl text-2xl font-bold text-white outline-none focus:border-red-500 transition appearance-none cursor-pointer hover:border-gray-500"
                    onChange={(e) => setSelectedRaceId(e.target.value)}
                >
                    <option value="">-- SELECT GRAND PRIX --</option>
                    {races.map(race => (
                        <option key={race.id} value={race.id}>
                            {race.name} ({new Date(race.race_time).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            {selectedRaceId && (
                <div className="animate-fade-in-up">
                    
                    {/* --- PRE-RACE INTEL --- */}
                    <div className="mb-16 border border-blue-600/30 rounded-xl bg-blue-900/10 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-2 h-8 bg-blue-500"></div>
                            <h2 className="text-3xl font-bold font-orbitron text-white">PRE-RACE INTEL SETUP</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-blue-400 uppercase mb-2">Previous Winner</label>
                                <input className="w-full p-3 bg-black border border-gray-700 rounded text-white" value={raceIntel.previous_winner} onChange={(e) => setRaceIntel({...raceIntel, previous_winner: e.target.value})} placeholder="e.g. Max Verstappen" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-400 uppercase mb-2">Track Condition</label>
                                <input className="w-full p-3 bg-black border border-gray-700 rounded text-white" value={raceIntel.track_condition} onChange={(e) => setRaceIntel({...raceIntel, track_condition: e.target.value})} placeholder="e.g. High Deg / Wet" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-400 uppercase mb-2">Weather Forecast</label>
                                <input className="w-full p-3 bg-black border border-gray-700 rounded text-white" value={raceIntel.forecast} onChange={(e) => setRaceIntel({...raceIntel, forecast: e.target.value})} placeholder="e.g. 24°C / Rain Likely" />
                            </div>
                        </div>
                        <button onClick={handleSaveIntel} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold uppercase text-sm transition">Save Intel 💾</button>
                    </div>

                    {/* --- PHASE 1: MANUAL GRADING --- */}
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-2 h-8 bg-yellow-500"></div>
                            <h2 className="text-3xl font-bold font-orbitron text-white">PHASE 1: MANUAL GRADING</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {userPredictions.length === 0 && <p className="text-gray-500 italic">No predictions found for this race.</p>}
                            {userPredictions.map(pred => (
                                <div key={pred.id} className="bg-[#121418] border border-gray-800 p-6 rounded-xl flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 font-mono mb-2">User ID: {pred.user_id}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                            <div className="text-yellow-100"><span className="text-yellow-600 font-bold block">Wild:</span> "{pred.wild_prediction}"</div>
                                            <div className="text-blue-100"><span className="text-blue-400 font-bold block">Flop:</span> "{pred.biggest_flop}"</div>
                                            <div className="text-green-100"><span className="text-green-400 font-bold block">Surp:</span> "{pred.biggest_surprise}"</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-4xl font-mono font-bold text-white">{pred.manual_score || 0}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleGrade(pred.id, pred.manual_score || 0, 13)} className="bg-yellow-600/20 text-yellow-500 py-1 px-2 rounded text-xs">+13</button>
                                            <button onClick={() => handleGrade(pred.id, pred.manual_score || 0, 2)} className="bg-blue-600/20 text-blue-400 py-1 px-2 rounded text-xs">+2</button>
                                            <button onClick={() => handleResetGrade(pred.id)} className="bg-red-900/20 text-red-500 py-1 px-2 rounded text-xs">Res</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- PHASE 2: AUTOMATIC SETTLEMENT --- */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-2 h-8 bg-red-600"></div>
                            <h2 className="text-3xl font-bold font-orbitron text-white">PHASE 2: OFFICIAL RESULTS</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#121418] p-8 rounded-2xl border border-gray-800 shadow-2xl">
                            <div className="bg-black/40 p-6 rounded-xl border border-gray-700/50">
                                <h3 className="text-red-500 font-bold mb-6 text-xl font-orbitron">QUALIFYING</h3>
                                <DriverSelect label="Pole Position" value={results.quali_p1} onChange={(v: string) => handleChange('quali_p1', v)} />
                                <DriverSelect label="P2" value={results.quali_p2} onChange={(v: string) => handleChange('quali_p2', v)} />
                                <DriverSelect label="P3" value={results.quali_p3} onChange={(v: string) => handleChange('quali_p3', v)} />
                            </div>
                            <div className="bg-black/40 p-6 rounded-xl border border-gray-700/50">
                                <h3 className="text-white font-bold mb-6 text-xl font-orbitron">RACE RESULT</h3>
                                <DriverSelect label="Race Winner" value={results.race_p1} onChange={(v: string) => handleChange('race_p1', v)} />
                                <DriverSelect label="P2" value={results.race_p2} onChange={(v: string) => handleChange('race_p2', v)} />
                                <DriverSelect label="P3" value={results.race_p3} onChange={(v: string) => handleChange('race_p3', v)} />
                            </div>
                        </div>
                        <button onClick={handleSettle} disabled={loading} className="w-full mt-10 bg-green-600 hover:bg-green-500 text-white font-black text-2xl py-6 rounded-xl shadow-[0_0_40px_rgba(34,197,94,0.3)] transition transform hover:scale-[1.01] border border-green-400 font-orbitron tracking-wider">
                            {loading ? "CALCULATING..." : "CONFIRM & CALCULATE POINTS 🚀"}
                        </button>
                        {status && <div className={`mt-8 p-6 text-center font-mono text-xl border rounded-xl ${status.includes("✅") ? "bg-green-900/20 border-green-500 text-green-400" : "bg-red-900/20 border-red-500 text-red-400"}`}>{status}</div>}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}