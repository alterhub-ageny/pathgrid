import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const team = await prisma.teamMember.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
    return NextResponse.json(team);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
