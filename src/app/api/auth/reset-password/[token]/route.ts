import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const { password } = await _request.json();
    if (!password) return NextResponse.json({ message: 'Password required' }, { status: 400 });

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record) return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    if (new Date(record.expires) < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ message: 'Token expired' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { email: record.identifier }, data: { passwordHash } });
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
