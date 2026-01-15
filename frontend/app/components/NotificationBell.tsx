"use client";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

// Reuse Supabase initialization
const useSupabase = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = useSupabase();
  const router = useRouter();

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
    
    if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
            (payload) => {
                // Should optimally verify user_id if RLS doesn't filter stream
                // Assuming RLS might not filter broadcast, we might need manual fetch
                fetchNotifications();
            }
        )
        .subscribe();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
        channel.unsubscribe();
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkRead = async (id: string, link?: string) => {
    await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (link) {
        setIsOpen(false);
        router.push(link);
    }
  };

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
        
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 relative rounded-full hover:bg-[var(--bg-onyx)] transition-colors group"
        >
            <span className="text-xl md:text-2xl opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                🔔
            </span>
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--f1-red)] text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg ring-2 ring-[var(--bg-void)]">
                    {unreadCount}
                </span>
            )}
        </button>

        {isOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-[#1F2833] border border-[var(--glass-border)] rounded-xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-fade-in-up origin-top-right">
                <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-[var(--accent-cyan)] hover:underline font-bold"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <div 
                                key={n.id}
                                onClick={() => handleMarkRead(n.id, n.link)}
                                className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!n.is_read ? 'bg-[var(--accent-gold)]/5' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1 text-lg">
                                        {n.type === 'win' ? '🏆' : n.type.includes('invite') ? '📩' : '📢'}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold text-white mb-1 ${!n.is_read ? 'text-[var(--accent-gold)]' : ''}`}>
                                            {n.title}
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                                            {n.message}
                                        </div>
                                        <div className="text-[10px] text-[var(--text-subtle)] mt-2 opacity-50">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {!n.is_read && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-[var(--accent-gold)] shrink-0 self-center" />
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-[var(--text-muted)]">
                            <div className="text-4xl opacity-20 mb-2">🔕</div>
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}
