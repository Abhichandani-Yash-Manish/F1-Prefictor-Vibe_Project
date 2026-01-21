"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { config } from "../../lib/config";
import { DRIVERS_WITH_PLACEHOLDER } from "../lib/drivers";
import ConfidenceMeter from "./ConfidenceMeter";
import TemplateSelector, { DriverPositions } from "./TemplateSelector";

const DRIVERS = DRIVERS_WITH_PLACEHOLDER;

export default function PredictionForm({ raceId, onSuccess }: { raceId: number, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    quali_p1: "", quali_p2: "", quali_p3: "",
    race_p1: "", race_p2: "", race_p3: "",
    wild: "", flop: "", surprise: ""
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const applyTemplate = (positions: DriverPositions) => {
    setFormData(prev => ({
        ...prev,
        ...positions
    }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in first!");
      setLoading(false);
      return;
    }

    if (formData.quali_p1 === "" || formData.race_p1 === "") {
        alert("Please fill in at least the P1 predictions!");
        setLoading(false);
        return;
    }

    const response = await fetch(`${config.apiUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        race_id: raceId,
        quali_p1_driver: formData.quali_p1,
        quali_p2_driver: formData.quali_p2,
        quali_p3_driver: formData.quali_p3,
        race_p1_driver: formData.race_p1,
        race_p2_driver: formData.race_p2,
        race_p3_driver: formData.race_p3,
        wild_prediction: formData.wild,
        biggest_flop: formData.flop,
        biggest_surprise: formData.surprise
      }),
    });

    if (response.ok) {
      if (onSuccess) {
        onSuccess();
      } else {
        alert("✅ Predictions Submitted Successfully!");
      }
    } else {
      const errorData = await response.json();
      if (errorData.detail && errorData.detail.includes("23505")) {
        alert("⚠️ You have already submitted a prediction for this race!");
      } else {
        alert("❌ Error: " + (errorData.detail || "Failed to save"));
      }
    }
    setLoading(false);
  };

  const DriverSelect = ({ label, value, onChange, position, highlight }: any) => (
    <div>
      <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
        {label}
      </label>
      <div className="relative">
        <select 
          className={`w-full px-4 py-3.5 pr-10 rounded-xl bg-[var(--bg-onyx)] border transition-all appearance-none cursor-pointer ${
            highlight 
              ? 'border-[var(--accent-gold)]/50 focus:border-[var(--accent-gold)]' 
              : 'border-[var(--glass-border)] focus:border-[var(--accent-cyan)]'
          }`}
          value={value} 
          onChange={(e) => onChange(e.target.value)}
        >
          {DRIVERS.map(driver => (
            <option key={driver} value={driver}>{driver}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {value && value !== "" && value !== "Select Driver..." && (
        <div className="mt-3">
          <ConfidenceMeter raceId={raceId} selectedDriver={value} position={position} />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      
      <div className="flex justify-end -mb-4">
        <TemplateSelector onApply={applyTemplate} currentPicks={formData as DriverPositions} />
      </div>

      {/* QUALIFYING SECTION */}
      <div className="telemetry-panel p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--f1-red-dim)] flex items-center justify-center">
            <span className="text-lg">⏱️</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Qualifying Top 3</h3>
            <p className="text-xs text-[var(--text-muted)]">Who will lock out the front row?</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <DriverSelect label="Pole Position" value={formData.quali_p1} onChange={(v: string) => handleChange('quali_p1', v)} position="quali_p1" highlight />
          <DriverSelect label="P2" value={formData.quali_p2} onChange={(v: string) => handleChange('quali_p2', v)} position="quali_p2" />
          <DriverSelect label="P3" value={formData.quali_p3} onChange={(v: string) => handleChange('quali_p3', v)} position="quali_p3" />
        </div>
      </div>

      {/* RACE SECTION */}
      <div className="telemetry-panel p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold-dim)] flex items-center justify-center">
            <span className="text-lg">🏁</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Race Top 3</h3>
            <p className="text-xs text-[var(--text-muted)]">Predict the podium finishers</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <DriverSelect label="Winner" value={formData.race_p1} onChange={(v: string) => handleChange('race_p1', v)} position="race_p1" highlight />
          <DriverSelect label="P2" value={formData.race_p2} onChange={(v: string) => handleChange('race_p2', v)} position="race_p2" />
          <DriverSelect label="P3" value={formData.race_p3} onChange={(v: string) => handleChange('race_p3', v)} position="race_p3" />
        </div>
      </div>

      {/* BONUS SECTION */}
      <div className="telemetry-panel p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan-dim)] flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <h3 className="font-bold text-[var(--accent-cyan)] text-lg">Bonus Predictions</h3>
            <p className="text-xs text-[var(--text-muted)]">Earn extra points for sharp insights</p>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
              🔥 Wild Prediction
            </label>
            <input 
              type="text"
              placeholder="Something probable but not obvious..."
              className="w-full"
              value={formData.wild} 
              onChange={e => handleChange('wild', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                📉 Biggest Flop
              </label>
              <input 
                type="text"
                placeholder="Driver or team that will underperform"
                className="w-full"
                value={formData.flop} 
                onChange={e => handleChange('flop', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                🚀 Biggest Surprise
              </label>
              <input 
                type="text"
                placeholder="Driver or team that will overperform"
                className="w-full"
                value={formData.surprise} 
                onChange={e => handleChange('surprise', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full btn-primary py-5 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <span className="group-hover:scale-105 transition-transform inline-flex items-center gap-2">
          {loading ? "Transmitting..." : (
            <>
              <span>📡</span>
              <span>Submit Predictions</span>
            </>
          )}
        </span>
      </button>
    </div>
  );
}