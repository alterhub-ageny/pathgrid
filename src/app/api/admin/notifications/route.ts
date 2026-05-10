import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const userId = (session.user as any)?.id;
    const notifications = await prisma.notification.findMany({
      where: { read: false, userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { action, data } = await request.json();

    if (action === 'mark-read') {
      const { id } = data;
      await prisma.notification.update({ where: { id }, data: { read: true } });
      return NextResponse.json({ success: true });
    }

    if (action === 'mark-all-read') {
      const userId = (session.user as any)?.id;
      await prisma.notification.updateMany({ where: { userId }, data: { read: true } });
      return NextResponse.json({ success: true });
    }

    if (action === 'create') {
      const notification = await prisma.notification.create({ data });
      return NextResponse.json({ success: true, data: notification });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
