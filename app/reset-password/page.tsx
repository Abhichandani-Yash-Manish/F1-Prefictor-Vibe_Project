"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
      setCheckingSession(false);
    };
    checkSession();

    // Listen for auth changes (when user clicks the reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { level: 1, text: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: 2, text: "Fair", color: "bg-orange-500" };
    if (score <= 3) return { level: 3, text: "Good", color: "bg-yellow-500" };
    return { level: 4, text: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully! Redirecting..." });
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    }
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] font-sans">
        <div className="text-white font-orbitron animate-pulse text-xl tracking-widest">
          VERIFYING RESET LINK...
        </div>
      </div>
    );
  }

  // No valid session - show error
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] font-sans p-4">
        <div className="bg-[#1F2833] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-black mb-4 text-white font-orbitron">
            Invalid or Expired Link
          </h1>
          <p className="text-gray-400 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/login"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700 transition uppercase tracking-widest font-orbitron"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] font-sans p-4">
      <div className="bg-[#1F2833] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        
        <h1 className="text-3xl font-black mb-2 text-center text-white font-orbitron tracking-wide">
          NEW PASSWORD
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Enter your new password below
        </p>
        
        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-900/30 border border-green-700 text-green-400"
                : "bg-red-900/30 border border-red-700 text-red-400"
            }`}
          >
            <span className="text-lg">{message.type === "success" ? "✓" : "✕"}</span>
            <span>{message.text}</span>
          </div>
        )}
        
        {/* New Password Field */}
        <div className="relative mb-2">
          <input
            className="w-full bg-[#0B0C10] border border-gray-600 p-3 rounded text-white focus:border-red-500 outline-none transition pr-12"
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            onChange={(e) => { setPassword(e.target.value); setMessage(null); }}
            value={password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {password && (
          <div className="mb-4">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= passwordStrength.level ? passwordStrength.color : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${passwordStrength.level <= 1 ? "text-red-400" : passwordStrength.level <= 2 ? "text-orange-400" : passwordStrength.level <= 3 ? "text-yellow-400" : "text-green-400"}`}>
              {passwordStrength.text}
            </p>
          </div>
        )}
        
        {/* Confirm Password Field */}
        <input
          className="w-full bg-[#0B0C10] border border-gray-600 p-3 mb-6 rounded text-white focus:border-red-500 outline-none transition"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          onChange={(e) => { setConfirmPassword(e.target.value); setMessage(null); }}
          value={confirmPassword}
        />
        
        {/* Password Match Indicator */}
        {confirmPassword && (
          <div className={`-mt-4 mb-4 text-xs ${password === confirmPassword ? "text-green-400" : "text-red-400"}`}>
            {password === confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
          </div>
        )}
        
        {/* Submit Button */}
        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-[0_0_15px_rgba(37,99,235,0.4)] uppercase tracking-widest font-orbitron disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin">⟳</span> Updating...</>
          ) : (
            <>🔐 Update Password</>
          )}
        </button>
        
        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-gray-600 hover:text-gray-400 transition">
            ← Back to Login
          </Link>
        </div>
        
      </div>
    </div>
  );
}
