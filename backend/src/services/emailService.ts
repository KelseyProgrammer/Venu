const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'VENU <notifications@venu.app>';

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) return; // silently skip if not configured

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Email send failed:', err);
    }
  } catch (err) {
    console.error('Email service error:', err);
  }
}

function baseTemplate(content: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #7c3aed; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: -0.5px;">VENU</h1>
        <p style="color: #ddd6fe; margin: 4px 0 0; font-size: 13px;">The Transparent Booking Platform for Live Music</p>
      </div>
      <div style="background: #f9f9f9; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
        ${content}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">You received this because you have an account on VENU. Questions? Reply to this email.</p>
      </div>
    </div>
  `;
}

export async function sendArtistApplicationEmail(
  locationEmail: string,
  artistName: string,
  gigName: string,
  appUrl: string
): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin: 0 0 12px; font-size: 18px;">New Gig Application</h2>
    <p style="margin: 0 0 16px; color: #374151;"><strong>${artistName}</strong> has applied to perform at <strong>"${gigName}"</strong>.</p>
    <p style="margin: 0 0 24px; color: #6b7280;">Log in to review their application and accept or decline.</p>
    <a href="${appUrl}/location" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Review Application</a>
  `);
  await sendEmail(locationEmail, `New application from ${artistName} — ${gigName}`, html);
}

export async function sendArtistInvitedEmail(
  artistEmail: string,
  gigName: string,
  venueName: string,
  gigDate: string,
  appUrl: string
): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin: 0 0 12px; font-size: 18px;">You've Been Invited to Perform</h2>
    <p style="margin: 0 0 16px; color: #374151;"><strong>${venueName}</strong> has invited you to perform at <strong>"${gigName}"</strong> on <strong>${gigDate}</strong>.</p>
    <p style="margin: 0 0 24px; color: #6b7280;">Log in to your artist dashboard to review the details and confirm or decline.</p>
    <a href="${appUrl}/artist" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Invitation</a>
  `);
  await sendEmail(artistEmail, `You're invited to perform at ${venueName}`, html);
}

export async function sendArtistConfirmedEmail(
  artistEmail: string,
  gigName: string,
  venueName: string,
  gigDate: string,
  appUrl: string
): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin: 0 0 12px; font-size: 18px;">You're Confirmed!</h2>
    <p style="margin: 0 0 16px; color: #374151;">You've been confirmed to perform at <strong>"${gigName}"</strong> at <strong>${venueName}</strong> on <strong>${gigDate}</strong>.</p>
    <p style="margin: 0 0 24px; color: #6b7280;">View your schedule and event checklist in your artist dashboard.</p>
    <a href="${appUrl}/artist" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View My Schedule</a>
  `);
  await sendEmail(artistEmail, `You're confirmed for ${gigName}`, html);
}

export async function sendTicketConfirmationEmail(
  fanEmail: string,
  fanName: string,
  gigName: string,
  venueName: string,
  gigDate: string,
  quantity: number,
  totalPrice: number,
  appUrl: string
): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin: 0 0 12px; font-size: 18px;">Your Tickets Are Confirmed</h2>
    <p style="margin: 0 0 8px; color: #374151;">Hey ${fanName || 'there'}! Your tickets for <strong>"${gigName}"</strong> are confirmed.</p>
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">EVENT</p>
      <p style="margin: 0 0 12px; font-weight: 600;">${gigName}</p>
      <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">VENUE</p>
      <p style="margin: 0 0 12px;">${venueName}</p>
      <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">DATE</p>
      <p style="margin: 0 0 12px;">${gigDate}</p>
      <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">TICKETS</p>
      <p style="margin: 0 0 12px;">${quantity} × $${(totalPrice / quantity).toFixed(2)} = <strong>$${totalPrice.toFixed(2)}</strong></p>
    </div>
    <p style="margin: 0 0 24px; color: #6b7280; font-size: 13px;">Your QR code is in your fan dashboard under "My Tickets". Show it at the door.</p>
    <a href="${appUrl}/fan" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View My Tickets</a>
  `);
  await sendEmail(fanEmail, `Your tickets for ${gigName} are confirmed`, html);
}
