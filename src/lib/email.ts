import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || '',
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  auth: {
    user: process.env.EMAIL_SERVER_USER || '',
    pass: process.env.EMAIL_SERVER_PASSWORD || '',
  },
  secure: false,
});

const from = process.env.EMAIL_FROM || 'noreply@pathgrid.agency';

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_SERVER_HOST) return;
  try {
    await transporter.sendMail({ from, to, subject, html });
  } catch {
    // silent fail — email is best-effort
  }
}

export async function sendInvoiceNotification(to: string, invoiceNumber: string, amount: string, status: string) {
  await sendEmail(to, `Invoice ${invoiceNumber} — ${status}`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a2f5e;">Invoice ${invoiceNumber}</h2>
      <p>Status: <strong>${status}</strong></p>
      <p>Amount: <strong>${amount}</strong></p>
    </div>`
  );
}

export async function sendNewLeadNotification(adminEmail: string, leadName: string, leadEmail: string) {
  await sendEmail(adminEmail, `New Lead: ${leadName}`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a2f5e;">New Lead Received</h2>
      <p><strong>${leadName}</strong> (${leadEmail}) has submitted a lead.</p>
    </div>`
  );
}

export async function sendProjectUpdateNotification(clientEmail: string, projectName: string, update: string) {
  await sendEmail(clientEmail, `Update: ${projectName}`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a2f5e;">${projectName}</h2>
      <p>${update}</p>
    </div>`
  );
}
