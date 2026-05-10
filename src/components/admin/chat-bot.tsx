'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Bot, User, Loader2, Sparkles,
  Zap, Headphones, ChevronRight, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBot() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const locale = pathname?.match(/^\/(en|fr|ar)/)?.[1] || 'en';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m PathgridAI. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showHandoff, setShowHandoff] = useState(false);
  const [handoffName, setHandoffName] = useState(session?.user?.name || '');
  const [handoffEmail, setHandoffEmail] = useState(session?.user?.email || '');
  const [handoffMessage, setHandoffMessage] = useState('');
  const [handoffSending, setHandoffSending] = useState(false);
  const [handoffDone, setHandoffDone] = useState(false);

  const isAuthenticated = !!session;

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showHandoff]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId, locale }),
      });
      const json = await res.json();
      if (res.status === 401) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Please log in to use the chat.' }]);
      } else if (json.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: json.reply }]);
        if (json.sessionId) setSessionId(json.sessionId);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showHandoff) return;
      handleSend();
    }
  };

  const requestHandoff = async () => {
    if (!handoffEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    setHandoffSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'handoff',
          message: handoffMessage.trim(),
          name: handoffName.trim(),
          email: handoffEmail.trim(),
          subject: 'Chat Support Request',
          sessionId,
          locale,
        }),
      });
      const json = await res.json();
      if (res.ok && json.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: json.reply }]);
        setHandoffDone(true);
        setShowHandoff(false);
        toast.success('Request sent! We\'ll be in touch.');
      } else {
        toast.error(json.error || 'Failed to send request');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setHandoffSending(false);
    }
  };

  const toggleHandoff = () => {
    setShowHandoff(!showHandoff);
    if (!showHandoff && isAuthenticated && session?.user) {
      setHandoffName(session.user.name || '');
      setHandoffEmail(session.user.email || '');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Open PathgridAI Chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 dark:from-gold-400 dark:to-gold-600 text-white dark:text-navy-900 shadow-[0_0_20px_rgba(74,103,175,0.3)] dark:shadow-[0_0_20px_rgba(212,166,30,0.3)] hover:shadow-[0_0_30px_rgba(74,103,175,0.5)] dark:hover:shadow-[0_0_30px_rgba(212,166,30,0.5)] hover:scale-105 transition-all duration-300 flex items-center justify-center group"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 absolute transition-opacity duration-300" />
          <MessageCircle className="w-5 h-5 group-hover:opacity-0 transition-opacity duration-300" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 overflow-hidden"
            style={{ height: 'min(560px, 80vh)' }}
          >
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/80 dark:bg-navy-900/90 backdrop-blur-2xl border border-navy-200/50 dark:border-navy-700/50 rounded-2xl shadow-2xl" />
            {/* Gradient border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-navy-500/20 via-transparent to-gold-500/20 dark:from-gold-500/10 dark:via-transparent dark:to-navy-500/10 pointer-events-none" />

            <div className="relative flex flex-col h-full">
              {/* Header */}
              <div className="shrink-0 px-4 py-3.5 border-b border-navy-100/50 dark:border-navy-700/50 bg-gradient-to-r from-navy-800/5 to-navy-900/5 dark:from-navy-800/30 dark:to-gold-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 dark:from-gold-400 dark:to-gold-600 flex items-center justify-center shadow-lg">
                        <Bot className="w-4 h-4 text-white dark:text-navy-900" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-navy-900"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                        PathgridAI
                        <Zap className="w-3 h-3 text-gold-500" />
                      </h3>
                      <p className="text-[10px] text-navy-400 dark:text-navy-500">AI Assistant · Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleHandoff}
                      title="Talk to a human"
                      className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors group"
                    >
                      <Headphones className="w-4 h-4 text-navy-400 group-hover:text-gold-500 transition-colors" />
                    </button>
                    <button onClick={() => { setOpen(false); setShowHandoff(false); setHandoffDone(false); }} className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
                      <X className="w-4 h-4 text-navy-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages / Handoff */}
              <div className="flex-1 overflow-hidden">
                {showHandoff ? (
                  <div className="h-full p-4 overflow-y-auto">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Headphones className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-navy-900 dark:text-white">Talk to a Human</h4>
                        <p className="text-xs text-navy-400 mt-1">Leave your details and we'll get back to you</p>
                      </div>

                      {handoffDone ? (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-6">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="text-sm font-medium text-navy-900 dark:text-white">Request Sent!</p>
                          <p className="text-xs text-navy-400 mt-1">Our team will contact you shortly.</p>
                          <button
                            onClick={() => { setShowHandoff(false); setHandoffDone(false); }}
                            className="mt-4 text-xs text-gold-600 hover:underline"
                          >
                            Back to chat
                          </button>
                        </motion.div>
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={handoffName}
                            onChange={(e) => setHandoffName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-navy-200 dark:border-navy-600 bg-white/50 dark:bg-navy-800/50 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder:text-navy-400 backdrop-blur-sm"
                          />
                          <input
                            type="email"
                            value={handoffEmail}
                            onChange={(e) => setHandoffEmail(e.target.value)}
                            placeholder="Your email *"
                            required
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-navy-200 dark:border-navy-600 bg-white/50 dark:bg-navy-800/50 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder:text-navy-400 backdrop-blur-sm"
                          />
                          <textarea
                            value={handoffMessage}
                            onChange={(e) => setHandoffMessage(e.target.value)}
                            placeholder="How can we help?"
                            rows={3}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-navy-200 dark:border-navy-600 bg-white/50 dark:bg-navy-800/50 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder:text-navy-400 backdrop-blur-sm resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowHandoff(false)}
                              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-navy-200 dark:border-navy-600 text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={requestHandoff}
                              disabled={handoffSending}
                              className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium hover:from-gold-600 hover:to-gold-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {handoffSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              Send
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                ) : (
                  <div className="h-full p-4 overflow-y-auto custom-scrollbar">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
                      >
                        <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <span className={`p-1.5 rounded-full shrink-0 ${
                            msg.role === 'user'
                              ? 'bg-navy-100 dark:bg-navy-700'
                              : 'bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-900/30 dark:to-gold-800/20'
                          }`}>
                            {msg.role === 'user'
                              ? <User className="w-3.5 h-3.5 text-navy-500" />
                              : <Bot className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                            }
                          </span>
                          <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-navy-700 to-navy-800 dark:from-gold-500 dark:to-gold-600 text-white dark:text-navy-900 rounded-tr-md shadow-md'
                              : 'bg-white/60 dark:bg-navy-800/60 backdrop-blur-sm text-navy-900 dark:text-white rounded-tl-md border border-navy-100/50 dark:border-navy-700/50'
                          }`}>
                            {msg.content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/#{1,6}\s/g, '').replace(/\*(.*?)\*/g, '$1').replace(/`{1,3}(.*?)`{1,3}/g, '$1')}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {loading && (
                      <div className="flex justify-start mb-3">
                        <div className="flex items-center gap-2.5 p-3 rounded-2xl rounded-tl-md bg-white/60 dark:bg-navy-800/60 backdrop-blur-sm border border-navy-100/50 dark:border-navy-700/50">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                            className="w-1.5 h-1.5 rounded-full bg-gold-500"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-gold-500"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-gold-500"
                          />
                          <span className="text-xs text-navy-400 ml-1">Thinking</span>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              {!showHandoff && (
                <div className="shrink-0 p-3 border-t border-navy-100/50 dark:border-navy-700/50 bg-gradient-to-t from-white/50 to-transparent dark:from-navy-900/30 to-transparent">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything..."
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200/50 dark:border-navy-600/50 bg-white/50 dark:bg-navy-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 placeholder:text-navy-400 backdrop-blur-sm disabled:opacity-50"
                    />
                    <button onClick={handleSend} disabled={loading || !input.trim()}
                      className="p-2.5 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 transition-all disabled:opacity-50 shadow-md">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={toggleHandoff}
                      className="flex items-center gap-1 text-[10px] text-navy-400 hover:text-gold-500 transition-colors"
                    >
                      <Headphones className="w-3 h-3" />
                      Talk to a human
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[10px] text-navy-300 dark:text-navy-600">Powered by Groq AI</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
