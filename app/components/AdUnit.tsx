"use client";

import { useEffect } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdUnit({ 
  slot, 
  format = "auto", 
  className = "",
  label = "Advertisement",
  responsive = true,
  style = {}
}: AdUnitProps) {
  
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className={`w-full flex flex-col items-center justify-center my-8 ${className}`}>
      {/* Label for transparency */}
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-subtle)] mb-2 opacity-50">
        {label}
      </span>

      {/* Development Placeholder */}
      {isDev ? (
        <div className="w-full max-w-[728px] h-[90px] bg-[var(--bg-graphite)]/50 border border-dashed border-[var(--glass-border)] rounded-lg flex items-center justify-center text-[var(--text-muted)] text-xs font-mono">
          [AdSpace: {slot}]
        </div>
      ) : (
        /* Actual Ad Unit */
        <div className="w-full flex justify-center overflow-hidden min-h-[100px] bg-[var(--bg-graphite)]/20 rounded-lg">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", ...style }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>
      )}
    </div>
  );
}
