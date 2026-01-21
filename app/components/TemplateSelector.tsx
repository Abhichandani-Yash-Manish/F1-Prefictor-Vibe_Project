"use client";

import React, { useState, useEffect } from "react";
import { Copy, Save, Archive, ChevronDown, Wand2, History, Trophy } from "lucide-react";
import { teamRadio } from "./TeamRadioToast";
import { createBrowserClient } from "@supabase/ssr";

export interface DriverPositions {
  quali_p1: string;
  quali_p2: string;
  quali_p3: string;
  race_p1: string;
  race_p2: string;
  race_p3: string;
}

interface TemplateSelectorProps {
  onApply: (positions: DriverPositions) => void;
  currentPicks: DriverPositions;
}

interface Template {
  id: string;
  name: string;
  is_global: boolean;
  picks: DriverPositions;
}

export default function TemplateSelector({ onApply, currentPicks }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Initial fetch of basic options and user templates
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data || []);
      }
    } catch (e) {
      console.error("Failed to load templates", e);
    }
  };

  const loadFromSource = async (source: 'standings' | 'last-race') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates/${source}`);
      if (!res.ok) throw new Error("Failed to fetch template data");
      const data = await res.json();
      
      // Transform incoming data to expected format if needed
      // Assuming API returns snake_case matching our interface
      onApply(data);
      teamRadio.success(`Applied ${source === 'standings' ? 'Current Standings' : 'Last Prediction'}`);
      setIsOpen(false);
    } catch (e) {
      teamRadio.error("Could not load template data");
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) return;
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        teamRadio.error("You must be logged in to save templates");
        return;
      }

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          name: templateName,
          ...currentPicks // Spread current picks into body
        })
      });

      if (!res.ok) throw new Error("Failed to save template");
      
      teamRadio.success("Template saved!");
      setTemplateName("");
      setShowSaveInput(false);
      fetchTemplates(); // Refresh list
    } catch (e) {
      teamRadio.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative mb-6 z-30">
        {/* Toggle Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-lg text-sm font-bold text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-cyan)] transition-all"
        >
            <Wand2 className="w-4 h-4 text-[var(--accent-cyan)]" />
            <span>Use Template</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#0B0C10] border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Actions Section */}
                <div className="p-3 grid gap-2 border-b border-white/5">
                    <button 
                        disabled={loading}
                        onClick={() => loadFromSource('standings')}
                        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition text-left group"
                    >
                        <div className="p-1.5 bg-[var(--f1-red)]/20 rounded text-[var(--f1-red)] group-hover:bg-[var(--f1-red)] group-hover:text-white transition-colors">
                            <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Current Standings</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Use 2026 WDC Order</p>
                        </div>
                    </button>

                    <button 
                        disabled={loading}
                        onClick={() => loadFromSource('last-race')}
                        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition text-left group"
                    >
                        <div className="p-1.5 bg-[var(--accent-gold)]/20 rounded text-[var(--accent-gold)] group-hover:bg-[var(--accent-gold)] group-hover:text-black transition-colors">
                            <History className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Last Prediction</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Copy from previous race</p>
                        </div>
                    </button>
                </div>

                {/* User Templates Section */}
                <div className="p-3 bg-[#1F2833]/30 min-h-[100px]">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2 px-2">
                        Your Schemas
                    </p>
                    
                    {templates.length === 0 ? (
                        <p className="text-xs text-center text-gray-500 py-4 italic">No saved templates</p>
                    ) : (
                        <div className="space-y-1">
                            {templates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onApply(t.picks)}
                                    className="flex items-center justify-between w-full p-2 rounded hover:bg-white/10 text-left text-xs text-gray-300 hover:text-white transition"
                                >
                                    <span className="flex items-center gap-2">
                                        <Archive className="w-3 h-3 text-[var(--accent-cyan)]" />
                                        {t.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Save Section */}
                <div className="p-3 border-t border-white/5 bg-[#0B0C10]">
                    {!showSaveInput ? (
                        <button 
                            onClick={() => setShowSaveInput(true)}
                            className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded border border-dashed border-gray-700 text-xs text-gray-400 hover:text-white hover:border-gray-500 transition"
                        >
                            <Save className="w-3 h-3" /> Save current as template
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                autoFocus
                                value={templateName}
                                onChange={e => setTemplateName(e.target.value)}
                                placeholder="Template Name"
                                className="flex-1 bg-[#1F2833] border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-[var(--accent-cyan)] outline-none"
                            />
                            <button 
                                onClick={saveTemplate}
                                disabled={saving}
                                className="bg-[var(--accent-cyan)] text-black px-3 py-1 rounded text-xs font-bold hover:brightness-110"
                            >
                                {saving ? "..." : "Save"}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        )}
    </div>
  );
}
