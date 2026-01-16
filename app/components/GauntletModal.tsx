"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { DRIVERS_2026, getDriverTeam, TEAM_COLORS } from "../lib/drivers";
import { teamRadio } from "./TeamRadioToast";

interface GauntletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
  };
  opponent?: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
}

export default function GauntletModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  opponent,
  onSuccess 
}: GauntletModalProps) {
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [raceDuration, setRaceDuration] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChallenge = async () => {
    if (!selectedDriver) {
      teamRadio.error("Select your champion driver first!");
      return;
    }
    if (!opponent) {
      teamRadio.error("No opponent selected");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("rivalries").insert({
        challenger_id: currentUser.id,
        challenger_name: currentUser.name,
        opponent_id: opponent.id,
        opponent_name: opponent.name,
        challenger_driver: selectedDriver,
        race_duration: raceDuration,
        status: 'pending'
      });

      if (error) {
        console.error("Rivalry creation error:", error);
        teamRadio.error("Failed to create challenge: " + error.message);
      } else {
        teamRadio.success(`Challenge sent to ${opponent.name}! 🏁`);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Challenge error:", err);
      teamRadio.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDriver("");
    setRaceDuration(3);
    onClose();
  };

  if (!isOpen) return null;

  const selectedTeam = selectedDriver ? getDriverTeam(selectedDriver) : null;
  const teamColor = selectedTeam ? TEAM_COLORS[selectedTeam] : "#C3073F";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-[#1F2833] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Header with team color accent */}
        <div 
          className="p-6 border-b border-white/10"
          style={{ 
            background: `linear-gradient(135deg, ${teamColor}20 0%, transparent 100%)`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-4xl mb-2 block">⚔️</span>
              <h2 className="font-orbitron text-2xl font-black text-white">
                THROW THE GAUNTLET
              </h2>
              <p className="font-mono text-sm text-gray-400 mt-1">
                Challenge <span className="text-white font-bold">{opponent?.name || "?"}</span>
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-white text-2xl font-bold transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Driver Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              🏎️ Select Your Champion Driver
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full p-4 bg-[#0B0C10] border border-gray-700 rounded-xl text-white focus:border-red-500 outline-none appearance-none text-lg font-mono"
              style={{ 
                borderColor: selectedDriver ? teamColor : undefined,
                boxShadow: selectedDriver ? `0 0 10px ${teamColor}40` : undefined
              }}
            >
              <option value="">Choose a driver...</option>
              {DRIVERS_2026.map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
            
            {selectedDriver && (
              <div 
                className="mt-2 px-3 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-bold"
                style={{ backgroundColor: `${teamColor}30`, color: teamColor }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
                {selectedTeam}
              </div>
            )}
          </div>

          {/* Race Duration */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              📊 Rivalry Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[3, 5, 10].map(races => (
                <button
                  key={races}
                  onClick={() => setRaceDuration(races)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    raceDuration === races
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-white'
                      : 'border-gray-700 bg-[#0B0C10] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <span className="block font-orbitron text-2xl font-black">{races}</span>
                  <span className="text-xs uppercase tracking-wider">Races</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-black/30 rounded-xl border border-white/5">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-white font-bold">How it works:</span> You'll compete over {raceDuration} races. 
              Your prediction scores during these races will be tallied. Winner takes bragging rights! 🏆
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-6 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleChallenge}
              disabled={loading || !selectedDriver}
              className="flex-1 py-3 px-6 bg-red-600 text-white font-orbitron font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: selectedDriver ? `linear-gradient(135deg, ${teamColor} 0%, #C3073F 100%)` : undefined
              }}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Sending...
                </>
              ) : (
                <>⚔️ Challenge</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
