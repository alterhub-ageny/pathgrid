import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role === 'client') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadDir);
    const items = await Promise.all(
      files.map(async (name) => {
        const filePath = path.join(uploadDir, name);
        const stats = await stat(filePath);
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(name);
        return {
          name,
          url: `/uploads/${name}`,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          isImage,
        };
      })
    );
    items.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role === 'client') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { filename } = await request.json();
    if (!filename) return NextResponse.json({ error: 'No filename' }, { status: 400 });

    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
