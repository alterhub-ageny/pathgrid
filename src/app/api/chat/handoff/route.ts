import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { role: true } } },
      take: 100,
    });

    return NextResponse.json(messages.map(m => ({
      id: m.id,
      role: (m.sender.role === 'admin' || m.sender.role === 'staff') ? 'assistant' : 'user',
      content: m.content,
      createdAt: m.createdAt,
    })));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { action, name, email, message, sessionId, locale, subject, conversationId } = await request.json();

    if (action === 'create') {
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      let client = await prisma.user.findUnique({ where: { email } }).catch(() => null);
      if (!client) {
        client = await prisma.user.create({
          data: { name: name || email, email, role: 'client' },
        }).catch(() => null);
      }

      if (!client?.id) {
        return NextResponse.json({ error: 'Could not identify or create user' }, { status: 400 });
      }

      const now = new Date();
      const conversation = await prisma.conversation.create({
        data: {
          subject: subject || 'Chat Handoff: ' + (name || email || 'Visitor'),
          clientId: client.id,
          lastMessageAt: now,
        },
      });

      await prisma.message.create({
        data: {
          content: message || `Visitor ${name || email || 'unknown'} requested to speak with a human.${message ? `\n\nInitial message: ${message}` : ''}`,
          senderId: client.id,
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
        }).catch(() => {});
      }

      logActivity(client.id, 'handoff', `Chat handoff requested by ${name || email}`, conversation.id, 'conversations');

      return NextResponse.json({
        reply: `Thank you${name ? ` ${name}` : ''}! A team member will get back to you shortly.`,
        conversationId: conversation.id,
      });
    }

    if (action === 'reply') {
      if (!conversationId) {
        return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
      }
      if (!message) {
        return NextResponse.json({ error: 'Message required' }, { status: 400 });
      }

      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { clientId: true },
      });
      if (!conv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      const msg = await prisma.message.create({
        data: { content: message, senderId: conv.clientId, conversationId },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

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

      return NextResponse.json({ success: true, id: msg.id });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
