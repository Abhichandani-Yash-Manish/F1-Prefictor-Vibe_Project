"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Global toast queue
let toastQueue: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toastQueue]));
};

// Public API for showing toasts
export const teamRadio = {
  success: (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    toastQueue.push({ id, message: `Box Box. ${message}`, type: 'success' });
    notifyListeners();
    setTimeout(() => {
      toastQueue = toastQueue.filter(t => t.id !== id);
      notifyListeners();
    }, 4000);
  },
  error: (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    toastQueue.push({ id, message: `⚠️ ${message}`, type: 'error' });
    notifyListeners();
    setTimeout(() => {
      toastQueue = toastQueue.filter(t => t.id !== id);
      notifyListeners();
    }, 5000);
  },
  info: (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    toastQueue.push({ id, message, type: 'info' });
    notifyListeners();
    setTimeout(() => {
      toastQueue = toastQueue.filter(t => t.id !== id);
      notifyListeners();
    }, 3000);
  }
};

// Toast container component (add to layout)
export function TeamRadioProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter(l => l !== setToasts);
    };
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <>
      {children}
      {createPortal(
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className={`team-radio animate-slideIn pl-12 ${
                toast.type === 'success' ? 'border-[var(--success-green)]' :
                toast.type === 'error' ? 'border-[var(--alert-red)]' :
                'border-[var(--accent-cyan)]'
              }`}
              style={{
                borderLeftColor: toast.type === 'success' ? 'var(--success-green)' :
                                toast.type === 'error' ? 'var(--alert-red)' :
                                'var(--accent-cyan)'
              }}
            >
              <div className="text-xs text-[var(--text-muted)] mb-1 font-mono uppercase">
                Team Radio
              </div>
              <div className={`font-mono text-sm ${
                toast.type === 'success' ? 'text-[var(--success-green)]' :
                toast.type === 'error' ? 'text-[var(--alert-red)]' :
                'text-[var(--text-silver)]'
              }`}>
                {toast.message}
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
