import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--bg-midnight)] border-t border-[var(--glass-border)] mt-auto">
      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold tracking-tight text-white mb-4">
              F1 <span className="text-gradient-gold">APEX</span>
            </h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-md mb-6">
              Your command center for Formula 1 predictions. Compete with friends, climb the standings, 
              and prove you're the ultimate racing analyst.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {/* WhatsApp Channel */}
              <a 
                href="https://whatsapp.com/channel/0029Vb7TduiFnSz5jH2DBt44" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[var(--bg-graphite)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[#25D366] hover:border-[#25D366]/50 transition-all"
                title="Join WhatsApp Channel"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/yash.it.is._/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[var(--bg-graphite)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[#E4405F] hover:border-[#E4405F]/50 transition-all"
                title="Follow on Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              {/* GitHub */}
              <a 
                href="https://github.com/Yash-Abhichandani" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[var(--bg-graphite)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:border-white/50 transition-all"
                title="View on GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              
              {/* Email */}
              <a 
                href="mailto:yashraj2507@gmail.com" 
                className="w-9 h-9 rounded-lg bg-[var(--bg-graphite)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--f1-red)] hover:border-[var(--f1-red)]/50 transition-all"
                title="Send Email"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-5">Navigate</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/', label: 'Home' },
                { href: '/calendar', label: 'Race Calendar' },
                { href: '/standings', label: 'Standings' },
                { href: '/leagues', label: 'Leagues' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[var(--text-muted)] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-5">Legal</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[var(--text-muted)] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Team & Credits Section */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent border border-[var(--accent-gold)]/20 relative overflow-hidden">
          {/* Decorative racing stripe */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--f1-red)] via-[var(--accent-gold)] to-[var(--accent-cyan)]" />
          
          <div className="pl-4">
            <h4 className="text-xs font-bold text-[var(--accent-gold)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span>🏆</span> The Pit Crew
            </h4>
            
            {/* Lead Developer */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--f1-red)] to-[var(--accent-gold)] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  YA
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Yash Abhichandani</div>
                  <div className="text-[10px] text-[var(--accent-gold)] uppercase tracking-wider font-bold">Lead Developer & Founder</div>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-white/10 to-transparent mb-4" />
            
            {/* Special Thanks */}
            <div className="flex items-start gap-2">
              <span className="text-[var(--accent-cyan)] text-sm">💙</span>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Special thanks to </span>
                <span className="text-xs text-white font-semibold">Grand Prix Viewer&apos;s Association</span>
                <span className="text-xs text-[var(--text-muted)]"> for believing in this project from the very beginning.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unofficial Project Notice */}
        <div className="mb-8 p-4 rounded-xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/20">
          <div className="flex items-start gap-3">
            <span className="text-[var(--accent-cyan)] text-lg">⚡</span>
            <div>
              <h5 className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Unofficial Fan Project</h5>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                This is an independent fan-made project created for entertainment purposes only. 
                We are not affiliated with, endorsed by, or connected to Formula 1®, FIA, or any F1 team.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--glass-border)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[var(--text-subtle)] text-xs">
                © {currentYear} F1 Apex. All rights reserved.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold tracking-[0.1em] text-[var(--text-muted)] uppercase">Fan-Made • Non-Commercial</span>
              </div>
            </div>
            
            {/* Legal Disclaimer */}
            <div className="text-center md:text-left">
              <p className="text-[var(--text-subtle)] text-[10px] leading-relaxed max-w-4xl">
                <strong className="text-[var(--text-muted)]">Disclaimer:</strong> This website is an unofficial fan project and is not associated with Formula One World Championship Limited, 
                the Fédération Internationale de l&apos;Automobile (FIA), or any Formula 1 team. Formula 1®, F1®, the F1 logo, and all related marks are trademarks 
                of Formula One Licensing BV. All team names, driver names, and related imagery are used for informational and fan entertainment purposes only. 
                No copyright infringement is intended. This is a free, non-commercial project made by fans, for fans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
