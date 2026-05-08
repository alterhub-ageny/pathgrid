import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pathgrid.agency' },
    update: {},
    create: {
      name: 'Alex Mercer',
      email: 'admin@pathgrid.agency',
      passwordHash: adminHash,
      role: 'admin',
    },
  });
  console.log('Admin created:', admin.email);

  // Create client users
  const clientHash = await bcrypt.hash('client123', 12);
  const clients = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@techventures.com' },
      update: {},
      create: { name: 'John Smith', email: 'john@techventures.com', passwordHash: clientHash, role: 'client', company: 'TechVentures Inc' },
    }),
    prisma.user.upsert({
      where: { email: 'emily@elevate.com' },
      update: {},
      create: { name: 'Emily Davis', email: 'emily@elevate.com', passwordHash: clientHash, role: 'client', company: 'Elevate Brand Studio' },
    }),
  ]);
  console.log('Clients created');

  // Create services
  const services = [
    { title: 'UI/UX Design', slug: 'ui-ux-design', description: 'Beautiful, intuitive interfaces that delight users and drive engagement.', icon: 'Palette', priceTier: '$5,000 - $15,000', features: 'User Research,Wireframing,Visual Design,Design Systems,Prototyping', order: 1 },
    { title: 'Web Development', slug: 'web-development', description: 'High-performance web applications built with cutting-edge technologies.', icon: 'Code', priceTier: '$10,000 - $30,000', features: 'React/Next.js,Node.js,CMS Integration,API Development,Performance', order: 2 },
    { title: 'Digital Strategy', slug: 'digital-strategy', description: 'Data-driven strategies that align with business goals.', icon: 'BarChart', priceTier: '$3,000 - $10,000', features: 'Market Research,Competitive Analysis,Growth Strategy,Analytics,CRO', order: 3 },
    { title: 'Brand Identity', slug: 'brand-identity', description: 'Distinctive brand experiences that make you stand out.', icon: 'Pen', priceTier: '$5,000 - $20,000', features: 'Logo Design,Brand Guidelines,Visual Identity,Brand Strategy', order: 4 },
    { title: 'Mobile Apps', slug: 'mobile-apps', description: 'Native and cross-platform mobile solutions.', icon: 'Smartphone', priceTier: '$15,000 - $50,000', features: 'iOS Development,Android Development,React Native,App Design', order: 5 },
    { title: 'Content Strategy', slug: 'content-strategy', description: 'Compelling content that connects and converts.', icon: 'Globe', priceTier: '$2,000 - $8,000', features: 'Content Audit,SEO Strategy,Copywriting,Content Calendar', order: 6 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }
  console.log('Services created');

  // Create team members
  const team = [
    { name: 'Alex Mercer', slug: 'alex-mercer', role: 'CEO & Founder', bio: 'Visionary leader with 15+ years in digital strategy and innovation.', email: 'alex@pathgrid.agency', order: 1 },
    { name: 'Lena Park', slug: 'lena-park', role: 'Creative Director', bio: 'Award-winning designer passionate about brand storytelling and user experience.', email: 'lena@pathgrid.agency', order: 2 },
    { name: 'David Kim', slug: 'david-kim', role: 'Technical Lead', bio: 'Full-stack architect building scalable, high-performance digital solutions.', email: 'david@pathgrid.agency', order: 3 },
    { name: 'Priya Sharma', slug: 'priya-sharma', role: 'Strategy Director', bio: 'Data-driven strategist focused on measurable growth and business transformation.', email: 'priya@pathgrid.agency', order: 4 },
  ];

  for (const member of team) {
    await prisma.teamMember.upsert({
      where: { slug: member.slug },
      update: {},
      create: member,
    });
  }
  console.log('Team created');

  // Create portfolio items
  const portfolio = [
    { title: 'NexGen Platform Redesign', slug: 'nexgen-platform', description: 'Complete platform redesign resulting in 200% increase in user engagement.', client: 'NexGen Solutions', industry: 'Technology', technologies: 'React,Node.js,AWS', result: '200% increase in user engagement', featured: true, order: 1 },
    { title: 'Elevate Brand Identity', slug: 'elevate-brand', description: 'Comprehensive brand identity system for a modern brand studio.', client: 'Elevate Brand Studio', industry: 'Branding', technologies: 'Design,Strategy,Print', result: 'Brand recognition up 150%', featured: true, order: 2 },
    { title: 'FinFlow Dashboard', slug: 'finflow-dashboard', description: 'Real-time financial analytics dashboard with interactive visualizations.', client: 'FinFlow Inc.', industry: 'Fintech', technologies: 'Next.js,D3.js,Python', result: '40% faster reporting', featured: true, order: 3 },
  ];

  for (const item of portfolio) {
    await prisma.portfolioItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log('Portfolio created');

  // Create blog posts
  const posts = [
    { title: 'The Future of Digital Experience Design', slug: 'future-digital-experience', excerpt: 'Exploring how AI and personalization are reshaping digital products.', content: 'Full article content here...', author: 'Alex Mercer', category: 'Design', published: true, featured: true },
    { title: 'Building Performant Next.js Applications', slug: 'performant-nextjs', excerpt: 'Best practices for blazing-fast web applications.', content: 'Full article content here...', author: 'David Kim', category: 'Development', published: true, featured: false },
    { title: 'Data-Driven Brand Strategy', slug: 'data-driven-brand-strategy', excerpt: 'How analytics can transform your brand strategy.', content: 'Full article content here...', author: 'Priya Sharma', category: 'Strategy', published: true, featured: false },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log('Blog posts created');

  // Create testimonials
  const testimonials = [
    { name: 'Sarah Chen', company: 'TechVentures Inc', content: 'Pathgrid transformed our digital presence completely. The strategic approach and attention to detail exceeded our expectations.', rating: 5, featured: true },
    { name: 'Marcus Johnson', company: 'Elevate Brand Studio', content: 'Working with Pathgrid was a game-changer. Their team understood our vision and delivered beyond what we imagined.', rating: 5, featured: true },
    { name: 'Aisha Rahman', company: 'NexGen Solutions', content: 'The level of creativity and professionalism is outstanding. Our conversion rates increased by 200%.', rating: 5, featured: true },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('Testimonials created');

  // Create pipeline leads
  const leads = [
    { name: 'Sarah Johnson', email: 'sarah@techcorp.com', company: 'TechCorp', stage: 'cold', score: 65, value: 50000, source: 'Website', nextFollowUp: new Date('2026-05-15') },
    { name: 'Michael Chen', email: 'michael@dataflow.io', company: 'DataFlow Inc', stage: 'cold', score: 42, value: 35000, source: 'Referral' },
    { name: 'Emma Williams', email: 'emma@greenleaf.com', company: 'GreenLeaf Co', stage: 'contacted', score: 78, value: 75000, source: 'LinkedIn', nextFollowUp: new Date('2026-05-12') },
    { name: 'James Rodriguez', email: 'james@buildright.com', company: 'BuildRight', stage: 'contacted', score: 55, value: 45000, source: 'Conference' },
    { name: 'Lisa Park', email: 'lisa@finflow.com', company: 'FinFlow', stage: 'meeting', score: 88, value: 120000, source: 'Outbound', nextFollowUp: new Date('2026-05-10') },
    { name: 'Robert Kim', email: 'robert@healthplus.com', company: 'HealthPlus', stage: 'proposal', score: 92, value: 200000, source: 'Inbound', nextFollowUp: new Date('2026-05-08') },
    { name: 'Amanda Foster', email: 'amanda@elevate.com', company: 'Elevate Studio', stage: 'won', score: 95, value: 150000, source: 'Referral', converted: true, convertedAt: new Date('2026-04-20') },
    { name: 'Tom Baker', email: 'tom@oldtech.com', company: 'OldTech', stage: 'lost', score: 30, value: 25000, source: 'Website', converted: false },
  ];

  for (const lead of leads) {
    await prisma.lead.create({ data: lead });
  }
  console.log('Leads created');

  // Create invoices
  const invoices = [
    { number: 'INV-2025-0042', clientId: clients[0].id, amount: 15000, status: 'paid', type: 'income', description: 'Website Redesign - Phase 2', dueDate: new Date('2026-05-01'), paidAt: new Date('2026-04-28') },
    { number: 'INV-2025-0043', clientId: clients[1].id, amount: 25000, status: 'sent', type: 'income', description: 'Brand Identity Package', dueDate: new Date('2026-05-15') },
    { number: 'INV-2025-0044', clientId: clients[0].id, amount: 12000, status: 'overdue', type: 'income', description: 'Maintenance Retainer - Q2', dueDate: new Date('2026-04-15') },
  ];

  for (const inv of invoices) {
    await prisma.invoice.create({ data: inv });
  }
  console.log('Invoices created');

  // Create transactions
  const transactions = [
    { label: 'Office Rent - May', amount: 5000, type: 'expense', category: 'Operations', date: new Date('2026-05-01') },
    { label: 'Cloud Infrastructure', amount: 2500, type: 'expense', category: 'Infrastructure', date: new Date('2026-05-02') },
    { label: 'Freelance Designer', amount: 3000, type: 'expense', category: 'Salaries', date: new Date('2026-05-03') },
    { label: 'Client Payment - TechVentures', amount: 15000, type: 'income', category: 'Services', date: new Date('2026-04-28') },
    { label: 'Marketing - LinkedIn Ads', amount: 1200, type: 'expense', category: 'Marketing', date: new Date('2026-04-25') },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }
  console.log('Transactions created');

  // Create projects
  for (let i = 0; i < clients.length; i++) {
    await prisma.project.create({
      data: {
        title: i === 0 ? 'Website Redesign' : 'Brand Identity Package',
        description: i === 0 ? 'Complete website redesign with modern tech stack' : 'Comprehensive brand identity system',
        status: 'active',
        progress: i === 0 ? 75 : 100,
        clientId: clients[i].id,
        budget: i === 0 ? 45000 : 25000,
        deadline: i === 0 ? new Date('2026-06-15') : new Date('2026-04-01'),
        startDate: new Date('2026-01-15'),
      },
    });
  }
  console.log('Projects created');

  // Create calendar events
  const events = [
    { title: 'Design Review - NexGen', start: new Date('2026-05-10T10:00:00'), type: 'meeting' },
    { title: 'Q2 Strategy Session', start: new Date('2026-05-12T14:00:00'), type: 'internal' },
    { title: 'Client Call - Elevate', start: new Date('2026-05-14T11:00:00'), type: 'meeting' },
    { title: 'Sprint Planning', start: new Date('2026-05-15T09:00:00'), type: 'internal' },
    { title: 'Portfolio Update Due', start: new Date('2026-05-18T17:00:00'), type: 'deadline' },
  ];

  for (const event of events) {
    await prisma.calendarEvent.create({ data: event });
  }
  console.log('Calendar events created');

  console.log('\n✅ Seed complete!');
  console.log('\nAdmin login: admin@pathgrid.agency / admin123');
  console.log('Client login: john@techventures.com / client123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
