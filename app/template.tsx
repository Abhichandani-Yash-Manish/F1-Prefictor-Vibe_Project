"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in on mount/route change
    setOpacity(0);
    const timer = setTimeout(() => setOpacity(1), 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div 
        className="transition-opacity duration-500 ease-out"
        style={{ opacity }}
    >
      {children}
    </div>
  );
}
