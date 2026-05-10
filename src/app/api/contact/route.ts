import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: 'Name, email, and message are required' }, { status: 400 });
    }

    // Step 1: Find or create user
    const normalizedEmail = email.toLowerCase().trim();
    let client;
    try {
      client = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!client) {
        client = await prisma.user.create({
          data: { name, email: normalizedEmail, role: 'client' },
        });
      }
    } catch (e: any) {
      return NextResponse.json({ success: false, message: 'User error: ' + (e?.message || e) }, { status: 500 });
    }

    // Step 2: Create conversation
    let conversation;
    try {
      conversation = await prisma.conversation.create({
        data: {
          subject: subject || `Contact Form: ${name}`,
          clientId: client.id,
          lastMessageAt: new Date(),
        },
      });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: 'Conversation error: ' + (e?.message || e) }, { status: 500 });
    }

    // Step 3: Create message
    const msgBody = `From: ${name} (${email})${company ? `\nCompany: ${company}` : ''}${subject ? `\nSubject: ${subject}` : ''}\n\n${message}`;
    try {
      await prisma.message.create({
        data: {
          content: msgBody,
          senderId: client.id,
          conversationId: conversation.id,
        },
      });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: 'Message error: ' + (e?.message || e) }, { status: 500 });
    }

    // Step 4: Notify admins
    try {
      const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'staff'] } } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'info',
            title: 'New message from ' + name,
            message: subject || 'Contact form submission',
            link: `/${admin.locale || 'en'}/admin/messages`,
          },
        });
      }
    } catch (e: any) {
      return NextResponse.json({ success: false, message: 'Notification error: ' + (e?.message || e) }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message received', conversationId: conversation.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Unknown error' }, { status: 500 });
  }
}
