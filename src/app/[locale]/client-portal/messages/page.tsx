'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, User, Loader2, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ClientMessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = (session?.user as any)?.id;

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/client/messages');
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch { /* silent */ }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/client/messages?conversationId=${convId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchConversations().finally(() => setLoading(false));
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConv) fetchMessages(activeConv);
  }, [activeConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConv) fetchMessages(activeConv);
      fetchConversations();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeConv, fetchMessages, fetchConversations]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await fetch('/api/client/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', data: { conversationId: activeConv, content: input.trim() } }),
      });
      if (res.ok) {
        setInput('');
        fetchMessages(activeConv);
        fetchConversations();
      } else {
        toast.error('Failed to send message');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-navy-900 dark:text-white mb-10">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-navy-400" /></div>
          ) : conversations.length === 0 ? (
            <Card hover={false} className="p-6 text-center">
              <MessageSquare className="w-10 h-10 text-navy-300 mx-auto mb-2" />
              <p className="text-sm text-navy-400">No conversations yet</p>
            </Card>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  activeConv === conv.id
                    ? 'bg-navy-100 dark:bg-navy-800 border-navy-300 dark:border-navy-600'
                    : 'bg-white dark:bg-navy-800 border-navy-100 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-200 dark:bg-navy-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-navy-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-navy-900 dark:text-white">{conv.subject || 'Conversation'}</p>
                      {conv._count?.messages > 0 && (
                        <span className="w-2 h-2 rounded-full bg-gold-500" />
                      )}
                    </div>
                    <p className="text-xs text-navy-400 mt-0.5">
                      {conv._count?.messages || 0} unread
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {activeConv ? (
            <Card hover={false} className="flex flex-col h-[500px]">
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.senderId === userId
                        ? 'bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900'
                        : 'bg-navy-100 dark:bg-navy-700'
                    }`}>
                      <p className="text-sm text-navy-900 dark:text-white">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === userId ? 'text-white/70 dark:text-navy-700' : 'text-navy-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {msg.sender?.name || (msg.senderId === userId ? 'You' : 'Staff')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-navy-100 dark:border-navy-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                  <Button onClick={sendMessage} loading={sending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card hover={false} className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-navy-300 dark:text-navy-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">Select a conversation</h3>
                <p className="text-sm text-navy-400">Choose a conversation from the left to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
