import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
