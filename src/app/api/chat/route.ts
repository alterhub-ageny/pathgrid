import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are PathgridAI, an advanced AI assistant for the Pathgrid Agency platform. You help admins, staff, and clients with their questions about the platform, digital agency operations, project management, and general business queries.

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

Be friendly, professional, and concise. Use markdown for formatting when helpful. If you don't know something, be honest about it. Keep responses under 300 words unless asked for detail.`;

const FALLBACK = `Hello! I'm PathgridAI. I can help you with questions about the Pathgrid Agency platform, digital agency services, project management, and more. To enable full AI capabilities, please configure an AI_API_KEY in your environment variables.

For now, here are some things I can tell you about:
- **Platform Features**: Admin Dashboard, Client Portal, CRM, Accounting, Blog
- **Services**: UI/UX Design, Web Development, Digital Strategy, Branding
- **Tech Stack**: Next.js, TypeScript, Tailwind CSS, PostgreSQL

What would you like to know?`;

const SUMMARY_FALLBACK = `• Dashboard overview ready
• Check Pipeline for lead status
• Review Invoices for pending payments
• Team is active on current projects`;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { message, sessionId } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const chatSessionId = sessionId || `session_${Date.now()}`;

    // Dashboard summary special case — returns summary-like fallback when no AI key
    if (chatSessionId === 'dashboard-summary' && !AI_API_KEY) {
      return NextResponse.json({ reply: SUMMARY_FALLBACK, sessionId: chatSessionId });
    }

    if (AI_API_KEY) {
      let messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ];

      if (session) {
        const recent = await prisma.chatMessage.findMany({
          where: { sessionId: chatSessionId },
          orderBy: { createdAt: 'asc' },
          take: 20,
        });
        if (recent.length > 0) {
          messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...recent.map((m: any) => ({ role: m.role, content: m.content })),
            { role: 'user', content: message },
          ];
        }
      }

      const res = await fetch(AI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({ model: AI_MODEL, messages, max_tokens: 500 }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: 'AI service error', details: errText }, { status: 502 });
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response';

      if (session) {
        await prisma.chatMessage.createMany({
          data: [
            { sessionId: chatSessionId, role: 'user', content: message },
            { sessionId: chatSessionId, role: 'assistant', content: reply },
          ],
        });
      }

      return NextResponse.json({ reply, sessionId: chatSessionId });
    }

    // No AI key — return fallback (only save to DB if authenticated)
    if (session) {
      await prisma.chatMessage.createMany({
        data: [
          { sessionId: chatSessionId, role: 'user', content: message },
          { sessionId: chatSessionId, role: 'assistant', content: FALLBACK },
        ],
      });
    }

    return NextResponse.json({ reply: FALLBACK, sessionId: chatSessionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
  }
}
