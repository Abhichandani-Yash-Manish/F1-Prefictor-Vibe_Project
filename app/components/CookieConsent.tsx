"use strict";
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("f1apex-cookie-consent");
    if (!consent) {
      // Show with a slight delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("f1apex-cookie-consent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-[9999] max-w-sm w-[calc(100%-2rem)]"
        >
          <div className="bg-[var(--bg-midnight)]/90 backdrop-blur-md border border-[var(--glass-border)] p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-start gap-3">
              <span className="text-xl">🍪</span>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Cookie Preferences</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                  We use cookies to enhance your experience and serve personalized ads. 
                  By continuing, you agree to our{" "}
                  <Link href="/privacy" className="text-[var(--f1-red)] hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-[var(--f1-red)]/90 hover:bg-[var(--f1-red)] text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-[var(--f1-red)]/20"
                  >
                    ACCEPT ALL
                  </button>
                  <button
                    onClick={() => setIsVisible(false)} // Just dismiss for now, or implement reject logic
                    className="flex-1 bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors border border-white/10"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
