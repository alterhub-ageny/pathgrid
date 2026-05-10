CREATE TABLE IF NOT EXISTS "ChatMessage" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionId" TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_idx" ON "ChatMessage" ("sessionId");
