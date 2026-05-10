CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    "image" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'client',
    "phone" TEXT,
    "company" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Account" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

CREATE TABLE IF NOT EXISTS "Session" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

CREATE TABLE IF NOT EXISTS "Service" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "image" TEXT,
    "priceTier" TEXT,
    "features" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "Service_slug_key" ON "Service"("slug");

CREATE TABLE IF NOT EXISTS "ServiceTranslation" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "serviceId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceTranslation_serviceId_locale_key" ON "ServiceTranslation"("serviceId", "locale");

CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "image" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_slug_key" ON "TeamMember"("slug");

CREATE TABLE IF NOT EXISTS "TeamMemberTranslation" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "memberId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "TeamMemberTranslation_memberId_locale_key" ON "TeamMemberTranslation"("memberId", "locale");

CREATE TABLE IF NOT EXISTS "PortfolioItem" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "client" TEXT,
    "industry" TEXT,
    "technologies" TEXT,
    "result" TEXT,
    "image" TEXT,
    "images" TEXT,
    "url" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "PortfolioItem_slug_key" ON "PortfolioItem"("slug");

CREATE TABLE IF NOT EXISTS "PortfolioTranslation" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "portfolioId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "result" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "PortfolioTranslation_portfolioId_locale_key" ON "PortfolioTranslation"("portfolioId", "locale");

CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "image" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "author" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");

CREATE TABLE IF NOT EXISTS "BlogTranslation" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "postId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogTranslation_postId_locale_key" ON "BlogTranslation"("postId", "locale");

CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "image" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "TestimonialTranslation" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "testimonialId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "TestimonialTranslation_testimonialId_locale_key" ON "TestimonialTranslation"("testimonialId", "locale");

CREATE TABLE IF NOT EXISTS "Project" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "clientId" UUID NOT NULL,
    "budget" DOUBLE PRECISION,
    "deadline" TIMESTAMPTZ,
    "startDate" TIMESTAMPTZ,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Project_clientId_idx" ON "Project"("clientId");

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "number" TEXT NOT NULL,
    "clientId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "type" TEXT NOT NULL DEFAULT 'income',
    "description" TEXT,
    "dueDate" TIMESTAMPTZ,
    "paidAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_number_key" ON "Invoice"("number");
CREATE INDEX IF NOT EXISTS "Invoice_clientId_idx" ON "Invoice"("clientId");

CREATE TABLE IF NOT EXISTS "InvoiceItem" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "invoiceId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "invoiceId" UUID,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'income',
    "category" TEXT,
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "note" TEXT
);

CREATE INDEX IF NOT EXISTS "Transaction_invoiceId_idx" ON "Transaction"("invoiceId");

CREATE TABLE IF NOT EXISTS "Message" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "content" TEXT NOT NULL,
    "senderId" UUID NOT NULL,
    "projectId" UUID,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "Message_projectId_idx" ON "Message"("projectId");

CREATE TABLE IF NOT EXISTS "Asset" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'file',
    "size" INTEGER,
    "projectId" UUID,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Asset_projectId_idx" ON "Asset"("projectId");

CREATE TABLE IF NOT EXISTS "Lead" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "source" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'cold',
    "score" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "assignedTo" TEXT,
    "value" DOUBLE PRECISION,
    "nextFollowUp" TIMESTAMPTZ,
    "tags" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "LeadInteraction" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "leadId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "userId" TEXT
);

CREATE INDEX IF NOT EXISTS "LeadInteraction_leadId_idx" ON "LeadInteraction"("leadId");

CREATE TABLE IF NOT EXISTS "LeadTask" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "leadId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMPTZ,
    "completed" BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS "LeadTask_leadId_idx" ON "LeadTask"("leadId");

CREATE TABLE IF NOT EXISTS "Activity" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Activity_userId_idx" ON "Activity"("userId");

CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key");

CREATE TABLE IF NOT EXISTS "Task" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"("status");

CREATE TABLE IF NOT EXISTS "CalendarEvent" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

ALTER TABLE IF EXISTS "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "ServiceTranslation" ADD CONSTRAINT "ServiceTranslation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "TeamMemberTranslation" ADD CONSTRAINT "TeamMemberTranslation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "PortfolioTranslation" ADD CONSTRAINT "PortfolioTranslation_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "PortfolioItem"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "BlogTranslation" ADD CONSTRAINT "BlogTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "TestimonialTranslation" ADD CONSTRAINT "TestimonialTranslation_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "Testimonial"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id");
ALTER TABLE IF EXISTS "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "Transaction" ADD CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id");
ALTER TABLE IF EXISTS "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id");
ALTER TABLE IF EXISTS "Message" ADD CONSTRAINT "Message_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id");
ALTER TABLE IF EXISTS "Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id");
ALTER TABLE IF EXISTS "LeadInteraction" ADD CONSTRAINT "LeadInteraction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "LeadTask" ADD CONSTRAINT "LeadTask_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE;
ALTER TABLE IF EXISTS "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
