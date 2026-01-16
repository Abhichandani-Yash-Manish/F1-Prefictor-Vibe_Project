"use client";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { teamRadio } from "../components/TeamRadioToast";

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  requiresCtrl?: boolean;
  requiresShift?: boolean;
}

export function useKeyboardShortcuts(raceId?: number) {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'p',
      description: 'Open predictions',
      action: () => {
        if (raceId) {
          router.push(`/predict/${raceId}`);
          teamRadio.info("Opening predictions...");
        } else {
          teamRadio.info("Select a race first");
        }
      }
    },
    {
      key: 'r',
      description: 'View leaderboard',
      action: () => {
        router.push('/leaderboard');
        teamRadio.info("Loading leaderboard...");
      }
    },
    {
      key: 'c',
      description: 'Race calendar',
      action: () => {
        router.push('/calendar');
        teamRadio.info("Opening calendar...");
      }
    },
    {
      key: 's',
      description: 'Standings',
      action: () => {
        router.push('/standings');
        teamRadio.info("Loading standings...");
      }
    },
    {
      key: 'h',
      description: 'Home',
      action: () => {
        router.push('/');
      }
    },
    {
      key: '?',
      description: 'Show shortcuts',
      requiresShift: true,
      action: () => {
        teamRadio.info("P: Predict | R: Results | C: Calendar | S: Standings | H: Home");
      }
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const matchingShortcut = shortcuts.find(s => {
      const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !s.requiresCtrl || (s.requiresCtrl && event.ctrlKey);
      const shiftMatch = !s.requiresShift || (s.requiresShift && event.shiftKey);
      return keyMatch && ctrlMatch && shiftMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts, router, raceId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

// Keyboard shortcut display component
export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'P', label: 'PREDICT' },
    { key: 'R', label: 'LEADERBOARD' },
    { key: 'C', label: 'CALENDAR' },
    { key: 'S', label: 'STANDINGS' },
    { key: 'H', label: 'HOME' },
    { key: '?', label: 'HELP' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden lg:block">
      <div className="glass-card p-3 text-xs">
        <div className="font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Keyboard Shortcuts
        </div>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-[var(--bg-asphalt)] border border-[var(--glass-border)] rounded font-mono text-[var(--accent-cyan)]">
                {s.key}
              </kbd>
              <span className="text-[var(--text-muted)]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
