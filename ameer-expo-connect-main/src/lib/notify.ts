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
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ameer Expo <notifications@ameergroupltd.com>",
        to,
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
  } catch (err) {
    // Never let a failed notification email break the registration flow
    console.error("Failed to send registration notification", err);
  }
}
