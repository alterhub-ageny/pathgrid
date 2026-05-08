'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, User } from 'lucide-react';

const conversations = [
  { id: '1', name: 'Alex Mercer', role: 'CEO', lastMessage: 'We\'ve completed the initial designs for review.', time: '2 hours ago', unread: true },
  { id: '2', name: 'Lena Park', role: 'Creative Director', lastMessage: 'Here are the brand guidelines you requested.', time: '1 day ago', unread: false },
];

export default function ClientMessagesPage() {
  const { t } = useTranslation();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  return (
    <div className="pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-10">{t('client.messages')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveChat(conv.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  activeChat === conv.id
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
                      <p className="text-sm font-semibold">{conv.name}</p>
                      {conv.unread && <span className="w-2 h-2 rounded-full bg-gold-500" />}
                    </div>
                    <p className="text-xs text-navy-400">{conv.role}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-300 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            <Card hover={false} className="flex flex-col h-[500px]">
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {[
                  { side: 'left', text: 'Hi! I wanted to share the latest designs with you.', time: '10:30 AM' },
                  { side: 'right', text: 'Great, I\'ll take a look right away!', time: '10:35 AM' },
                  { side: 'left', text: 'We\'ve made some adjustments based on your feedback.', time: '11:00 AM' },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.side === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.side === 'right'
                        ? 'bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900'
                        : 'bg-navy-100 dark:bg-navy-700'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.side === 'right' ? 'text-white/70 dark:text-navy-700' : 'text-navy-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-navy-100 dark:border-navy-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('client.sendMessage')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                  <Button>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
