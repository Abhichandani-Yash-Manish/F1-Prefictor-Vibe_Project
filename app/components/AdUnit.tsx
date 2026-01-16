"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  style?: React.CSSProperties;
  className?: string;
}

export default function AdUnit({ 
  slot, 
  format = "auto", 
  style = { display: "block" },
  className = ""
}: AdUnitProps) {
  
  useEffect(() => {
    try {
      // Push the ad only if adsbygoogle is available
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Predefined ad sizes for common placements
export function BannerAd({ slot }: { slot: string }) {
  return (
    <AdUnit 
      slot={slot} 
      format="horizontal"
      className="w-full my-4"
      style={{ display: "block", minHeight: "90px" }}
    />
  );
}

export function SidebarAd({ slot }: { slot: string }) {
  return (
    <AdUnit 
      slot={slot} 
      format="vertical"
      className="hidden lg:block"
      style={{ display: "block", minHeight: "250px", width: "300px" }}
    />
  );
}

export function InArticleAd({ slot }: { slot: string }) {
  return (
    <AdUnit 
      slot={slot} 
      format="rectangle"
      className="my-6 flex justify-center"
      style={{ display: "block", minHeight: "250px" }}
    />
  );
}
