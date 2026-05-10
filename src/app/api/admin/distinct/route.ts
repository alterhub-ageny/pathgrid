import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const fieldMap: Record<string, { model: any; field: string }> = {
  'blog-categories': { model: prisma.blogPost, field: 'category' },
  'portfolio-industries': { model: prisma.portfolioItem, field: 'industry' },
  'project-statuses': { model: prisma.project, field: 'status' },
  'lead-sources': { model: prisma.lead, field: 'source' },
  'lead-stages': { model: prisma.lead, field: 'stage' },
  'invoice-statuses': { model: prisma.invoice, field: 'status' },
  'transaction-types': { model: prisma.transaction, field: 'type' },
  'event-types': { model: prisma.calendarEvent, field: 'type' },
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const field = searchParams.get('field');
  if (!field || !fieldMap[field]) return NextResponse.json({ error: 'Invalid field' }, { status: 400 });

  try {
    const { model, field: fieldName } = fieldMap[field];
    const items = await model.findMany({
      where: { [fieldName]: { not: null } },
      select: { [fieldName]: true },
      distinct: [fieldName],
      orderBy: { [fieldName]: 'asc' },
    });
    const values = items.map((i: any) => i[fieldName]).filter(Boolean);
    return NextResponse.json(values);
  } catch {
    return NextResponse.json([]);
  }
}
