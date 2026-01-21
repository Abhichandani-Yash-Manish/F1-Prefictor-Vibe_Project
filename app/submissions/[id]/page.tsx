"use client";

import React, { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import PageHeader from "@/app/components/ui/PageHeader";
import ShareButton from "@/app/components/ShareButton";
import GlassCard from "@/app/components/ui/GlassCard";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { TEAM_COLORS } from "@/app/lib/drivers";

export default function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [raceId, setRaceId] = useState<string>("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const load = async () => {
       const resolvedParams = await params;
       setRaceId(resolvedParams.id);
       
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
          setLoading(false);
          return;
       }

       // Fetch user predictions
       // Optimization: Create a specific endpoint for single prediction
       try {
         const res = await fetch(`/api/predictions/user/${user.id}`);
         if (res.ok) {
           const data = await res.json();
           const match = data.find((p: any) => p.race_id === parseInt(resolvedParams.id));
           setPrediction(match);
         }
       } catch (e) {
         console.error(e);
       } finally {
         setLoading(false);
       }
    };
    load();
  }, [params]);

  if (loading) return <div className="min-h-screen pt-20 flex justify-center"><LoadingSpinner /></div>;

  if (!prediction) {
    return (
        <div className="min-h-screen pt-20 text-center text-gray-500">
            <p>No prediction found for this race.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-20 px-6 pb-20">
      <div className="max-w-3xl mx-auto">
         <PageHeader 
            title="Prediction Receipt" 
            badgeText="Submitted" 
            badgeVariant="green"
            description={`Race ID: ${raceId}`}
         />

         <div className="mt-8 relative">
            {/* Ticket / Card */}
            <GlassCard className="p-8 border-t-4 border-t-[var(--accent-gold)] relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-10">
                    <span className="text-9xl font-black font-orbitron">F1</span>
                </div>

                <div className="relative z-10 grid gap-8">
                    {/* Podium */}
                    <div>
                        <h3 className="text-sm font-bold text-[var(--accent-gold)] uppercase tracking-widest mb-4">Race Podium</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <PodiumStep pos={2} driver={prediction.race_p2_driver} />
                            <PodiumStep pos={1} driver={prediction.race_p1_driver} />
                            <PodiumStep pos={3} driver={prediction.race_p3_driver} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                        <div>
                             <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Qualifying</h3>
                             <div className="space-y-2">
                                <PredictionRow label="Pole Position" driver={prediction.quali_p1_driver} />
                                <PredictionRow label="P2" driver={prediction.quali_p2_driver} />
                                <PredictionRow label="P3" driver={prediction.quali_p3_driver} />
                             </div>
                        </div>
                        <div>
                             <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Bonus</h3>
                             <div className="space-y-2">
                                <div className="bg-white/5 p-2 rounded">
                                    <p className="text-[10px] text-gray-500 uppercase">Wild</p>
                                    <p className="text-sm text-white font-medium">{prediction.wild_prediction}</p>
                                </div>
                                <div className="bg-white/5 p-2 rounded">
                                    <p className="text-[10px] text-gray-500 uppercase">Flop</p>
                                    <p className="text-sm text-white font-medium">{prediction.biggest_flop}</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                        <p className="text-xs text-gray-500 font-mono">
                            ID: {prediction.id?.slice(0, 8)}...
                        </p>
                        <ShareButton 
                            title="My F1 Prediction" 
                            text={`Here are my picks for Race ${raceId}: Winner ${prediction.race_p1_driver}, Pole ${prediction.quali_p1_driver}. Beat me if you can!`} 
                            url={`https://f1apex.app/submissions/${raceId}`} 
                        />
                    </div>
                </div>
            </GlassCard>
         </div>
      </div>
    </div>
  );
}

const PodiumStep = ({ pos, driver }: any) => (
    <div className={`text-center flex flex-col items-center ${pos === 1 ? '-mt-4' : ''}`}>
        <div className="text-xs text-gray-500 font-bold mb-1">P{pos}</div>
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${pos === 1 ? 'bg-[var(--accent-gold)] text-black border-2 border-white' : 'bg-[#1F2833] border border-white/20'}`}>
            {driver ? driver.substring(0, 3).toUpperCase() : "???"}
        </div>
        <div className="mt-2 text-sm font-bold text-white">{driver}</div>
    </div>
);

const PredictionRow = ({ label, driver }: any) => (
    <div className="flex justify-between items-center p-2 rounded bg-white/5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="font-bold text-white text-sm">{driver}</span>
    </div>
);