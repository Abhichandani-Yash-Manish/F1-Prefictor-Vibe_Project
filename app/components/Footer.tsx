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
            {/* Social Links Placeholder */}
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-[var(--bg-graphite)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/50 transition-all">
                <span className="text-sm">𝕏</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-[var(--bg-graphite)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/50 transition-all">
                <span className="text-sm">📧</span>
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

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--glass-border)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--text-subtle)] text-xs">
              © {currentYear} F1 Apex. All rights reserved.
            </p>
            <p className="text-[var(--text-subtle)] text-xs text-center md:text-right">
              Not affiliated with Formula 1® or FIA. F1® is a trademark of Formula One Licensing BV.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
