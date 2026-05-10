import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

function buildSystemPrompt(locale: string): string {
  const langMap: Record<string, string> = {
    en: 'Respond in English.',
    fr: 'Répondez en français.',
    ar: 'رد باللغة العربية.',
  };
  const langInstruction = langMap[locale] || langMap.en;

  return `You are PathgridAI, an advanced AI assistant for the Pathgrid Agency platform. You help admins, staff, and clients with their questions about the platform, digital agency operations, project management, and general business queries. ${langInstruction}

About Pathgrid Agency:
- A full-service digital agency specializing in strategy, design, and technology
- Offers services: UI/UX Design, Web Development, Digital Strategy, Branding, SEO, Content Marketing
- Has a team of strategists, designers, and engineers
- Uses a modern tech stack: Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma
- Platform features: Admin Dashboard, Client Portal, CRM Pipeline, Accounting, Blog, Portfolio

You can help with:
1. Platform navigation and features
2. Digital agency best practices
3. Project management advice
4. Technical questions about the stack
5. General business strategy
6. Creative and design guidance

If a visitor asks to speak to a human or seems frustrated, suggest they click the "Talk to us" button above to message the team directly.

Be friendly, professional, and concise. Do NOT use markdown formatting (no **, ##, *, or bullet symbols). Write in plain text only. If you don't know something, be honest about it. Keep responses under 300 words unless asked for detail.`;
}

const FALLBACK = 'Hi! I\'m PathgridAI. How can I help you today? Feel free to ask about our services, team, or anything related to Pathgrid Agency — or just say hello!';
const SUMMARY_FALLBACK = 'Dashboard overview ready\nCheck Pipeline for lead status\nReview Invoices for pending payments\nTeam is active on current projects';

async function getChatHistory(sessionId: string) {
  try {
    return await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
  } catch {
    return [];
  }
}

async function saveChatMessages(sessionId: string, messages: { role: string; content: string }[]) {
  try {
    await prisma.chatMessage.createMany({ data: messages.map(m => ({ sessionId, ...m })) });
  } catch {
    // DB unavailable — silently skip
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json([]);

  const chatMessages = await getChatHistory(sessionId);
  return NextResponse.json(chatMessages.map(m => ({
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
  })));
}

export async function POST(request: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { message, sessionId, locale } = body;
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const chatSessionId = sessionId || `session_${Date.now()}`;

    // Dashboard summary special case
    if (chatSessionId === 'dashboard-summary') {
      if (!AI_API_KEY) return NextResponse.json({ reply: SUMMARY_FALLBACK, sessionId: chatSessionId });
    }

    if (AI_API_KEY) {
      try {
        const recent = await getChatHistory(chatSessionId);

        const msgs = [
          { role: 'system', content: buildSystemPrompt(locale || 'en') },
          ...recent.map((m: any) => ({ role: m.role, content: m.content })),
          { role: 'user', content: message },
        ];

        const res = await fetch(AI_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_API_KEY}`,
          },
          body: JSON.stringify({ model: AI_MODEL, messages: msgs, max_tokens: 500 }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content || 'No response';
          await saveChatMessages(chatSessionId, [
            { role: 'user', content: message },
            { role: 'assistant', content: reply },
          ]);
          return NextResponse.json({ reply, sessionId: chatSessionId });
        }
      } catch {
        // AI or DB failed — fall through to fallback
      }
    }

    // Fallback response
    await saveChatMessages(chatSessionId, [
      { role: 'user', content: message },
      { role: 'assistant', content: FALLBACK },
    ]);

    return NextResponse.json({ reply: FALLBACK, sessionId: chatSessionId });
  } catch {
    return NextResponse.json({ reply: FALLBACK });
  }
}
