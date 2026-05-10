import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role === 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { interactions: true, tasks: true },
    });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    let score = 50;

    // Has email
    if (lead.email) score += 5;
    // Has phone
    if (lead.phone) score += 5;
    // Has company
    if (lead.company) score += 5;
    // Has value over 1000
    if ((lead.value || 0) >= 1000) score += 10;
    if ((lead.value || 0) >= 10000) score += 5;
    // Has follow-up scheduled
    if (lead.nextFollowUp) score += 10;
    // Has notes
    if (lead.notes && lead.notes.length > 20) score += 5;
    // Has interactions
    if (lead.interactions.length > 0) score += 5;
    if (lead.interactions.length > 2) score += 5;
    // Advanced stage = warmer
    if (lead.stage === 'meeting' || lead.stage === 'proposal') score += 10;
    if (lead.stage === 'won') score = 100;
    if (lead.stage === 'lost') score = 0;

    score = Math.max(0, Math.min(100, score));

    let recommendation = 'Cold lead — consider initial outreach';
    if (score >= 80) recommendation = 'Hot lead — prioritize, schedule meeting ASAP';
    else if (score >= 60) recommendation = 'Warm lead — send proposal or follow up';
    else if (score >= 40) recommendation = 'Lukewarm — nurture with content and check-ins';

    return NextResponse.json({ score, recommendation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
