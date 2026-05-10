import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { sendInvoiceNotification, sendNewLeadNotification } from '@/lib/email';
import { logActivity } from '@/lib/activity';

const models: Record<string, any> = {
  services: prisma.service,
  portfolio: prisma.portfolioItem,
  blog: prisma.blogPost,
  team: prisma.teamMember,
  testimonials: prisma.testimonial,
  clients: prisma.user,
  invoices: prisma.invoice,
  leads: prisma.lead,
  tasks: prisma.task,
  'calendar-events': prisma.calendarEvent,
  transactions: prisma.transaction,
  settings: prisma.siteSetting,
  notifications: prisma.notification,
  notes: prisma.note,
  activities: prisma.activity,
  projects: prisma.project,
  stages: prisma.pipelineStage,
};

const softDeleteModels = new Set([
  'invoices', 'leads', 'notes', 'tasks', 'calendar-events', 'transactions', 'projects', 'clients'
]);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const includeTrash = searchParams.get('trash') === 'true';
  if (!type || !models[type]) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  try {
    const where: any = {};
    if (softDeleteModels.has(type) && !includeTrash) {
      where.deletedAt = null;
    }
    const items = await models[type].findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { type, action, data } = await request.json();
    const model = models[type];
    if (!model) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    let result;
    const userId = (session.user as any)?.id || 'system';
    if (action === 'create') {
      if (type === 'clients' && data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 12);
        delete data.password;
      }
      result = await model.create({ data });
      logActivity(userId, 'create', `Created ${type.slice(0, -1)}: ${result.title || result.name || result.number || result.id}`, result.id, type);

      if (type === 'invoices' && result.clientId) {
        const client = await prisma.user.findUnique({ where: { id: result.clientId } });
        if (client?.email) {
          sendInvoiceNotification(client.email, result.number, String(result.amount), result.status);
        }
      }
      if (type === 'leads') {
        const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'staff'] } } });
        for (const admin of admins) {
          if (admin.email) sendNewLeadNotification(admin.email, result.name, result.email);
        }
      }
    } else if (action === 'update') {
      const { id, password, ...updateData } = data;
      if (type === 'clients' && password) {
        updateData.passwordHash = await bcrypt.hash(password, 12);
      }
      result = await model.update({ where: { id }, data: updateData });
      logActivity(userId, 'update', `Updated ${type.slice(0, -1)}: ${result.title || result.name || result.number || result.id}`, result.id, type);
    } else if (action === 'delete') {
      if (softDeleteModels.has(type)) {
        result = await model.update({ where: { id: data.id }, data: { deletedAt: new Date() } });
        logActivity(userId, 'delete', `Moved ${type.slice(0, -1)} to trash: ${result.title || result.name || result.number || result.id}`, data.id, type);
      } else {
        result = await model.delete({ where: { id: data.id } });
        logActivity(userId, 'delete', `Deleted ${type.slice(0, -1)}: ${data.id}`, data.id, type);
      }
    } else if (action === 'restore') {
      result = await model.update({ where: { id: data.id }, data: { deletedAt: null } });
      logActivity(userId, 'restore', `Restored ${type.slice(0, -1)} from trash: ${result.title || result.name || result.number || result.id}`, data.id, type);
    } else if (action === 'force-delete') {
      result = await model.delete({ where: { id: data.id } });
      logActivity(userId, 'force-delete', `Permanently deleted ${type.slice(0, -1)}: ${data.id}`, data.id, type);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
