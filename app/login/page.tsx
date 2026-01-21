"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEAM_COLORS, ALL_DRIVERS_NAMES, DRIVERS_DATA_2026 } from "../lib/drivers";

type AuthMode = "signin" | "signup" | "magic-link" | "forgot-password";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [favTeam, setFavTeam] = useState("");
  const [favDriver, setFavDriver] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
         if (session) {
            router.push('/');
         } else {
            setCheckingSession(false);
         }
      } catch (error) {
         setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const clearMessage = () => setMessage(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { level: 1, text: "Weak", color: "bg-[var(--f1-red)]" };
    if (score <= 2) return { level: 2, text: "Fair", color: "bg-[var(--status-warning)]" };
    if (score <= 3) return { level: 3, text: "Good", color: "bg-[var(--accent-cyan)]" };
    return { level: 4, text: "Strong", color: "bg-[var(--status-success)]" };
  };

  const passwordStrength = getPasswordStrength(password);

  const withTimeout = async <T,>(promise: Promise<T>, ms = 8000): Promise<T> => {
      const timeout = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Request timed out. Check connection.")), ms)
      );
      return Promise.race([promise, timeout]);
  };

  const handleSignUp = async () => {
    if (!email || !password || (authMode === "signup" && !username)) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
        const { error } = await withTimeout(supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: `${location.origin}/auth/callback`,
            data: { 
              username,
              favorite_team: favTeam,
              favorite_driver: favDriver
            } 
          },
        }));

        if (!error) {
           // Send welcome email (fire and forget)
           fetch('/api/auth/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, username })
           }).catch(console.error);
           
           setMessage({ type: "success", text: "Check your email for the confirmation link!" });
        } else {
           setMessage({ type: "error", text: error.message });
        }
    } catch (err: any) {
        setMessage({ type: "error", text: err.message || "An error occurred" });
    } finally {
        setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
        const { error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
        
        if (error) {
          setMessage({ type: "error", text: error.message });
          setLoading(false);
        } else {
          router.push("/");
          router.refresh();
          // Keep loading true during redirect for seamless transition
        }
    } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Login timed out" });
        setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
        const { error } = await withTimeout(supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        }));
        
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Magic link sent! Check your email." });
        }
    } catch (err: any) {
        setMessage({ type: "error", text: err.message });
    } finally {
        setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
        const { error } = await withTimeout(supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
        }));
        
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Password reset link sent!" });
        }
    } catch (err: any) {
        setMessage({ type: "error", text: err.message });
    } finally {
        setLoading(false);
    }
  };
  
  if (checkingSession) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)]">
           <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--f1-red)] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-[var(--text-muted)] text-sm font-mono tracking-widest">AUTHENTICATING...</div>
           </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] p-4 relative overflow-hidden">
      {/* Racing stripes */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--f1-red)] via-[var(--f1-red)]/50 to-transparent" />
      <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[var(--accent-gold)] via-[var(--accent-gold)]/50 to-transparent" />
      
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--f1-red)] rounded-full blur-[200px] opacity-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-cyan)] rounded-full blur-[200px] opacity-10" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="glass-card p-8 md:p-10">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h2 className="text-3xl font-black text-white font-orbitron tracking-tight">
                F1 <span className="text-[var(--f1-red)]">APEX</span>
              </h2>
            </Link>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${
              message.type === "success"
                ? "bg-[rgba(16,185,129,0.12)] border border-[var(--status-success)]/30 text-[var(--status-success)]"
                : "bg-[var(--f1-red-dim)] border border-[var(--f1-red)]/30 text-[var(--f1-red)]"
            }`}>
              <span>{message.type === "success" ? "✓" : "✕"}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Form Content */}
          {authMode === "magic-link" ? (
            <>
              <h1 className="text-2xl font-bold text-center text-white mb-2">Magic Link</h1>
              <p className="text-[var(--text-muted)] text-center text-sm mb-8">Sign in without a password</p>
              
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
                className="w-full mb-4"
              />
              
              <button onClick={handleMagicLink} disabled={loading} className="w-full btn-primary py-4 mb-4">
                {loading ? "Sending..." : "✨ Send Magic Link"}
              </button>
              
              <button onClick={() => { setAuthMode("signin"); clearMessage(); }} className="w-full text-sm text-[var(--text-muted)] hover:text-white transition">
                ← Back to Sign In
              </button>
            </>
          ) : authMode === "forgot-password" ? (
            <>
              <h1 className="text-2xl font-bold text-center text-white mb-2">Reset Password</h1>
              <p className="text-[var(--text-muted)] text-center text-sm mb-8">We'll email you a reset link</p>
              
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
                className="w-full mb-4"
              />
              
              <button onClick={handleForgotPassword} disabled={loading} className="w-full btn-teal py-4 mb-4">
                {loading ? "Sending..." : "🔐 Send Reset Link"}
              </button>
              
              <button onClick={() => { setAuthMode("signin"); clearMessage(); }} className="w-full text-sm text-[var(--text-muted)] hover:text-white transition">
                ← Back to Sign In
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center text-white mb-2">
                {authMode === "signup" ? "Join the Grid" : "Welcome Back"}
              </h1>
              <p className="text-[var(--text-muted)] text-center text-sm mb-8">
                {authMode === "signup" ? "Create your predictor profile" : "Sign in to continue racing"}
              </p>
              
              {authMode === "signup" && (
                <>
                  <input
                    type="text"
                    placeholder="Choose Username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); clearMessage(); }}
                    className="w-full mb-4"
                  />
                  
                  {/* Personalization Fields */}
                  <div className="flex gap-2 mb-4">
                    <select
                      value={favTeam}
                      onChange={(e) => { setFavTeam(e.target.value); clearMessage(); }}
                      className="flex-1 bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[var(--accent-gold)] appearance-none"
                    >
                      <option value="">Select Team...</option>
                      {Object.keys(TEAM_COLORS).map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                    
                    <select
                      value={favDriver}
                      onChange={(e) => setFavDriver(e.target.value)}
                      className="flex-1 bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[var(--accent-gold)] appearance-none"
                    >
                      <option value="">Select Driver...</option>
                      {DRIVERS_DATA_2026.map(d => (
                        <option key={d.name} value={d.name}>{d.name} #{d.number}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
                className="w-full mb-4"
              />
              
              <div className="relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearMessage(); }}
                  className="w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              
              {/* Password Strength */}
              {authMode === "signup" && password && (
                <div className="mb-4">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded ${level <= passwordStrength.level ? passwordStrength.color : "bg-[var(--bg-graphite)]"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{passwordStrength.text}</p>
                </div>
              )}
              
              {authMode === "signin" && (
                <div className="text-right mb-4">
                  <button onClick={() => { setAuthMode("forgot-password"); clearMessage(); }} className="text-sm text-[var(--text-subtle)] hover:text-[var(--accent-cyan)]">
                    Forgot Password?
                  </button>
                </div>
              )}
              
              {authMode === "signup" && <div className="mb-4" />}
              
              <button
                onClick={authMode === "signup" ? handleSignUp : handleSignIn}
                disabled={loading}
                className="w-full bg-[var(--f1-red)] hover:bg-[var(--f1-red-bright)] text-white font-bold py-4 rounded-xl transition shadow-[var(--shadow-glow-red)] mb-4 uppercase tracking-wider"
              >
                {loading ? "Loading..." : authMode === "signup" ? "Create Account" : "Sign In"}
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--glass-border)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[var(--bg-onyx)] px-4 text-[var(--text-subtle)]">or</span>
                </div>
              </div>
              
              <button onClick={() => { setAuthMode("magic-link"); clearMessage(); }} className="w-full btn-ghost py-3 border border-[var(--glass-border)] hover:border-[var(--accent-gold)]/50 mb-4 text-sm">
                ✨ Magic Link (No Password)
              </button>
              
              <div className="text-center text-sm text-[var(--text-muted)]">
                {authMode === "signup" ? "Already have an account? " : "Don't have an account? "}
                <button 
                  onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); clearMessage(); }}
                  className="text-[var(--accent-gold)] hover:text-white font-bold"
                >
                  {authMode === "signup" ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}