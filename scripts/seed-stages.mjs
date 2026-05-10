import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production database...');

  const adminHash = await bcrypt.hash('admin123', 12);
  const clientHash = await bcrypt.hash('client123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@pathgrid.agency' },
    update: {},
    create: { name: 'Alex Mercer', email: 'admin@pathgrid.agency', passwordHash: adminHash, role: 'admin' },
  });

  await prisma.user.upsert({
    where: { email: 'john@techventures.com' },
    update: {},
    create: { name: 'John Smith', email: 'john@techventures.com', passwordHash: clientHash, role: 'client', company: 'TechVentures Inc' },
  });

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
    console.log(`  Stage: ${s.label}`);
  }

  console.log('Done! Pipeline stages seeded to production DB.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
