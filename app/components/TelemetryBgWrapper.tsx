"use client";
import dynamic from "next/dynamic";

// Dynamically import the TelemetryBackground to avoid SSR issues with canvas
const TelemetryBackground = dynamic(
  () => import("./TelemetryBackground"),
  { ssr: false }
);

export function TelemetryBgWrapper() {
  return <TelemetryBackground />;
}
