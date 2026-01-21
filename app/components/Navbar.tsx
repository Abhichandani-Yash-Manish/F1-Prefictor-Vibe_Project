"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import MobileMenu from "./MobileMenu";
import NotificationBell from "./NotificationBell";
import StreakBadge from "./StreakBadge";
import { TEAM_COLORS } from "../lib/drivers";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
         const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
         setProfile(data);
      } else {
         setProfile(null);
      }
    };
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          setProfile(data);
        } else {
          setProfile(null);
        }
        if (event === 'SIGNED_OUT') router.refresh();
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const baseNavLinks = [
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/standings', label: 'Standings', icon: '📊' },
    { href: '/leagues', label: 'Leagues', icon: '👥' },
    { href: '/rivalries', label: 'Rivalries', icon: '⚔️' },
    { href: '/friends', label: 'Friends', icon: '👋' },
  ];

  const navLinks = profile?.is_admin 
    ? [...baseNavLinks, { href: '/admin', label: 'Admin', icon: '⚡' }]
    : baseNavLinks;

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-out border-b
        ${scrolled 
          ? 'bg-[#0a0a0c]/80 backdrop-blur-xl border-white/10 shadow-2xl py-3' 
          : 'bg-transparent border-transparent py-5'
        }
      `}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-[var(--f1-red)] transition-colors duration-300">
                <Image 
                  src="/logo.png" 
                  alt="F1 Apex" 
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-orbitron font-bold text-lg tracking-wider text-white group-hover:text-[var(--f1-red)] transition-colors">
                F1 APEX
              </span>
            </Link>

            {/* Center: Navigation */}
            <div className="hidden lg:flex items-center bg-white/5 rounded-full px-6 py-2 border border-white/5 backdrop-blur-md">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-1 text-sm font-medium transition-colors relative group ${
                    link.href === '/admin' 
                      ? 'text-[var(--f1-red)] hover:text-red-400 font-bold tracking-wider' 
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 transition-all duration-300 ${
                    link.href === '/admin' ? 'bg-[var(--f1-red)] shadow-[0_0_10px_var(--f1-red)]' : 'bg-[var(--f1-red)]'
                  } group-hover:w-1/2`} />
                </Link>
              ))}
            </div>

            {/* Right: Auth */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <StreakBadge userId={user.id} />
                  <NotificationBell />
                  
                  <Link href="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 group">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-xs font-bold text-white group-hover:text-[var(--accent-gold)] transition-colors">
                        {profile?.username || "Racer"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                         {profile?.favorite_team || "Rookie"}
                      </span>
                    </div>
                    <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-transparent group-hover:ring-[var(--accent-gold)] transition-all"
                        style={{ background: profile?.favorite_team ? TEAM_COLORS[profile.favorite_team] : '#333' }}
                    >
                      {profile?.username ? profile.username.charAt(0).toUpperCase() : "U"}
                    </div>
                  </Link>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="hidden lg:block bg-white text-black hover:bg-[var(--accent-gold)] px-6 py-2 rounded-full font-bold text-sm transition-colors"
                >
                  Get Started
                </Link>
              )}

              {/* Mobile Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        profile={profile}
        onLogout={handleLogout}
      />
    </>
  );
}