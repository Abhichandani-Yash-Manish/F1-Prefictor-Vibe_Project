import AnalyticsDashboard from "@/app/components/Analytics/AnalyticsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | F1 Apex",
  description: "Detailed prediction performance analysis",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalyticsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const isMe = resolvedParams.id === 'me';

  return (
    <div className="min-h-screen bg-[#0B0C10] py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
         <header className="mb-8 border-b border-white/10 pb-6">
            <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-2">
                Telemetry Data
            </h1>
            <p className="text-[var(--text-muted)]">
                {isMe ? "Your prediction performance analysis" : "Racer analysis"}
            </p>
         </header>
         
         <AnalyticsDashboard userId={isMe ? undefined : resolvedParams.id} />
      </div>
    </div>
  );
}
