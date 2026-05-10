'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBot() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m PathgridAI. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [authError, setAuthError] = useState(false);

  const isAuthenticated = !!session;

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    setAuthError(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });
      const json = await res.json();
      if (res.status === 401) {
        setAuthError(true);
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
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Open PathgridAI Chat"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-navy-100 dark:border-navy-700 overflow-hidden"
            style={{ height: 'min(520px, 80vh)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 dark:border-navy-700 bg-navy-50 dark:bg-navy-900">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-navy-700 dark:text-gold-500" />
                <div>
                  <h3 className="text-sm font-semibold text-navy-900 dark:text-white">PathgridAI</h3>
                  <p className="text-xs text-navy-400">AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
                <X className="w-4 h-4 text-navy-500" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto" style={{ height: 'calc(100% - 110px)' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                  <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className={`p-1.5 rounded-full shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-navy-100 dark:bg-navy-700'
                        : 'bg-gold-100 dark:bg-gold-900/30'
                    }`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />}
                    </span>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-tr-md'
                        : 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white rounded-tl-md'
                    }`}>
                      <div className="prose prose-sm dark:prose-invert max-w-none">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start mb-3">
                  <div className="flex items-center gap-2 p-3 rounded-2xl rounded-tl-md bg-navy-100 dark:bg-navy-700">
                    <Loader2 className="w-4 h-4 animate-spin text-navy-400" />
                    <span className="text-sm text-navy-400">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-navy-100 dark:border-navy-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 disabled:opacity-50"
                />
                <button onClick={handleSend} disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 hover:opacity-90 transition-opacity disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
