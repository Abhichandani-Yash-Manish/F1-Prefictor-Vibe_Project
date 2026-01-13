"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_OUT') router.refresh();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-[var(--bg-slate)]/95 backdrop-blur-xl p-4 text-[var(--text-ceramic)] shadow-[var(--shadow-card)] border-b border-[var(--glass-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Left Side: LOGO + NAME */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo Image */}
          <div className="relative w-11 h-11 overflow-hidden rounded-xl border-2 border-[var(--accent-teal)]/50 shadow-[0_0_20px_rgba(0,180,216,0.3)] group-hover:shadow-[var(--shadow-glow-teal)] group-hover:scale-105 transition-all duration-300">
            <Image 
                src="/logo.jpg" 
                alt="F1 Apex Logo" 
                fill
                sizes="44px"
                className="object-cover"
            />
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl font-black font-heading tracking-tight leading-none text-[var(--text-ceramic)] group-hover:text-[var(--accent-teal)] transition">
                F1 APEX
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-[var(--text-grey)] uppercase group-hover:text-[var(--text-ceramic)] transition">
                Telemetry
            </span>
          </div>
        </Link>

        {/* Right Side: Links */}
        <div className="flex gap-5 font-semibold items-center text-sm">
          <Link 
            href="/calendar" 
            className="text-[var(--text-grey)] hover:text-[var(--accent-teal)] transition-colors uppercase tracking-widest hidden md:block text-xs font-medium"
          >
            Calendar
          </Link>
          <Link 
            href="/standings" 
            className="text-[var(--text-grey)] hover:text-[var(--accent-teal)] transition-colors uppercase tracking-widest hidden md:block text-xs font-medium"
          >
            Standings
          </Link>
          <Link 
            href="/leagues" 
            className="text-[var(--text-grey)] hover:text-emerald-400 transition-colors uppercase tracking-widest hidden md:flex items-center gap-1.5 text-xs font-medium"
          >
            <span>🏆</span> Leagues
          </Link>
          <Link 
            href="/friends" 
            className="text-[var(--text-grey)] hover:text-purple-400 transition-colors uppercase tracking-widest hidden md:flex items-center gap-1.5 text-xs font-medium"
          >
            <span>👥</span> Friends
          </Link>
          <Link 
            href="/rivalries" 
            className="text-[var(--text-grey)] hover:text-[var(--signal-red)] transition-colors uppercase tracking-widest hidden md:flex items-center gap-1.5 text-xs font-medium"
          >
            <span>⚔️</span> Rivalries
          </Link>
          
          <Link 
            href="/admin" 
            className="text-[var(--text-muted)] hover:text-[var(--text-ceramic)] transition-colors uppercase tracking-widest hidden md:block text-[10px] border border-[var(--glass-border)] px-2.5 py-1 rounded-lg hover:border-[var(--text-grey)]"
          >
            Admin
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Racer</span>
                    <span className="text-[var(--text-ceramic)] font-mono-data text-sm">{user.email?.split('@')[0]}</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="bg-[var(--bg-slate-light)] border border-[var(--glass-border)] text-[var(--text-ceramic)] px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--signal-red)] hover:border-[var(--signal-red)] transition-all shadow-lg"
                >
                    LOGOUT
                </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-[var(--signal-red)] to-[#c20500] text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-[var(--shadow-glow-red)] transition-all"
            >
              JOIN LEAGUE
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}