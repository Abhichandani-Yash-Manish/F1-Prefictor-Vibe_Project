import NotificationPreferences from "@/app/components/NotificationPreferences";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | F1 Apex",
  description: "Manage your notification preferences",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0B0C10] py-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
         <header className="mb-10 border-b border-white/10 pb-6">
            <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
                Settings
            </h1>
            <p className="text-[var(--text-muted)]">
                Manage how we contact you
            </p>
         </header>
         
         <NotificationPreferences />
      </div>
    </div>
  );
}
