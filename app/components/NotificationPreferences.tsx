"use client";

import React, { useState } from "react";
import { Bell, Mail, Smartphone, Check, Shield, Zap } from "lucide-react";
import { teamRadio } from "./TeamRadioToast";
import F1Button from "./ui/F1Button";

export default function NotificationPreferences() {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    race_reminders: true,
    results: true,
    marketing: false,
    digest: true
  });

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    teamRadio.success("Preferences saved successfully");
    setLoading(false);
  };

  const Toggle = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 bg-[#1F2833]/50 rounded-xl border border-white/5 hover:border-white/10 transition">
        <div className="flex gap-4">
            <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'bg-[var(--accent-cyan)] border-[var(--accent-cyan)]' : 'border-gray-600'}`}>
                {checked && <Check className="w-3 h-3 text-black" />}
            </div>
            <div>
                <h4 className="font-bold text-white text-sm">{label}</h4>
                <p className="text-xs text-[var(--text-muted)]">{description}</p>
            </div>
        </div>
        <button 
            onClick={onChange}
            className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-[var(--accent-cyan)]' : 'bg-gray-700'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-6' : 'left-1'}`} />
        </button>
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="grid gap-4">
            <Toggle 
                label="Race Reminders" 
                description="Get notified 1 hour before Qualifying and Race start."
                checked={prefs.race_reminders}
                onChange={() => handleToggle('race_reminders')}
            />
            <Toggle 
                label="Race Results" 
                description="Instant notification when provisional results are verified."
                checked={prefs.results}
                onChange={() => handleToggle('results')}
            />
            <Toggle 
                label="Weekly Digest" 
                description="Summary of your points, league changes, and upcoming stats."
                checked={prefs.digest}
                onChange={() => handleToggle('digest')}
            />
             <Toggle 
                label="Partner Offers" 
                description="Occasional updates from our sponsors."
                checked={prefs.marketing}
                onChange={() => handleToggle('marketing')}
            />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <p className="text-xs text-[var(--text-subtle)] flex items-center gap-2">
                <Shield className="w-3 h-3" />
                We respect your inbox. No spam, ever.
            </p>
            <F1Button variant="primary" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
            </F1Button>
        </div>
    </div>
  );
}
