"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: number;
  content: string;
  message_type: string;
  race_id: number | null;
  reply_to_id: number | null;
  created_at: string;
  is_pinned: boolean;
  user_id: string;
  profiles: { username: string };
  reactions: { reaction: string; user_id: string }[];
}

interface LeagueChatProps {
  leagueId: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const REACTIONS = ['🏎️', '🔥', '😂', '👍', '💀', '🏆', '❤️', '🎉'];

export default function LeagueChat({ leagueId, isExpanded = true, onToggle }: LeagueChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    setupRealtime();
    getCurrentUser();

    return () => {
      supabase.removeChannel(supabase.channel(`league-chat-${leagueId}`));
    };
  }, [leagueId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leagues/${leagueId}/chat?limit=50`,
        {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel(`league-chat-${leagueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'league_messages',
          filter: `league_id=eq.${leagueId}`
        },
        async (payload) => {
          // Fetch the new message with profile info
          const { data } = await supabase
            .from('league_messages')
            .select('*, profiles(username)')
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            setMessages(prev => [...prev, { ...data, reactions: [] }]);
          }
        }
      )
      .subscribe();

    return channel;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues/${leagueId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (response.ok) {
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (messageId: number, reaction: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${messageId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ reaction })
      });

      // Optimistically update UI
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          const hasReaction = m.reactions.some(r => r.reaction === reaction && r.user_id === currentUserId);
          if (!hasReaction) {
            return {
              ...m,
              reactions: [...m.reactions, { reaction, user_id: currentUserId! }]
            };
          }
        }
        return m;
      }));

      setShowReactions(null);
    } catch (err) {
      console.error("Error adding reaction:", err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupReactions = (reactions: { reaction: string; user_id: string }[]) => {
    const groups: { [key: string]: number } = {};
    reactions.forEach(r => {
      groups[r.reaction] = (groups[r.reaction] || 0) + 1;
    });
    return groups;
  };

  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-lg z-50 transition-all"
      >
        💬
      </button>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl flex flex-col h-[500px] shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-transparent rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="font-bold text-white">League Chat</span>
          <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
            {messages.length} messages
          </span>
        </div>
        {onToggle && (
          <button onClick={onToggle} className="text-gray-500 hover:text-white transition">
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🏁</div>
            <div className="text-gray-500">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            const reactions = groupReactions(msg.reactions);

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    isOwn
                      ? 'bg-purple-600/30 border-purple-500/30'
                      : 'bg-gray-800/50 border-gray-700/50'
                  } border rounded-xl px-4 py-2 relative group`}
                >
                  {!isOwn && (
                    <div className="text-xs font-bold text-purple-400 mb-1">
                      {msg.profiles?.username || 'Unknown'}
                    </div>
                  )}
                  <div className="text-white text-sm">{msg.content}</div>
                  <div className="flex items-center justify-between mt-1 gap-4">
                    <div className="text-xs text-gray-500">{formatTime(msg.created_at)}</div>
                    
                    {/* Reactions display */}
                    {Object.keys(reactions).length > 0 && (
                      <div className="flex gap-1">
                        {Object.entries(reactions).map(([emoji, count]) => (
                          <span key={emoji} className="text-xs bg-gray-700/50 px-1.5 py-0.5 rounded-full">
                            {emoji} {count > 1 && count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction button */}
                  <button
                    onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                    className="absolute -right-2 -bottom-2 opacity-0 group-hover:opacity-100 transition bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded-full"
                  >
                    😀
                  </button>

                  {/* Reaction picker */}
                  {showReactions === msg.id && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg p-2 flex gap-1 shadow-xl z-10">
                      {REACTIONS.map(r => (
                        <button
                          key={r}
                          onClick={() => handleReaction(msg.id, r)}
                          className="hover:bg-gray-700 p-1 rounded transition text-lg"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 text-sm"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-bold px-4 rounded-xl transition"
          >
            {sending ? '...' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
}
