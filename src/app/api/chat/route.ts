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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const email = searchParams.get('email');
  const conversationId = searchParams.get('conversationId');

  const chatMessages = sessionId ? await getChatHistory(sessionId) : [];

  let conversationMessages: any[] = [];
  if (conversationId) {
    try {
      const msgs = await prisma.message.findMany({
        where: { conversationId, deletedAt: null },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { role: true } } },
        take: 100,
      });
      conversationMessages = msgs.map((m) => ({
        role: m.sender.role === 'admin' || m.sender.role === 'staff' ? 'assistant' : 'user',
        content: m.content,
        createdAt: m.createdAt,
        fromConversation: true,
      }));
    } catch { /* silent */ }
  } else if (email) {
    try {
      const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (user) {
        const msgs = await prisma.message.findMany({
          where: { conversation: { clientId: user.id, deletedAt: null }, deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { role: true } } },
          take: 50,
        });
        conversationMessages = msgs.map((m) => ({
          role: m.sender.role === 'admin' || m.sender.role === 'staff' ? 'assistant' : 'user',
          content: m.content,
          createdAt: m.createdAt,
          fromConversation: true,
        }));
      }
    } catch { /* silent */ }
  }

  const merged = [...chatMessages, ...conversationMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return NextResponse.json(merged);
}

export async function POST(request: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    const { message, sessionId, locale, action, name, email, subject } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const chatSessionId = sessionId || `session_${Date.now()}`;

    // Handle human handoff
    if (action === 'handoff') {
      if (!email) {
        return NextResponse.json({ error: 'Email is required for handoff' }, { status: 400 });
      }

      let client = await prisma.user.findUnique({ where: { email } }).catch(() => null);
      if (!client) {
        client = await prisma.user.create({
          data: { name: name || email, email, role: 'client' },
        }).catch(() => null);
      }

      const clientId = client?.id;
      if (!clientId) {
        return NextResponse.json({ error: 'Could not identify or create user' }, { status: 400 });
      }

      try {
        const now = new Date();
        const conversation = await prisma.conversation.create({
          data: {
            subject: subject || 'Chat Handoff: ' + (name || email || 'Visitor'),
            clientId,
            lastMessageAt: now,
          },
        });

        await prisma.message.create({
          data: {
            content: message || `Visitor ${name || email || 'unknown'} requested to speak with a human.${message ? `\n\nInitial message: ${message}` : ''}`,
            senderId: clientId,
            conversationId: conversation.id,
          },
        });

        const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'staff'] } } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'info',
              title: 'New handoff: ' + (name || email || 'Visitor'),
              message: message || 'Wants to talk to a human',
              link: `/${admin.locale || 'en'}/admin/messages`,
            },
          });
        }

        logActivity(clientId, 'handoff', `Chat handoff requested by ${name || email || clientId}`, conversation.id, 'conversations');

        return NextResponse.json({
          reply: `Thank you${name ? ` ${name}` : ''}! A team member will get back to you shortly. We've created a conversation in your account where you can continue this discussion.`,
          conversationId: conversation.id,
          sessionId: chatSessionId,
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to create handoff' }, { status: 500 });
      }
    }

    // Handle reply to an existing conversation (visitor after handoff)
    if (action === 'reply-conversation') {
      const { conversationId, name } = await request.json().catch(() => ({})) as any;
      if (!conversationId) return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });

      try {
        const conv = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { clientId: true } });
        if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

        const msg = await prisma.message.create({
          data: { content: message, senderId: conv.clientId, conversationId },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        });

        // Notify admins
        const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'staff'] } } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'info',
              title: 'New reply: ' + (name || conv.clientId),
              message: message.substring(0, 100),
              link: `/${admin.locale || 'en'}/admin/messages`,
            },
          }).catch(() => {});
        }

        return NextResponse.json({ success: true, conversationId });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to reply' }, { status: 500 });
      }
    }

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
        // AI or DB failed — fall through to fallback below
      }
    }

    // Fallback response — always save messages for all visitors
    await saveChatMessages(chatSessionId, [
      { role: 'user', content: message },
      { role: 'assistant', content: FALLBACK },
    ]);

    return NextResponse.json({ reply: FALLBACK, sessionId: chatSessionId });
  } catch {
    return NextResponse.json({ reply: FALLBACK });
  }
}
