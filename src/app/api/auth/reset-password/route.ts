import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = randomUUID();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/en/auth/reset-password/${token}`;
    await sendEmail(
      email,
      'Password Reset — Pathgrid Agency',
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1a2f5e;">Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1a2f5e;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;">Reset Password</a>
        <p>Link expires in 1 hour.</p>
      </div>`
    );

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
