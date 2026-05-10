import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any)?.id;
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (conversationId) {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, clientId: userId, deletedAt: null },
    });
    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const messages = await prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
    return NextResponse.json(messages);
  }

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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { action, data } = await request.json();
    const userId = (session.user as any)?.id;

    if (action === 'send') {
      const conv = await prisma.conversation.findFirst({
        where: { id: data.conversationId, clientId: userId, deletedAt: null },
      });
      if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

      const message = await prisma.message.create({
        data: { content: data.content, senderId: userId, conversationId: data.conversationId },
      });

      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: new Date() },
      });

      return NextResponse.json({ success: true, data: message });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
