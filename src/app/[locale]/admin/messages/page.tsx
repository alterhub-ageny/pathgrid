'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, User, Plus, Search, Loader2, Trash2, Mail, Phone, Building2,
  Check, CheckCheck, Clock, X, ChevronLeft, Paperclip, Smile, MoreVertical
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

function formatRelativeTime(dateStr: string) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const AVATAR_COLORS = [
  'from-gold-400 to-gold-600', 'from-navy-500 to-navy-700', 'from-emerald-400 to-emerald-600',
  'from-rose-400 to-rose-600', 'from-violet-400 to-violet-600', 'from-cyan-400 to-cyan-600',
  'from-amber-400 to-amber-600', 'from-teal-400 to-teal-600',
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMobileList, setShowMobileList] = useState(true);

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
      if (Array.isArray(data)) {
        setMessages(data);
        // Mark as read
        fetch('/api/admin/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark-read', data: { conversationId: convId } }),
        }).catch(() => {});
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchConversations().finally(() => setLoading(false));
    fetch('/api/admin/data?type=clients').then(r => r.json()).then(d => { if (Array.isArray(d)) setClients(d.filter((c: any) => c.role === 'client' && !c.deletedAt)); }).catch(() => {});
    fetch('/api/admin/data?type=projects').then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d.filter((p: any) => !p.deletedAt)); }).catch(() => {});
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConv) { fetchMessages(activeConv); setShowMobileList(false); }
  }, [activeConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time polling every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConv) fetchMessages(activeConv);
      fetchConversations();
    }, 2000);
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
        if (activeConv === convId) { setActiveConv(null); setMessages([]); setShowMobileList(true); }
        fetchConversations();
        toast.success('Moved to trash');
      }
    } catch { /* silent */ }
  };

  const filtered = conversations.filter((c) =>
    c.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.client?.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const userId = (session?.user as any)?.id;

  const activeConversation = conversations.find((c) => c.id === activeConv);

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
        <div className={`lg:col-span-1 ${showMobileList ? 'block' : 'hidden lg:block'}`}>
          <Card hover={false} className="p-0 overflow-hidden border-navy-200/50 dark:border-navy-700/50 shadow-sm">
            <div className="p-3 border-b border-navy-100 dark:border-navy-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-900 dark:text-white placeholder:text-navy-400"
                />
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-navy-400">
                <span className="font-medium">{conversations.length} conversations</span>
                <span>·</span>
                <span>{conversations.filter(c => (c._count?.messages || 0) > 0).length} active</span>
              </div>
            </div>
            <div className="divide-y divide-navy-100 dark:divide-navy-700 max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-navy-400" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-10 h-10 text-navy-300 dark:text-navy-600 mx-auto mb-3" />
                  <p className="text-sm text-navy-400 dark:text-navy-500">No conversations found</p>
                </div>
              ) : (
                filtered.map((conv) => {
                  const unread = conv._count?.messages || 0;
                  const lastMsg = conv.lastMessageAt;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv.id)}
                      className={`w-full text-left p-4 transition-all duration-200 hover:bg-navy-50 dark:hover:bg-navy-800/50 relative group ${
                        activeConv === conv.id ? 'bg-navy-100 dark:bg-navy-800 ring-1 ring-navy-200 dark:ring-navy-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(conv.id)} flex items-center justify-center shrink-0 shadow-sm`}>
                          <span className="text-white text-xs font-bold">{getInitials(conv.client?.name || conv.client?.email || '?')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold truncate text-navy-900 dark:text-white">
                              {conv.client?.name || conv.client?.email || 'Unknown'}
                            </p>
                            {lastMsg && (
                              <span className="text-[10px] text-navy-400 dark:text-navy-500 shrink-0">
                                {formatRelativeTime(lastMsg)}
                              </span>
                            )}
                          </div>
                          {conv.subject && (
                            <p className="text-xs text-navy-500 dark:text-navy-400 truncate mt-0.5">{conv.subject}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {unread > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gold-500 text-white text-[10px] font-bold">
                                {unread}
                              </span>
                            )}
                            {conv.client?.company && (
                              <span className="text-[10px] text-navy-400 dark:text-navy-500 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {conv.client.company}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-navy-400 hover:text-red-500 transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Chat area */}
        <div className={`lg:col-span-2 ${!showMobileList ? 'block' : 'hidden lg:block'}`}>
          {activeConv && activeConversation ? (
            <Card hover={false} className="flex flex-col h-[700px] p-0 border-navy-200/50 dark:border-navy-700/50 shadow-sm overflow-hidden">
              {/* Chat header */}
              <div className="shrink-0 px-5 py-4 border-b border-navy-100 dark:border-navy-700 bg-gradient-to-r from-navy-50/80 to-white dark:from-navy-800/80 dark:to-navy-900/80">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowMobileList(true); setActiveConv(null); }}
                    className="lg:hidden p-1 -ml-1 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700"
                  >
                    <ChevronLeft className="w-5 h-5 text-navy-500" />
                  </button>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(activeConversation.id)} flex items-center justify-center shrink-0 shadow-sm`}>
                    <span className="text-white text-xs font-bold">
                      {getInitials(activeConversation.client?.name || activeConversation.client?.email || '?')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-navy-900 dark:text-white truncate">
                        {activeConversation.client?.name || activeConversation.client?.email || 'Client'}
                      </h3>
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    </div>
                    <p className="text-xs text-navy-400 dark:text-navy-500 truncate">{activeConversation.subject}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-navy-400 dark:text-navy-500">
                    {activeConversation.client?.email && (
                      <span className="flex items-center gap-1.5 bg-navy-50 dark:bg-navy-800 px-2.5 py-1 rounded-full">
                        <Mail className="w-3 h-3" />
                        <span className="hidden md:inline">{activeConversation.client.email}</span>
                      </span>
                    )}
                    {activeConversation.project?.title && (
                      <span className="flex items-center gap-1.5 bg-navy-50 dark:bg-navy-800 px-2.5 py-1 rounded-full">
                        <Building2 className="w-3 h-3" />
                        {activeConversation.project.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-5 space-y-3 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent via-transparent to-navy-50/30 dark:to-navy-900/20">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-navy-300 dark:text-navy-600 mx-auto mb-3" />
                      <p className="text-sm text-navy-400 dark:text-navy-500">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === userId;
                    const isFirst = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;
                    const isLast = idx === messages.length - 1 || messages[idx + 1]?.senderId !== msg.senderId;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-3' : ''}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                          {!isMe && isLast && (
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(msg.sender?.id || msg.senderId)} flex items-center justify-center shrink-0 shadow-sm mb-0.5`}>
                              <span className="text-white text-[9px] font-bold">
                                {getInitials(msg.sender?.name || msg.sender?.email || '?')}
                              </span>
                            </div>
                          )}
                          {!isMe && !isLast && <div className="w-7 shrink-0" />}
                          <div className="space-y-1">
                            <div className={`relative ${
                              isMe
                                ? 'bg-gradient-to-br from-navy-700 to-navy-800 dark:from-gold-500 dark:to-gold-600 text-white dark:text-navy-900 shadow-md'
                                : 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white border border-navy-100 dark:border-navy-700 shadow-sm'
                            } ${isLast ? (isMe ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm') : 'rounded-2xl'}`}>
                              <div className="px-4 py-2.5">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'} px-1`}>
                              <span className="text-[10px] text-navy-400 dark:text-navy-500">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                idx === messages.length - 1 ? (
                                  <Clock className="w-3 h-3 text-navy-400 dark:text-navy-500" />
                                ) : (
                                  <CheckCheck className="w-3 h-3 text-gold-500" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 p-4 border-t border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-900/50">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 rounded-xl border border-navy-200 dark:border-navy-600 bg-navy-50 dark:bg-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-900 dark:text-white placeholder:text-navy-400 pr-10"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-300 transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    onClick={sendMessage}
                    loading={sending}
                    disabled={!input.trim()}
                    className="h-[46px] px-5 rounded-xl bg-gradient-to-br from-navy-700 to-navy-800 dark:from-gold-500 dark:to-gold-600 hover:from-navy-800 hover:to-navy-900 dark:hover:from-gold-600 dark:hover:to-gold-700 text-white shadow-md transition-all duration-200"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card hover={false} className="flex items-center justify-center h-[700px] border-navy-200/50 dark:border-navy-700/50">
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-800 dark:to-navy-700 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <MessageSquare className="w-8 h-8 text-navy-400 dark:text-navy-500" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">Select a conversation</h3>
                <p className="text-sm text-navy-400 dark:text-navy-500 max-w-sm">
                  Choose a conversation from the sidebar or start a new one to begin messaging with your clients
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConv && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewConv(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-navy-200 dark:border-navy-700 p-6 w-full max-w-lg z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-bold text-navy-900 dark:text-white">New Conversation</h2>
                <button onClick={() => setShowNewConv(false)} className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
                  <X className="w-4 h-4 text-navy-400" />
                </button>
              </div>
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
                    className="w-full px-3 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500 placeholder:text-navy-400"
                    placeholder="First message..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="ghost" onClick={() => setShowNewConv(false)}>Cancel</Button>
                  <Button onClick={createConversation} className="bg-gradient-to-r from-navy-700 to-navy-800 dark:from-gold-500 dark:to-gold-600 text-white">Start Conversation</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
