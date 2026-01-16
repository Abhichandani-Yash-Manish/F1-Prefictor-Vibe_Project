"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PredictionForm from "../../components/PredictionForm"; 
import { createBrowserClient } from "@supabase/ssr";

export default function PredictPage() {
  const params = useParams();
  const router = useRouter();
  const [race, setRace] = useState<any>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchRace = async () => {
        const { data } = await supabase.from("races").select("*").eq("id", params.id).single();
        if (data) setRace(data);
    };
    fetchRace();
  }, [params.id]);

  if (!race) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-orbitron animate-pulse text-xl tracking-widest">LOADING RACE DATA...</div>;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] font-sans p-4 md:p-8 selection:bg-red-500 selection:text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 border-b border-gray-800 pb-8 flex flex-col md:flex-row justify-between items-end">
            <div>
                <h1 className="text-5xl md:text-7xl font-black text-white font-orbitron mb-2 tracking-tighter drop-shadow-lg">
                    {race.name}
                </h1>
                <p className="text-gray-400 text-xl tracking-[0.3em] font-light uppercase border-l-4 border-red-600 pl-4">
                    📍 {race.circuit}
                </p>
            </div>
            <div className="text-right mt-6 md:mt-0">
                <span className="block text-xs text-red-500 font-bold uppercase tracking-widest mb-2">Prediction Deadline</span>
                <span className="text-2xl font-mono text-white font-bold bg-[#1F2833] px-6 py-3 rounded-lg border border-gray-700 shadow-lg">
                    {new Date(race.race_time).toLocaleString()}
                </span>
            </div>
        </div>

        {/* DYNAMIC INTEL DASHBOARD */}
        <div className="bg-[#121418] border border-gray-700 p-8 rounded-2xl mb-12 shadow-2xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-black italic text-white pointer-events-none font-orbitron">INTEL</div>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-8 bg-blue-500"></div>
                <h3 className="text-2xl font-bold text-white font-orbitron tracking-wide">TRACK INTELLIGENCE</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stat 1: Winner */}
                <div className="bg-[#0B0C10] p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center shadow-lg group hover:border-gray-600 transition">
                    <span className="block text-blue-400 uppercase text-xs font-bold mb-3 tracking-widest">Previous Winner</span>
                    <span className="text-white font-bold text-xl font-orbitron">{race.previous_winner || "TBD"}</span>
                </div>

                {/* Stat 2: Conditions */}
                <div className="bg-[#0B0C10] p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center shadow-lg group hover:border-gray-600 transition">
                    <span className="block text-blue-400 uppercase text-xs font-bold mb-3 tracking-widest">Track Condition</span>
                    <span className="text-white font-bold text-xl font-orbitron">{race.track_condition || "Unknown"}</span>
                </div>

                {/* Stat 3: Forecast */}
                <div className="bg-[#0B0C10] p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center shadow-lg group hover:border-gray-600 transition">
                    <span className="block text-blue-400 uppercase text-xs font-bold mb-3 tracking-widest">Weather Forecast</span>
                    <span className="text-white font-bold text-xl font-orbitron">{race.forecast || "Pending"}</span>
                </div>
            </div>
        </div>

        {/* THE FORM */}
        <PredictionForm 
            raceId={Number(params.id)} 
            onSuccess={() => router.push(`/submissions/${params.id}`)} 
        />
        
      </div>
    </div>
  );
}