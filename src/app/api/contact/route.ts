import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, company, subject, message } = await request.json();

    // In production, send email via SendGrid/Nodemailer
    console.log('Contact form submission:', { name, email, company, subject, message });

    // Store in database or send email
    // await sendEmail({ to: 'hello@pathgrid.agency', subject: `Contact: ${subject}`, body: `From: ${name} (${email})\n\n${message}` });

    return NextResponse.json({ success: true, message: 'Message received' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}
