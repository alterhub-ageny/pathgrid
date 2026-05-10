import prisma from '@/lib/prisma';

export async function logActivity(userId: string, type: string, description: string, entityId?: string, entityType?: string) {
  try {
    await prisma.activity.create({
      data: { userId, type, description, entityId, entityType },
    });
  } catch {
    // silent — activity logging is best-effort
  }
}
