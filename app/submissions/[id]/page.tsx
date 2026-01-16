"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function SubmissionsPage() {
  const params = useParams();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [race, setRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get Race Details
      const { data: raceData } = await supabase
        .from("races")
        .select("*")
        .eq("id", params.id)
        .single();
      
      setRace(raceData);

      // 2. Get All Predictions with user profiles (for usernames)
      const { data: predData } = await supabase
        .from("predictions")
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq("race_id", params.id);

      if (predData) {
        // Map to include username from joined profile
        const enhancedPreds = predData.map((pred: any) => ({
          ...pred,
          username: pred.profiles?.username?.split('@')[0] || pred.user_id.slice(0, 8)
        }));
        setPredictions(enhancedPreds);
      }
      setLoading(false);
    };

    fetchData();
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-white font-orbitron tracking-widest animate-pulse">LOADING DATA...</div>;

  // Check if predictions should be locked (qualifying has started)
  // Lock predictions when we're past the qualifying time
  const isLocked = race?.quali_time 
    ? new Date() > new Date(race.quali_time) 
    : false; 

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans selection:bg-red-500 selection:text-white">
      
      {/* --- HEADER SECTION --- */}
      <div className="relative border-b-4 border-red-600 bg-gradient-to-r from-gray-900 via-black to-gray-900 py-16 px-6 md:px-12 mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
            <div>
                <div className="inline-block px-4 py-1 mb-4 border border-red-500/30 rounded bg-red-900/10 backdrop-blur-sm">
                    <span className="text-red-500 font-bold tracking-[0.3em] text-xs uppercase font-orbitron">
                        Live League Data
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black font-orbitron text-white tracking-tighter drop-shadow-lg mb-2">
                    TRANSPARENCY <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">BOARD</span>
                </h1>
                <p className="text-gray-400 text-xl md:text-2xl uppercase tracking-[0.2em] font-light border-l-4 border-red-600 pl-4">
                    {race?.name}
                </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
                <span className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Session Status</span>
                <div className={`px-6 py-2 rounded border-2 ${isLocked ? "bg-red-950/50 border-red-600 text-red-400" : "bg-green-950/50 border-green-500 text-green-400"} backdrop-blur-md shadow-lg`}>
                    <span className="text-xl font-bold font-mono flex items-center gap-2">
                        {isLocked ? "🔒 LOCKED" : "🟢 OPEN / LIVE"}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-[98%] mx-auto pb-12">
        
        {/* The Scrollable Grid Container */}
        <div className="relative w-full overflow-hidden rounded-lg border border-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-[#121418]">
            
            {/* Scroll Wrapper */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1400px]"> 
                    <thead>
                        {/* HEADER ROW - High Contrast Backgrounds */}
                        <tr className="text-xs uppercase tracking-[0.15em] border-b border-gray-700 h-16 font-orbitron">
                            <th className="p-4 pl-6 sticky left-0 bg-[#0F1014] z-20 border-r-2 border-gray-700 text-white w-56 shadow-[4px_0_20px_rgba(0,0,0,0.5)]">
                                User
                            </th>
                            
                            {/* Qualifying Section - Stronger Red Background */}
                            <th className="p-4 border-r border-red-900/30 bg-[#2A0A0A] text-red-400 w-48">
                                Pole Position <span className="block text-[10px] opacity-70 font-mono mt-1 text-white">+5 PTS</span>
                            </th>
                            <th className="p-4 border-r border-red-900/30 bg-[#2A0A0A] text-red-400 w-48">
                                Quali P2 <span className="block text-[10px] opacity-70 font-mono mt-1 text-white">+3 PTS</span>
                            </th>
                            <th className="p-4 border-r-2 border-gray-600 bg-[#2A0A0A] text-red-400 w-48">
                                Quali P3 <span className="block text-[10px] opacity-70 font-mono mt-1 text-white">+1 PT</span>
                            </th>

                            {/* Race Section - Dark Grey Background */}
                            <th className="p-4 border-r border-gray-700 bg-[#1A1C23] text-white w-48">
                                Race Winner <span className="block text-[10px] opacity-70 font-mono mt-1 text-yellow-400">+10 PTS</span>
                            </th>
                            <th className="p-4 border-r border-gray-700 bg-[#1A1C23] text-gray-300 w-48">
                                Race P2 <span className="block text-[10px] opacity-70 font-mono mt-1 text-white">+8 PTS</span>
                            </th>
                            <th className="p-4 border-r-2 border-gray-600 bg-[#1A1C23] text-orange-300 w-48">
                                Race P3 <span className="block text-[10px] opacity-70 font-mono mt-1 text-white">+6 PTS</span>
                            </th>

                            {/* Bonus Section - Distinct Colors */}
                            <th className="p-4 border-r border-yellow-900/30 bg-[#221F00] text-yellow-400 w-64">
                                🔥 Wildcard <span className="block text-[10px] opacity-70 font-mono mt-1 text-white">+13 PTS</span>
                            </th>
                            <th className="p-4 border-r border-blue-900/30 bg-[#0A1124] text-blue-400 w-56">
                                📉 Flop <span className="block text-[10px] opacity-70 font-mono mt-1 text-white">+2 PTS</span>
                            </th>
                            <th className="p-4 bg-[#051F10] text-green-400 w-56">
                                🚀 Surprise <span className="block text-[10px] opacity-70 font-mono mt-1 text-white">+2 PTS</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-base font-medium">
                        {predictions.length === 0 ? (
                            <tr><td colSpan={10} className="p-16 text-center text-gray-500 text-xl font-orbitron tracking-widest">NO DATA IN TELEMETRY</td></tr>
                        ) : (
                            predictions.map((pred, i) => (
                                <tr key={pred.id} className="hover:bg-white/[0.05] transition-colors group h-20">
                                    {/* User Column - Sticky */}
                                    <td className="p-5 pl-6 font-bold font-mono text-white sticky left-0 bg-[#121418] group-hover:bg-[#1a1d23] border-r-2 border-gray-700 z-20 shadow-[4px_0_20px_rgba(0,0,0,0.5)] flex items-center gap-3 h-20">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-black border border-gray-500">
                                            {i + 1}
                                        </div>
                                        <span className="truncate w-32 text-lg">{pred.username}</span>
                                    </td>
                                    
                                    {/* Quali Cells (Red Tint) */}
                                    <td className="p-5 border-r border-gray-800 bg-red-900/[0.03] text-red-200 font-semibold">{isLocked ? "🔒" : pred.quali_p1_driver}</td>
                                    <td className="p-5 border-r border-gray-800 bg-red-900/[0.03] text-gray-400">{isLocked ? "🔒" : pred.quali_p2_driver}</td>
                                    <td className="p-5 border-r-2 border-gray-700 bg-red-900/[0.03] text-gray-400">{isLocked ? "🔒" : pred.quali_p3_driver}</td>
                                    
                                    {/* Race Cells (Neutral) */}
                                    <td className="p-5 border-r border-gray-800 text-white font-bold bg-white/[0.02]">{isLocked ? "🔒" : pred.race_p1_driver}</td>
                                    <td className="p-5 border-r border-gray-800 text-gray-300">{isLocked ? "🔒" : pred.race_p2_driver}</td>
                                    <td className="p-5 border-r-2 border-gray-700 text-orange-200">{isLocked ? "🔒" : pred.race_p3_driver}</td>
                                    
                                    {/* Bonus Cells (Tinted) */}
                                    <td className="p-5 border-r border-gray-800 italic text-yellow-200 bg-yellow-900/[0.05] border-l-2 border-l-yellow-600/50 pl-6">{isLocked ? "🔒" : pred.wild_prediction}</td>
                                    <td className="p-5 border-r border-gray-800 text-blue-300 bg-blue-900/[0.05]">{isLocked ? "🔒" : pred.biggest_flop}</td>
                                    <td className="p-5 text-green-300 bg-green-900/[0.05]">{isLocked ? "🔒" : pred.biggest_surprise}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#2A0A0A] border border-red-900/50 rounded-full">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_red]"></span> 
                <span className="text-red-200">Qualifying</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#1A1C23] border border-gray-700/50 rounded-full">
                <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]"></span> 
                <span className="text-gray-200">Race Result</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#221F00] border border-yellow-900/50 rounded-full">
                <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_orange]"></span> 
                <span className="text-yellow-200">Bonus</span>
            </div>
        </div>

      </div>
    </div>
  );
}