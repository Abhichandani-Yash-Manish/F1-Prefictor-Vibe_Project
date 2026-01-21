"use client";

import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check, Copy } from "lucide-react";
import { teamRadio } from "./TeamRadioToast";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        teamRadio.success("Shared successfully!");
      } catch (e) {
        // Fallback to dropdown
        setIsOpen(!isOpen);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    teamRadio.success("Link copied to clipboard");
    setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
    }, 2000);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setIsOpen(false);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--f1-red)] hover:bg-red-600 text-white font-bold transition-transform active:scale-95 shadow-lg shadow-red-900/20"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1F2833] border border-[var(--glass-border)] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
            <button 
                onClick={copyToClipboard}
                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 border-b border-white/5"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
            </button>
            <button 
                 onClick={shareTwitter}
                 className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 border-b border-white/5"
            >
                <span className="text-blue-400">𝕏</span> Twitter
            </button>
            <button 
                 onClick={shareWhatsApp}
                 className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3"
            >
                <span className="text-green-500">💬</span> WhatsApp
            </button>
        </div>
      )}
    </div>
  );
}
