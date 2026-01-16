"use client";
import dynamic from "next/dynamic";

const WindTunnelBg = dynamic(() => import("./WindTunnelBg"), { ssr: false });

export function WindTunnelBgWrapper() {
  return <WindTunnelBg particleCount={60} baseSpeed={0.3} />;
}
