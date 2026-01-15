"use client";
import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AuthCallbackPage() {
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase will automatically handle the URL hash/query params
      // and set the session. We just need to check if it worked.
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login?error=auth_failed");
        return;
      }
      
      if (session) {
        // Successfully authenticated - redirect to home
        router.push("/");
        router.refresh();
      } else {
        // No session - might still be processing, wait a bit
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            router.push("/");
            router.refresh();
          } else {
            router.push("/login");
          }
        }, 1000);
      }
    };

    handleCallback();
  }, []);

  return <LoadingSpinner message="Authenticating..." />;
}
