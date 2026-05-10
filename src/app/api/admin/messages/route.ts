import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  const userId = (session.user as any)?.id;

  if (conversationId) {
    const messages = await prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, email: true, role: true } } },
    });
    return NextResponse.json(messages);
  }

  const conversations = await prisma.conversation.findMany({
    where: { deletedAt: null },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      project: { select: { id: true, title: true } },
      _count: { select: { messages: { where: { deletedAt: null, read: false, senderId: { not: userId } } } } },
    },
  });

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { action, data } = await request.json();
    const userId = (session.user as any)?.id;

    if (action === 'send') {
      const message = await prisma.message.create({
        data: {
          content: data.content,
          senderId: userId,
          conversationId: data.conversationId,
        },
      });

      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: new Date() },
      });

      logActivity(userId, 'message', `Sent message in conversation ${data.conversationId}`, data.conversationId, 'messages');
      return NextResponse.json({ success: true, data: message });
    }

    if (action === 'mark-read') {
      await prisma.message.updateMany({
        where: { conversationId: data.conversationId, senderId: { not: userId }, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'create-conversation') {
      const conversation = await prisma.conversation.create({
        data: {
          subject: data.subject,
          clientId: data.clientId,
          adminId: userId,
          projectId: data.projectId || null,
        },
      });

      if (data.initialMessage) {
        await prisma.message.create({
          data: {
            content: data.initialMessage,
            senderId: userId,
            conversationId: conversation.id,
          },
        });
      }

      logActivity(userId, 'conversation', `Started conversation with client ${data.clientId}`, conversation.id, 'conversations');
      return NextResponse.json({ success: true, data: conversation });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
