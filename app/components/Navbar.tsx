"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import MobileMenu from "./MobileMenu";
import NotificationBell from "./NotificationBell";
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
      }
    };
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_OUT') router.refresh();
    });

    // Scroll detection for glass effect
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

  const navLinks = [
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/standings', label: 'F1 Standings', icon: '📊' },
    { href: '/leagues', label: 'Leagues', icon: '👥' },
    { href: '/rivalries', label: 'Rivalries', icon: '⚔️' },
  ];

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-out
        ${scrolled 
          ? 'bg-[#0a0a0c]/90 backdrop-blur-xl shadow-[0_1px_0_rgba(201,169,98,0.1),0_4px_24px_rgba(0,0,0,0.4)]' 
          : 'bg-transparent'
        }
      `}>
        {/* Gold accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo Container */}
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--accent-gold)]/40 shadow-lg group-hover:shadow-[var(--shadow-glow-gold)] transition-all duration-300 group-hover:scale-105">
                <Image 
                  src="/logo.jpg" 
                  alt="F1 Apex Logo" 
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              
              {/* Text */}
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-[var(--accent-gold)] transition-colors duration-300">
                  F1 APEX
                </span>
                <span className="text-[10px] font-medium tracking-[0.25em] text-[var(--text-muted)] uppercase">
                  Command Center
                </span>
              </div>
            </Link>

            {/* Center: Navigation (Desktop) */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="nav-link group relative px-4 py-2 flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors duration-300"
                >
                  <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                  <span className="text-[13px] font-medium tracking-wide">{link.label}</span>
                  
                  {/* Underline indicator */}
                  <span className="absolute bottom-0 left-4 right-4 h-px bg-[var(--accent-gold)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </div>

            {/* Right: Auth Section */}
            <div className="flex items-center gap-4">
              {/* Admin Link (subtle) */}
              <Link 
                href="/admin" 
                className="hidden md:flex text-[11px] font-medium text-[var(--text-subtle)] hover:text-[var(--text-muted)] tracking-wider uppercase transition-colors"
              >
                Admin
              </Link>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <NotificationBell />
                  </div>
                    {/* Profile Link */}
                  <Link href="/profile" className="flex items-center gap-3 group cursor-pointer">
                    <div className="hidden md:flex flex-col items-end group-hover:text-[var(--accent-gold)] transition-colors">
                      <span className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-wider">
                        {profile?.favorite_team || "Racer"}
                      </span>
                      <span className="text-sm font-medium text-white font-mono">
                         {profile?.username || user.email?.split('@')[0]}
                      </span>
                    </div>
                    
                    {/* Avatar Placeholder */}
                    <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold text-sm group-hover:ring-2 ring-[var(--accent-gold)] transition-all shadow-lg"
                        style={{ 
                            background: profile?.favorite_team ? TEAM_COLORS[profile.favorite_team] : 'var(--accent-gold)',
                            color: '#fff'
                        }}
                    >
                      {profile?.username ? profile.username.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  
                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="hidden lg:block px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-graphite)] border border-[var(--glass-border)] hover:border-[var(--f1-red)]/50 hover:text-[var(--f1-red)] transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="hidden lg:block btn-primary px-6 py-2.5 text-sm"
                >
                  Get Started
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}