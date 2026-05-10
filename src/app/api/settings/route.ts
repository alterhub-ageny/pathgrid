import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = {};
    rows.forEach((r: any) => { settings[r.key] = r.value; });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({});
  }
}
