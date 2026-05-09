import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
