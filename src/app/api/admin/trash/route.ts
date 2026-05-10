import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

const trashModels: Record<string, any> = {
  invoices: prisma.invoice,
  leads: prisma.lead,
  notes: prisma.note,
  tasks: prisma.task,
  'calendar-events': prisma.calendarEvent,
  transactions: prisma.transaction,
  projects: prisma.project,
  clients: prisma.user,
  conversations: prisma.conversation,
  messages: prisma.message,
};

const modelLabels: Record<string, string> = {
  invoices: 'invoice',
  leads: 'lead',
  notes: 'note',
  tasks: 'task',
  'calendar-events': 'calendar event',
  transactions: 'transaction',
  projects: 'project',
  clients: 'client',
  conversations: 'conversation',
  messages: 'message',
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const results: any[] = [];

    for (const [key, model] of Object.entries(trashModels)) {
      try {
        let items;
        if (key === 'conversations') {
          items = await model.findMany({
            where: { deletedAt: { not: null } },
            orderBy: { deletedAt: 'desc' },
            include: {
              client: { select: { name: true, email: true } },
            },
          });
        } else if (key === 'messages') {
          items = await model.findMany({
            where: { deletedAt: { not: null } },
            orderBy: { deletedAt: 'desc' },
            include: { sender: { select: { name: true } } },
          });
        } else if (key === 'clients') {
          items = await model.findMany({
            where: { deletedAt: { not: null } },
            orderBy: { deletedAt: 'desc' },
            select: { id: true, name: true, email: true, company: true, deletedAt: true, role: true },
          });
        } else {
          items = await model.findMany({
            where: { deletedAt: { not: null } },
            orderBy: { deletedAt: 'desc' },
          });
        }

        for (const item of items) {
          const daysAgo = item.deletedAt ? Math.floor((Date.now() - new Date(item.deletedAt).getTime()) / 86400000) : 0;
          results.push({
            id: item.id,
            type: key,
            label: modelLabels[key] || key,
            title: item.title || item.name || item.number || item.subject || item.label || item.id,
            deletedAt: item.deletedAt,
            daysAgo,
            expiresIn: Math.max(0, 30 - daysAgo),
            ...(item.client ? { clientName: item.client.name || item.client.email } : {}),
            ...(item.sender ? { senderName: item.sender.name } : {}),
          });
        }
      } catch {
        // skip unavailable models
      }
    }

    results.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { action, data } = await request.json();
    const userId = (session.user as any)?.id;
    const model = trashModels[data.type];
    if (!model) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    if (action === 'restore') {
      await model.update({ where: { id: data.id }, data: { deletedAt: null } });
      logActivity(userId, 'restore', `Restored ${modelLabels[data.type]} from trash`, data.id, data.type);
      return NextResponse.json({ success: true });
    }

    if (action === 'force-delete') {
      await model.delete({ where: { id: data.id } });
      logActivity(userId, 'force-delete', `Permanently deleted ${modelLabels[data.type]}`, data.id, data.type);
      return NextResponse.json({ success: true });
    }

    if (action === 'empty-trash') {
      for (const [key, m] of Object.entries(trashModels)) {
        try {
          await m.deleteMany({ where: { deletedAt: { not: null } } });
        } catch { /* skip */ }
      }
      logActivity(userId, 'empty-trash', 'Emptied trash');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
