import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TOTP } from 'otplib';
import { toDataURL } from 'qrcode';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const totp = new TOTP();

// GET /api/auth/totp — generate setup secret + QR code (requires auth)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const secret = totp.generateSecret();
  const otpauth = totp.toURI({ secret, issuer: 'Pathgrid Agency', label: `Pathgrid Agency:${user.email || userId}` });
  const qrCode = await toDataURL(otpauth);

  // Store secret temporarily (not enabled yet)
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });

  return NextResponse.json({ secret, qrCode });
}

// POST /api/auth/totp — enable or disable 2FA
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { action, code } = await request.json();

  if (action === 'enable') {
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) return NextResponse.json({ error: 'No secret generated' }, { status: 400 });

    const isValid = totp.verify(code, { secret: user.twoFactorSecret });
    if (!isValid) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });

    await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
    return NextResponse.json({ success: true });
  }

  if (action === 'disable') {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
