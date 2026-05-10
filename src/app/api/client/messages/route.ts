import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  // Direct conversationId access — works for guests (UUID is unguessable)
  if (conversationId) {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, deletedAt: null },
    });
    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // For logged-in users, verify ownership
    if (session) {
      const userId = (session.user as any)?.id;
      if (conv.clientId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
    return NextResponse.json(messages);
  }

  // List conversations — requires auth
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any)?.id;

  const conversations = await prisma.conversation.findMany({
    where: { clientId: userId, deletedAt: null },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      _count: { select: { messages: { where: { deletedAt: null, read: false, senderId: { not: userId } } } } },
    },
  });

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const { action, data } = body;

  if (action === 'send') {
    if (!data?.conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 });

    const conv = await prisma.conversation.findUnique({
      where: { id: data.conversationId },
      select: { id: true, clientId: true, deletedAt: true },
    });
    if (!conv || conv.deletedAt) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    // Allow if logged-in owner or guest with valid conversationId
    if (session) {
      const userId = (session.user as any)?.id;
      if (conv.clientId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: { content: data.content, senderId: conv.clientId, conversationId: data.conversationId },
    });

    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ success: true, data: message });
  }

  if (action === 'create-ticket') {
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any)?.id;

    const conversation = await prisma.conversation.create({
      data: {
        subject: data.subject || 'New Ticket',
        clientId: userId,
      },
    });

    if (data.message?.trim()) {
      await prisma.message.create({
        data: { content: data.message.trim(), senderId: userId, conversationId: conversation.id },
      });
    }

    const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'staff'] } } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'info',
          title: 'New support ticket',
          message: `${(session.user as any)?.name || 'A client'} opened a new ticket: ${data.subject}`,
          link: `/${admin.locale || 'en'}/admin/messages`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: conversation });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
