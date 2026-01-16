"use client";
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export function KeyboardShortcutsHelpWrapper() {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  
  return <KeyboardShortcutsHelp />;
}
