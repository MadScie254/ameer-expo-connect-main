export async function sendRegistrationNotification(registration: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  passType: string;
  amount: number;
  paymentStatus: string;
}) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  if (!to || !apiKey) {
    console.error("Notification skipped: missing RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL");
    return;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ameer Expo <notifications@ameergroupltd.com>",
        to: [process.env.ADMIN_NOTIFICATION_EMAIL, process.env.SECOND_NOTIFICATION_EMAIL].filter(Boolean) as string[],
        subject: `New registration — ${registration.firstName} ${registration.lastName} (${registration.passType})`,
        html: `
          <h2>New Ameer Expo registration</h2>
          <p><strong>Name:</strong> ${registration.firstName} ${registration.lastName}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Phone:</strong> ${registration.phone ?? "—"}</p>
          <p><strong>Company:</strong> ${registration.company ?? "—"}</p>
          <p><strong>Pass type:</strong> ${registration.passType}</p>
          <p><strong>Amount:</strong> KES ${registration.amount}</p>
          <p><strong>Payment status:</strong> ${registration.paymentStatus}</p>
          <p><strong>Reference:</strong> ${registration.id}</p>
        `,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Resend error:", text);
    }
  } catch (err) {
    // Never let a failed notification email break the registration flow
    console.error("Failed to send registration notification", err);
  }
}

export async function sendExhibitorLeadNotification(lead: {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone?: string | null;
  interest: string;
  tierOrSize?: string | null;
  message?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !process.env.ADMIN_NOTIFICATION_EMAIL) {
    console.error("Notification skipped: missing RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL");
    return;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ameer Expo <notifications@ameergroupltd.com>",
        to: [process.env.ADMIN_NOTIFICATION_EMAIL, process.env.SECOND_NOTIFICATION_EMAIL].filter(Boolean) as string[],
        subject: `New ${lead.interest} enquiry — ${lead.company} (${lead.tierOrSize ?? "unspecified"})`,
        html: `
          <h2>New Ameer Expo ${lead.interest} enquiry</h2>
          <p><strong>Company:</strong> ${lead.company}</p>
          <p><strong>Contact:</strong> ${lead.contactName}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Phone:</strong> ${lead.phone ?? "—"}</p>
          <p><strong>Interest:</strong> ${lead.interest}</p>
          <p><strong>Tier / Size:</strong> ${lead.tierOrSize ?? "—"}</p>
          <p><strong>Message:</strong> ${lead.message ?? "—"}</p>
          <p><strong>Lead ID:</strong> ${lead.id}</p>
        `,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Resend error:", text);
    }
  } catch (err) {
    // Never let a failed notification email break the lead capture flow
    console.error("Failed to send exhibitor lead notification", err);
  }
}

