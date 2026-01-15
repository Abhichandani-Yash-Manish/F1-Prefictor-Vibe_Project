import "./globals.css";
import type { Metadata } from "next";
import { Inter, Orbitron, JetBrains_Mono, Titillium_Web, Roboto_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { TeamRadioProvider } from "./components/TeamRadioToast";
import { TelemetryBgWrapper } from "./components/TelemetryBgWrapper";
import { KeyboardShortcutsHelpWrapper } from "./components/KeyboardShortcutsHelpWrapper";

// === FONTS (Data-Driven Typography) ===
const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-inter',
  display: 'swap'
});

// Headings - Technical squared-off look
const titilliumWeb = Titillium_Web({ 
  subsets: ["latin"], 
  variable: '--font-titillium',
  display: 'swap',
  weight: ['400', '600', '700', '900']
});

// Legacy heading support
const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900']
});

// Data/Numbers - Monospaced for alignment
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: '--font-roboto-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "F1 Apex | Telemetry Command Center",
  description: "Your pit wall command center. Predict qualifying and race results, compete with rivals, and climb the championship standings. Experience F1 like a race engineer.",
  keywords: ["F1", "Formula 1", "predictions", "racing", "motorsport", "league", "fantasy F1", "telemetry", "pit wall"],
  authors: [{ name: "F1 Apex" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "F1 Apex | Telemetry Command Center",
    description: "Your pit wall command center for F1 predictions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense Script */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`
        ${inter.variable} 
        ${titilliumWeb.variable} 
        ${orbitron.variable} 
        ${robotoMono.variable} 
        ${jetbrainsMono.variable} 
        font-sans bg-[var(--bg-gunmetal)] text-[var(--text-grey)] min-h-screen flex flex-col relative
      `}
        suppressHydrationWarning
      >
        <TeamRadioProvider>
          {/* Telemetry Network Background - Reactive Canvas */}
          <TelemetryBgWrapper />
          <Navbar />
          <main className="flex-grow relative z-10">{children}</main>
          <Footer />
          {/* Keyboard Shortcuts Help */}
          <KeyboardShortcutsHelpWrapper />
        </TeamRadioProvider>
      </body>
    </html>
  );
}