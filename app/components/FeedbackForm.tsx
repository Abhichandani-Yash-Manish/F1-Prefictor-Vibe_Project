"use client";

import React, { useState, useEffect } from "react";
import { Mail, User, Tag, Send, AlertCircle, CheckCircle } from "lucide-react";
import { teamRadio } from "./TeamRadioToast";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

interface FeedbackFormProps {
  userId?: string;
  initialEmail?: string;
}

export default function FeedbackForm({ userId, initialEmail }: FeedbackFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: initialEmail || "",
    subject: "general",
    message: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Auto-fill user data if logged in
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({
            ...prev,
            email: user.email || prev.email
        }));
        
        // Fetch profile for name if needed
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
        if (profile) {
            setFormData(prev => ({ ...prev, name: profile.username || prev.name }));
        }
      }
    };
    if (!userId && !initialEmail) fetchUser();
  }, [userId, initialEmail]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.message.trim()) {
        throw new Error("Message cannot be empty");
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_id: userId, // Might be undefined, handled by backend
          category: formData.subject // Mapping subject to category
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to send feedback");
      }

      teamRadio.success("Feedback sent successfully! Check your email.");
      setFormData(prev => ({ ...prev, message: "", subject: "general" }));
      
    } catch (error: any) {
      console.error("Feedback error:", error);
      teamRadio.error(error.message || "Failed to send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1F2833]/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-2xl relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--f1-red)]/5 rounded-full blur-3xl group-hover:bg-[var(--f1-red)]/10 transition-all duration-700" />

      <h2 className="text-xl font-bold text-white mb-6 font-orbitron flex items-center gap-2">
        <Send className="w-5 h-5 text-[var(--f1-red)]" />
        Send us a Message
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Your Name
          </label>
          <input 
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white focus:border-[var(--f1-red)] focus:ring-1 focus:ring-[var(--f1-red)] outline-none transition font-mono placeholder:text-gray-700"
            placeholder="Max Verstappen"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3 h-3" /> Email Address
          </label>
          <input 
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white focus:border-[var(--f1-red)] focus:ring-1 focus:ring-[var(--f1-red)] outline-none transition font-mono placeholder:text-gray-700"
            placeholder="max@redbull.com"
          />
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Tag className="w-3 h-3" /> Subject
          </label>
          <div className="relative">
            <select 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white focus:border-[var(--f1-red)] focus:ring-1 focus:ring-[var(--f1-red)] outline-none transition appearance-none cursor-pointer"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Report a Bug 🐛</option>
              <option value="feature">Feature Request 💡</option>
              <option value="scoring">Scoring Question 🏁</option>
              <option value="account">Account Issue 🔑</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Message
          </label>
          <textarea 
            required
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white focus:border-[var(--f1-red)] focus:ring-1 focus:ring-[var(--f1-red)] outline-none transition h-32 resize-none font-sans placeholder:text-gray-700"
            placeholder="Tell us what's on your mind..."
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading}
          className={`
            w-full bg-[var(--f1-red)] text-white font-bold py-3 rounded 
            hover:bg-red-700 transition shadow-[0_0_20px_rgba(220,38,38,0.3)] 
            uppercase tracking-widest flex items-center justify-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? (
             <span className="flex items-center gap-2 animate-pulse">
                Sending...
             </span>
          ) : (
             <>
               Send Message <Send className="w-4 h-4" />
             </>
          )}
        </button>
      </form>
    </div>
  );
}
