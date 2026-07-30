import "dotenv/config";

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
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!apiKey || !to || to.length === 0) {
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
  const to = process.env.ADMIN_NOTIFICATION_EMAIL?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!apiKey || !to || to.length === 0) {
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
        to,
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

export async function sendRegistrantConfirmation(registration: {
  email: string;
  firstName: string;
  referenceCode: string;
  passType: string;
  lastName?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  industry?: string | null;
  interests?: string[] | null;
  networkingTargets?: string[] | null;
  needsHotel?: boolean | null;
  needsPickup?: boolean | null;
  needsVisa?: boolean | null;
  dietary?: string | null;
  accessibility?: string | null;
  gender?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Confirmation skipped: missing RESEND_API_KEY");
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
        to: registration.email,
        subject: `Registration Confirmed: Ameer Expo Africa & Middle East (${registration.referenceCode})`,
        html: `
          <h2>You're in, ${registration.firstName}!</h2>
          <p>Your registration for Ameer Expo Africa & Middle East is confirmed.</p>
          <p><strong>Registration Number:</strong> ${registration.referenceCode}</p>
          <p><strong>Pass Type:</strong> ${registration.passType}</p>
          <br/>
          
          <h3>Your Details</h3>
          <p><strong>Name:</strong> ${registration.firstName} ${registration.lastName || ""}</p>
          <p><strong>Gender:</strong> ${registration.gender || "—"}</p>
          <br/>

          <h3>Professional Background</h3>
          <p><strong>Company:</strong> ${registration.company || "—"}</p>
          <p><strong>Job Title:</strong> ${registration.jobTitle || "—"}</p>
          <p><strong>Industry:</strong> ${registration.industry || "—"}</p>
          <br/>

          <h3>Your Interests & Networking Goals</h3>
          <p><strong>Interests:</strong> ${registration.interests?.join(", ") || "—"}</p>
          <p><strong>Networking Targets:</strong> ${registration.networkingTargets?.join(", ") || "—"}</p>
          <br/>

          <h3>Logistics</h3>
          <p><strong>Hotel Assistance:</strong> ${registration.needsHotel ? "Yes" : "No"}</p>
          <p><strong>Airport Pickup:</strong> ${registration.needsPickup ? "Yes" : "No"}</p>
          <p><strong>Visa Assistance:</strong> ${registration.needsVisa ? "Yes" : "No"}</p>
          <p><strong>Dietary Requirements:</strong> ${registration.dietary || "—"}</p>
          <p><strong>Accessibility Needs:</strong> ${registration.accessibility || "—"}</p>
          <br/>

          <p><strong>Event Details:</strong></p>
          <p>18-20 Sept 2026</p>
          <p>Sarit Expo Centre, Nairobi</p>
          <br/>
          <p>We look forward to seeing you there.</p>
        `,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Resend error (confirmation):", text);
    }
  } catch (err) {
    console.error("Failed to send registrant confirmation", err);
  }
}

export async function sendPartnerNotification(inquiry: {
  id: string;
  type: "exhibitor" | "sponsor";
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!apiKey || !to || to.length === 0) {
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
        to,
        subject: `New ${inquiry.type} inquiry — ${inquiry.companyName}`,
        html: `
          <h2>New Ameer Expo ${inquiry.type} inquiry</h2>
          <p><strong>Company:</strong> ${inquiry.companyName}</p>
          <p><strong>Contact:</strong> ${inquiry.contactName}</p>
          <p><strong>Email:</strong> ${inquiry.email}</p>
          <p><strong>Phone:</strong> ${inquiry.phone ?? "—"}</p>
          <p><strong>Message:</strong> ${inquiry.message ?? "—"}</p>
          <p><strong>Inquiry ID:</strong> ${inquiry.id}</p>
        `,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Resend error:", text);
    }
  } catch (err) {
    console.error("Failed to send partner notification", err);
  }
}
