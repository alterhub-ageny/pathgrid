import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any)?.id;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'invoices') {
    const items = await prisma.invoice.findMany({
      where: { clientId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  }

  if (type === 'projects') {
    const items = await prisma.project.findMany({
      where: { clientId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  }

  if (type === 'assets') {
    const projects = await prisma.project.findMany({
      where: { clientId: userId, deletedAt: null },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);
    const items = await prisma.asset.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  }

  if (type === 'stats') {
    const invoiceCount = await prisma.invoice.count({ where: { clientId: userId, deletedAt: null } });
    const projectCount = await prisma.project.count({ where: { clientId: userId, deletedAt: null, status: 'active' } });
    const conversationCount = await prisma.conversation.count({
      where: { clientId: userId, deletedAt: null },
    });
    const unreadMessages = await prisma.message.count({
      where: {
        conversation: { clientId: userId, deletedAt: null },
        deletedAt: null,
        read: false,
        senderId: { not: userId },
      },
    });
    return NextResponse.json({ invoiceCount, projectCount, conversationCount, unreadMessages });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
