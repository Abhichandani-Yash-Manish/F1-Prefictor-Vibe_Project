"use client";
import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProfileRedirect() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const redirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace(`/profile/${user.id}`);
      } else {
        router.push("/login");
      }
    };
    redirect();
  }, [router, supabase]);

  return <LoadingSpinner variant="f1" message="Accessing Command Center..." />;
}
