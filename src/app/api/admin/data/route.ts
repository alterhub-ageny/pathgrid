import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const models: Record<string, any> = {
  services: prisma.service,
  portfolio: prisma.portfolioItem,
  blog: prisma.blogPost,
  team: prisma.teamMember,
  testimonials: prisma.testimonial,
  clients: prisma.user,
  invoices: prisma.invoice,
  leads: prisma.lead,
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  if (!type || !models[type]) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  try {
    const items = await models[type].findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { type, action, data } = await request.json();
    const model = models[type];
    if (!model) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    let result;
    if (action === 'create') {
      result = await model.create({ data });
    } else if (action === 'update') {
      const { id, ...updateData } = data;
      result = await model.update({ where: { id }, data: updateData });
    } else if (action === 'delete') {
      result = await model.delete({ where: { id: data.id } });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
