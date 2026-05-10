import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

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

const SUMMARY_FALLBACK = '• Dashboard overview ready\n• Check Pipeline for lead status\n• Review Invoices for pending payments\n• Team is active on current projects';

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

export async function POST(request: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    const { message, sessionId, locale, action } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const chatSessionId = sessionId || `session_${Date.now()}`;

    // Handle human handoff
    if (action === 'handoff') {
      const { name, email, subject } = await request.json();
      const userId = (authSession?.user as any)?.id;

      let clientId = userId;

      // For unauthenticated visitors, find or create a user
      if (!clientId && email) {
        let client = await prisma.user.findUnique({ where: { email } }).catch(() => null);
        if (!client) {
          client = await prisma.user.create({
            data: { name: name || email, email, role: 'client' },
          }).catch(() => null);
        }
        clientId = client?.id;
      }

      if (!clientId) {
        return NextResponse.json({ error: 'Could not identify user' }, { status: 400 });
      }

      try {
        const now = new Date();
        const [conversation] = await prisma.$transaction([
          prisma.conversation.create({
            data: {
              subject: subject || 'Chat Handoff: ' + (name || email || 'Visitor'),
              clientId,
              lastMessageAt: now,
            },
          }),
        ]);

        await prisma.message.create({
          data: {
            content: message || `Visitor ${name || email || 'unknown'} requested to speak with a human.${message ? `\n\nInitial message: ${message}` : ''}`,
            senderId: clientId,
            conversationId: conversation.id,
          },
        });

        // Notify admins
        const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'staff'] } } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'info',
              title: 'New chat handoff request',
              message: `${name || email || 'A visitor'} wants to talk to a human`,
              link: `/${admin.locale || 'en'}/admin/messages`,
            },
          });
        }

        logActivity(clientId, 'handoff', `Chat handoff requested by ${name || email || clientId}`, conversation.id, 'conversations');

        return NextResponse.json({
          reply: `Thank you${name ? ` ${name}` : ''}! A team member will get back to you shortly. We've created a conversation in your account where you can continue this discussion.`,
          conversationId: conversation.id,
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to create handoff' }, { status: 500 });
      }
    }

    // Dashboard summary special case
    if (chatSessionId === 'dashboard-summary') {
      if (!AI_API_KEY) return NextResponse.json({ reply: SUMMARY_FALLBACK, sessionId: chatSessionId });
    }

    if (AI_API_KEY) {
      try {
        const recent = authSession ? await getChatHistory(chatSessionId) : [];

        const messages = [
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
          body: JSON.stringify({ model: AI_MODEL, messages, max_tokens: 500 }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content || 'No response';
          if (authSession) await saveChatMessages(chatSessionId, [
            { role: 'user', content: message },
            { role: 'assistant', content: reply },
          ]);
          return NextResponse.json({ reply, sessionId: chatSessionId });
        }
      } catch {
        // AI or DB failed — fall through to fallback below
      }
    }

    // Fallback response
    if (authSession) await saveChatMessages(chatSessionId, [
      { role: 'user', content: message },
      { role: 'assistant', content: FALLBACK },
    ]);

    return NextResponse.json({ reply: FALLBACK, sessionId: chatSessionId });
  } catch {
    return NextResponse.json({ reply: FALLBACK });
  }
}
