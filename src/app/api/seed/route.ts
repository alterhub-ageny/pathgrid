import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    const adminHash = await bcrypt.hash('admin123', 12);
    const clientHash = await bcrypt.hash('client123', 12);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@pathgrid.agency' },
      update: {},
      create: { name: 'Alex Mercer', email: 'admin@pathgrid.agency', passwordHash: adminHash, role: 'admin' },
    });

    const client1 = await prisma.user.upsert({
      where: { email: 'john@techventures.com' },
      update: {},
      create: { name: 'John Smith', email: 'john@techventures.com', passwordHash: clientHash, role: 'client', company: 'TechVentures Inc' },
    });

    const client2 = await prisma.user.upsert({
      where: { email: 'emily@elevate.com' },
      update: {},
      create: { name: 'Emily Davis', email: 'emily@elevate.com', passwordHash: clientHash, role: 'client', company: 'Elevate Brand Studio' },
    });

    const services = [
      { title: 'UI/UX Design', slug: 'ui-ux-design', description: 'Beautiful, intuitive interfaces that delight users.', icon: 'Palette', priceTier: '$5,000 - $15,000', features: 'User Research,Wireframing,Visual Design', order: 1 },
      { title: 'Web Development', slug: 'web-development', description: 'High-performance web applications.', icon: 'Code', priceTier: '$10,000 - $30,000', features: 'React/Next.js,Node.js,CMS Integration', order: 2 },
      { title: 'Digital Strategy', slug: 'digital-strategy', description: 'Data-driven strategies.', icon: 'BarChart', priceTier: '$3,000 - $10,000', features: 'Market Research,Analytics,CRO', order: 3 },
    ];

    for (const s of services) {
      await prisma.service.upsert({ where: { slug: s.slug }, update: {}, create: s });
    }

    const stages = [
      { key: 'cold', label: 'Cold', color: '#3b82f6', order: 1 },
      { key: 'contacted', label: 'Contacted', color: '#eab308', order: 2 },
      { key: 'meeting', label: 'Meeting', color: '#a855f7', order: 3 },
      { key: 'proposal', label: 'Proposal', color: '#f97316', order: 4 },
      { key: 'won', label: 'Won', color: '#22c55e', order: 5 },
      { key: 'lost', label: 'Lost', color: '#ef4444', order: 6 },
    ];

    for (const s of stages) {
      await prisma.pipelineStage.upsert({ where: { key: s.key }, update: {}, create: s });
    }

    const leads = [
      { name: 'Sarah Johnson', email: 'sarah@techcorp.com', company: 'TechCorp', stage: 'cold', score: 65, value: 50000 },
      { name: 'Emma Williams', email: 'emma@greenleaf.com', company: 'GreenLeaf', stage: 'contacted', score: 78, value: 75000 },
      { name: 'Robert Kim', email: 'robert@healthplus.com', company: 'HealthPlus', stage: 'proposal', score: 92, value: 200000 },
    ];

    for (const lead of leads) {
      await prisma.lead.create({ data: lead });
    }

    return NextResponse.json({ success: true, admin: { email: 'admin@pathgrid.agency', password: 'admin123' } });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
