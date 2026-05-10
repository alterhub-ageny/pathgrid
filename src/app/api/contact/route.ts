import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, company, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: 'Name, email, and message are required' }, { status: 400 });
    }

    // Find or create a client user for this visitor
    let client = await prisma.user.findUnique({ where: { email } });
    if (!client) {
      client = await prisma.user.create({
        data: { name, email, role: 'client' },
      });
    }

    const now = new Date();
    const msgBody = `From: ${name} (${email})${company ? `\nCompany: ${company}` : ''}${subject ? `\nSubject: ${subject}` : ''}\n\n${message}`;

    // Use a transaction to ensure atomicity
    const [conversation] = await prisma.$transaction([
      prisma.conversation.create({
        data: {
          subject: subject || `Contact Form: ${name}`,
          clientId: client.id,
          lastMessageAt: now,
        },
      }),
    ]);

    await prisma.message.create({
      data: {
        content: msgBody,
        senderId: client.id,
        conversationId: conversation.id,
      },
    });

    // Notify all admins and staff
    const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'staff'] } } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'info',
          title: 'New contact form message',
          message: `${name} sent a message: ${subject || 'No subject'}`,
          link: `/${admin.locale || 'en'}/admin/messages`,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Message received' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}
