import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [transactions, leads, clients, projects, activeLeadsMonth, invoicesMonth] = await Promise.all([
      prisma.transaction.aggregate({ _sum: { amount: true } }),
      prisma.lead.count(),
      prisma.user.count({ where: { role: 'client' } }),
      prisma.project.count(),
      prisma.lead.count({ where: { createdAt: { gte: firstDay } } }),
      prisma.invoice.aggregate({ where: { createdAt: { gte: firstDay } }, _sum: { amount: true } }),
    ]);

    const revenue = transactions._sum.amount || 0;
    const newLeads = activeLeadsMonth || 0;
    const invoiced = invoicesMonth._sum.amount || 0;

    return NextResponse.json({
      revenue,
      leads,
      clients,
      projects,
      newLeads,
      invoiced,
      month: now.toLocaleString('default', { month: 'long' }),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
