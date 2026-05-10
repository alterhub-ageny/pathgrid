-- Seed data for Pathgrid Agency
-- Run this AFTER the full schema has been created

-- Users
WITH
admin_user AS (
  INSERT INTO "User" (id, name, email, "passwordHash", role, "updatedAt") VALUES
    (gen_random_uuid(), 'Alex Mercer', 'admin@pathgrid.agency', '$2a$12$6W.s2M4dhHyRkCiqsqRbXem79NY89HJhZDj0rkOVD9dJDpOM7ixAO', 'admin', now())
  ON CONFLICT (email) DO NOTHING RETURNING id
),
client1 AS (
  INSERT INTO "User" (id, name, email, "passwordHash", role, company, "updatedAt") VALUES
    (gen_random_uuid(), 'John Smith', 'john@techventures.com', '$2a$12$iRM3hjiWm52IJArrRnp3hOIzKtF8zNqJrxnkt4eBN7jbsBzQvKmJO', 'client', 'TechVentures Inc', now())
  ON CONFLICT (email) DO NOTHING RETURNING id
),
client2 AS (
  INSERT INTO "User" (id, name, email, "passwordHash", role, company, "updatedAt") VALUES
    (gen_random_uuid(), 'Emily Davis', 'emily@elevate.com', '$2a$12$iRM3hjiWm52IJArrRnp3hOIzKtF8zNqJrxnkt4eBN7jbsBzQvKmJO', 'client', 'Elevate Brand Studio', now())
  ON CONFLICT (email) DO NOTHING RETURNING id
)

-- Services
INSERT INTO "Service" (id, title, slug, description, icon, "priceTier", features, "order", "updatedAt") VALUES
  (gen_random_uuid(), 'UI/UX Design', 'ui-ux-design', 'Beautiful, intuitive interfaces that delight users and drive engagement.', 'Palette', '$5,000 - $15,000', 'User Research,Wireframing,Visual Design,Design Systems,Prototyping', 1, now()),
  (gen_random_uuid(), 'Web Development', 'web-development', 'High-performance web applications built with cutting-edge technologies.', 'Code', '$10,000 - $30,000', 'React/Next.js,Node.js,CMS Integration,API Development,Performance', 2, now()),
  (gen_random_uuid(), 'Digital Strategy', 'digital-strategy', 'Data-driven strategies that align with business goals.', 'BarChart', '$3,000 - $10,000', 'Market Research,Competitive Analysis,Growth Strategy,Analytics,CRO', 3, now()),
  (gen_random_uuid(), 'Brand Identity', 'brand-identity', 'Distinctive brand experiences that make you stand out.', 'Pen', '$5,000 - $20,000', 'Logo Design,Brand Guidelines,Visual Identity,Brand Strategy', 4, now()),
  (gen_random_uuid(), 'Mobile Apps', 'mobile-apps', 'Native and cross-platform mobile solutions.', 'Smartphone', '$15,000 - $50,000', 'iOS Development,Android Development,React Native,App Design', 5, now()),
  (gen_random_uuid(), 'Content Strategy', 'content-strategy', 'Compelling content that connects and converts.', 'Globe', '$2,000 - $8,000', 'Content Audit,SEO Strategy,Copywriting,Content Calendar', 6, now())
ON CONFLICT (slug) DO NOTHING;

-- Team Members
INSERT INTO "TeamMember" (id, name, slug, role, bio, email, "order", "updatedAt") VALUES
  (gen_random_uuid(), 'Alex Mercer', 'alex-mercer', 'CEO & Founder', 'Visionary leader with 15+ years in digital strategy and innovation.', 'alex@pathgrid.agency', 1, now()),
  (gen_random_uuid(), 'Lena Park', 'lena-park', 'Creative Director', 'Award-winning designer passionate about brand storytelling and user experience.', 'lena@pathgrid.agency', 2, now()),
  (gen_random_uuid(), 'David Kim', 'david-kim', 'Technical Lead', 'Full-stack architect building scalable, high-performance digital solutions.', 'david@pathgrid.agency', 3, now()),
  (gen_random_uuid(), 'Priya Sharma', 'priya-sharma', 'Strategy Director', 'Data-driven strategist focused on measurable growth and business transformation.', 'priya@pathgrid.agency', 4, now())
ON CONFLICT (slug) DO NOTHING;

-- Portfolio Items
INSERT INTO "PortfolioItem" (id, title, slug, description, client, industry, technologies, result, featured, "order", "updatedAt") VALUES
  (gen_random_uuid(), 'NexGen Platform Redesign', 'nexgen-platform', 'Complete platform redesign resulting in 200% increase in user engagement.', 'NexGen Solutions', 'Technology', 'React,Node.js,AWS', '200% increase in user engagement', true, 1, now()),
  (gen_random_uuid(), 'Elevate Brand Identity', 'elevate-brand', 'Comprehensive brand identity system for a modern brand studio.', 'Elevate Brand Studio', 'Branding', 'Design,Strategy,Print', 'Brand recognition up 150%', true, 2, now()),
  (gen_random_uuid(), 'FinFlow Dashboard', 'finflow-dashboard', 'Real-time financial analytics dashboard with interactive visualizations.', 'FinFlow Inc.', 'Fintech', 'Next.js,D3.js,Python', '40% faster reporting', true, 3, now())
ON CONFLICT (slug) DO NOTHING;

-- Blog Posts
INSERT INTO "BlogPost" (id, title, slug, excerpt, content, author, category, published, featured, "updatedAt") VALUES
  (gen_random_uuid(), 'The Future of Digital Experience Design', 'future-digital-experience', 'Exploring how AI and personalization are reshaping digital products.', 'Full article content here...', 'Alex Mercer', 'Design', true, true, now()),
  (gen_random_uuid(), 'Building Performant Next.js Applications', 'performant-nextjs', 'Best practices for blazing-fast web applications.', 'Full article content here...', 'David Kim', 'Development', true, false, now()),
  (gen_random_uuid(), 'Data-Driven Brand Strategy', 'data-driven-brand-strategy', 'How analytics can transform your brand strategy.', 'Full article content here...', 'Priya Sharma', 'Strategy', true, false, now())
ON CONFLICT (slug) DO NOTHING;

-- Testimonials
INSERT INTO "Testimonial" (id, name, company, content, rating, featured, "updatedAt") VALUES
  (gen_random_uuid(), 'Sarah Chen', 'TechVentures Inc', 'Pathgrid transformed our digital presence completely. The strategic approach and attention to detail exceeded our expectations.', 5, true, now()),
  (gen_random_uuid(), 'Marcus Johnson', 'Elevate Brand Studio', 'Working with Pathgrid was a game-changer. Their team understood our vision and delivered beyond what we imagined.', 5, true, now()),
  (gen_random_uuid(), 'Aisha Rahman', 'NexGen Solutions', 'The level of creativity and professionalism is outstanding. Our conversion rates increased by 200%.', 5, true, now());

-- Pipeline Leads
INSERT INTO "Lead" (id, name, email, company, stage, score, value, source, "nextFollowUp", converted, "convertedAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Sarah Johnson', 'sarah@techcorp.com', 'TechCorp', 'cold', 65, 50000, 'Website', '2026-05-15', false, NULL, now()),
  (gen_random_uuid(), 'Michael Chen', 'michael@dataflow.io', 'DataFlow Inc', 'cold', 42, 35000, 'Referral', NULL, false, NULL, now()),
  (gen_random_uuid(), 'Emma Williams', 'emma@greenleaf.com', 'GreenLeaf Co', 'contacted', 78, 75000, 'LinkedIn', '2026-05-12', false, NULL, now()),
  (gen_random_uuid(), 'James Rodriguez', 'james@buildright.com', 'BuildRight', 'contacted', 55, 45000, 'Conference', NULL, false, NULL, now()),
  (gen_random_uuid(), 'Lisa Park', 'lisa@finflow.com', 'FinFlow', 'meeting', 88, 120000, 'Outbound', '2026-05-10', false, NULL, now()),
  (gen_random_uuid(), 'Robert Kim', 'robert@healthplus.com', 'HealthPlus', 'proposal', 92, 200000, 'Inbound', '2026-05-08', false, NULL, now()),
  (gen_random_uuid(), 'Amanda Foster', 'amanda@elevate.com', 'Elevate Studio', 'won', 95, 150000, 'Referral', NULL, true, '2026-04-20', now()),
  (gen_random_uuid(), 'Tom Baker', 'tom@oldtech.com', 'OldTech', 'lost', 30, 25000, 'Website', NULL, false, NULL, now());

-- Invoices (references client users)
INSERT INTO "Invoice" (id, number, "clientId", amount, status, type, description, "dueDate", "paidAt", "updatedAt")
SELECT gen_random_uuid(), 'INV-2025-0042', id, 15000, 'paid', 'income', 'Website Redesign - Phase 2', '2026-05-01', '2026-04-28', now()
FROM "User" WHERE email = 'john@techventures.com';

INSERT INTO "Invoice" (id, number, "clientId", amount, status, type, description, "dueDate", "updatedAt")
SELECT gen_random_uuid(), 'INV-2025-0043', id, 25000, 'sent', 'income', 'Brand Identity Package', '2026-05-15', now()
FROM "User" WHERE email = 'emily@elevate.com';

INSERT INTO "Invoice" (id, number, "clientId", amount, status, type, description, "dueDate", "updatedAt")
SELECT gen_random_uuid(), 'INV-2025-0044', id, 12000, 'overdue', 'income', 'Maintenance Retainer - Q2', '2026-04-15', now()
FROM "User" WHERE email = 'john@techventures.com';

-- Transactions
INSERT INTO "Transaction" (id, label, amount, type, category, date) VALUES
  (gen_random_uuid(), 'Office Rent - May', 5000, 'expense', 'Operations', '2026-05-01'),
  (gen_random_uuid(), 'Cloud Infrastructure', 2500, 'expense', 'Infrastructure', '2026-05-02'),
  (gen_random_uuid(), 'Freelance Designer', 3000, 'expense', 'Salaries', '2026-05-03'),
  (gen_random_uuid(), 'Client Payment - TechVentures', 15000, 'income', 'Services', '2026-04-28'),
  (gen_random_uuid(), 'Marketing - LinkedIn Ads', 1200, 'expense', 'Marketing', '2026-04-25');

-- Projects (references client users)
INSERT INTO "Project" (id, title, description, status, progress, "clientId", budget, deadline, "startDate", "updatedAt")
SELECT gen_random_uuid(), 'Website Redesign', 'Complete website redesign with modern tech stack', 'active', 75, id, 45000, '2026-06-15', '2026-01-15', now()
FROM "User" WHERE email = 'john@techventures.com';

INSERT INTO "Project" (id, title, description, status, progress, "clientId", budget, deadline, "startDate", "updatedAt")
SELECT gen_random_uuid(), 'Brand Identity Package', 'Comprehensive brand identity system', 'active', 100, id, 25000, '2026-04-01', '2026-01-15', now()
FROM "User" WHERE email = 'emily@elevate.com';

-- Calendar Events
INSERT INTO "CalendarEvent" (id, title, start, type) VALUES
  (gen_random_uuid(), 'Design Review - NexGen', '2026-05-10T10:00:00', 'meeting'),
  (gen_random_uuid(), 'Q2 Strategy Session', '2026-05-12T14:00:00', 'internal'),
  (gen_random_uuid(), 'Client Call - Elevate', '2026-05-14T11:00:00', 'meeting'),
  (gen_random_uuid(), 'Sprint Planning', '2026-05-15T09:00:00', 'internal'),
  (gen_random_uuid(), 'Portfolio Update Due', '2026-05-18T17:00:00', 'deadline');
