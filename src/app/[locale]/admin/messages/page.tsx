'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, User, Plus, Search, Loader2, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewConv, setShowNewConv] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch { /* silent */ }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/admin/messages?conversationId=${convId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchConversations().finally(() => setLoading(false));
    fetch('/api/admin/data?type=clients').then(r => r.json()).then(d => { if (Array.isArray(d)) setClients(d.filter((c: any) => c.role === 'client' && !c.deletedAt)); }).catch(() => {});
    fetch('/api/admin/data?type=projects').then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d.filter((p: any) => !p.deletedAt)); }).catch(() => {});
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
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConv, fetchMessages, fetchConversations]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/messages', {
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

  const createConversation = async () => {
    if (!newClientId || !newSubject.trim()) {
      toast.error('Client and subject required');
      return;
    }
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-conversation',
          data: {
            clientId: newClientId,
            subject: newSubject.trim(),
            projectId: newProjectId || null,
            initialMessage: newMessage.trim() || null,
          },
        }),
      });
      if (res.ok) {
        setShowNewConv(false);
        setNewClientId('');
        setNewSubject('');
        setNewProjectId('');
        setNewMessage('');
        fetchConversations();
        toast.success('Conversation started');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const deleteConversation = async (convId: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'conversations', action: 'delete', data: { id: convId } }),
      });
      if (res.ok) {
        if (activeConv === convId) { setActiveConv(null); setMessages([]); }
        fetchConversations();
        toast.success('Moved to trash');
      }
    } catch { /* silent */ }
  };

  const filtered = conversations.filter((c) =>
    c.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const userId = (session?.user as any)?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">
            Messages
          </h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1">Manage client conversations</p>
        </div>
        <Button onClick={() => setShowNewConv(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Conversation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations list */}
        <div className="lg:col-span-1">
          <Card hover={false} className="p-0 overflow-hidden">
            <div className="p-3 border-b border-navy-100 dark:border-navy-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 dark:text-navy-200" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
            </div>
            <div className="divide-y divide-navy-100 dark:divide-navy-700 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-navy-400 dark:text-navy-200" /></div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-sm text-navy-400 dark:text-navy-200 py-12">No conversations</p>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv.id)}
                    className={`w-full text-left p-4 transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/50 ${
                      activeConv === conv.id ? 'bg-navy-100 dark:bg-navy-800' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-navy-200 dark:bg-navy-700 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-navy-500 dark:text-navy-200" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate text-navy-900 dark:text-white">
                              {conv.client?.name || conv.client?.email || 'Unknown'}
                            </p>
                            {conv.subject && (
                              <p className="text-xs text-navy-400 dark:text-navy-200 truncate">{conv.subject}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-navy-400 dark:text-navy-200 mt-1">
                          {conv._count?.messages || 0} unread
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-navy-400 dark:text-navy-200 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2">
          {activeConv ? (
            <Card hover={false} className="flex flex-col h-[700px] p-0">
              {(() => {
                const conv = conversations.find((c) => c.id === activeConv);
                return (
                  <div className="px-5 py-4 border-b border-navy-100 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-navy-900 dark:text-white">
                          {conv?.client?.name || conv?.client?.email || 'Client'}
                        </h3>
                        <p className="text-xs text-navy-400 dark:text-navy-200">{conv?.subject}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-navy-400 dark:text-navy-200">
                        {conv?.client?.email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{conv.client.email}</span>
                        )}
                        {conv?.project?.title && (
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{conv.project.title}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.senderId === userId
                        ? 'bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-br-md'
                        : 'bg-navy-100 dark:bg-navy-700 rounded-bl-md'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === userId ? 'text-white/70 dark:text-navy-700' : 'text-navy-400 dark:text-navy-200'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {msg.sender?.name || (msg.senderId === userId ? 'You' : 'Client')}
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
                    className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-900 dark:text-white placeholder:text-navy-400"
                  />
                  <Button onClick={sendMessage} loading={sending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card hover={false} className="flex items-center justify-center h-[700px]">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-navy-300 dark:text-navy-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">Select a conversation</h3>
                <p className="text-sm text-navy-400 dark:text-navy-200">Choose a conversation from the left or start a new one</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewConv(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-navy-200 dark:border-navy-700 p-6 w-full max-w-lg z-10">
            <h2 className="text-xl font-serif font-bold text-navy-900 dark:text-white mb-4">New Conversation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Client</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                  <option value="">Select client...</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name || c.email} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Conversation subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Related Project (optional)</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                  <option value="">None</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Initial Message (optional)</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="First message..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowNewConv(false)}>Cancel</Button>
                <Button onClick={createConversation}>Start Conversation</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
