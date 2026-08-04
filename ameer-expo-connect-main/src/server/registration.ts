import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase-server";
import { getPesapalToken, submitPesapalOrder } from "./pesapal";
import { sendRegistrationNotification, sendRegistrantConfirmation } from "../lib/notify";
import { generateTicketNumber, generateTicketQrPng } from "../lib/ticket";

function isAtLeast17(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const monthDiff = today.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return age >= 17;
}

const RegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string(),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => isAtLeast17(val), "You must be at least 17 years old to register"),
  idNumber: z.string(),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string(),
  email: z.string().email("Invalid email address"),
  linkedin: z.string(),
  company: z.string(),
  jobTitle: z.string(),
  industry: z.string(),
  website: z.string(),
  businessType: z.string(),
  experience: z.string(),
  interests: z.array(z.string()),
  b2b: z.string(),
  targets: z.array(z.string()),
  hotel: z.boolean(),
  pickup: z.boolean(),
  visa: z.boolean(),
  dietary: z.string(),
  accessibility: z.string(),
  terms: z.boolean().refine((val) => val === true, "Must accept terms"),
  passType: z.string().optional(),
  turnstileToken: z.string().optional(),
});

async function findOrCreateUserId(email: string, firstName: string, lastName: string) {
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) return existingProfile.id;

  try {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true, // trust the registration form itself; don't send a confirmation email
      user_metadata: { first_name: firstName, last_name: lastName },
    });
    if (error) throw error;
    return created.user!.id;
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number };
    if (error?.message?.includes("already been registered") || error?.status === 422) {
      // Fallback: the user exists in auth.users, but not in public.profiles
      const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      const matchedUser = authData.users.find((u) => u.email === email);
      if (!matchedUser) {
        throw new Error("User purportedly exists in auth but could not be found.");
      }

      const userId = matchedUser.id;

      // Upsert into profiles since on_auth_user_created trigger won't fire again
      const { error: upsertError } = await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
      });

      if (upsertError) throw upsertError;

      return userId;
    }

    throw error;
  }
}

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns true if verification passes OR if no secret key is configured
 * (graceful degradation when Turnstile hasn't been set up yet).
 */
async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Turnstile not configured — fall through (5-minute throttle is the backstop)
    return true;
  }
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    // Network failure — don't block the user, log and allow
    console.error("Turnstile verification request failed");
    return true;
  }
}

export const submitRegistration = createServerFn({ method: "POST" })
  .validator((data: unknown) => RegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      // ── Turnstile check ─────────────────────────────────────────────────
      const turnstileOk = await verifyTurnstile(data.turnstileToken);
      if (!turnstileOk) {
        return {
          success: false,
          error: "CAPTCHA verification failed. Please refresh and try again.",
        };
      }

      // ── 5-minute same-email throttle (backstop) ──────────────────────────
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentReg } = await supabaseAdmin
        .from("registrations")
        .select("id")
        .eq("email", data.email)
        .gte("created_at", fiveMinsAgo)
        .maybeSingle();

      if (recentReg) {
        return {
          success: false,
          error: "Please wait 5 minutes before submitting another request.",
        };
      }

      const id = crypto.randomUUID();
      const referenceCode = `AE26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const payload = data;

      let redirectUrl = null;
      let orderTrackingId = null;
      let paymentStatus = "free";

      const passType = data.passType || "general";
      const amount = passType === "vip" ? 5000 : 0;

      if (passType === "vip") {
        paymentStatus = "pending";
        // Fetch pesapal token and submit order
        const token = await getPesapalToken();
        const pesapalRes = await submitPesapalOrder(token, {
          id,
          amount,
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
        });
        redirectUrl = pesapalRes.redirect_url;
        orderTrackingId = pesapalRes.order_tracking_id;
      }

      // ── Generate ticket for free registrations immediately ───────────────
      let ticketNumber: string | null = null;
      let ticketIssuedAt: string | null = null;
      if (paymentStatus === "free") {
        // Retry up to 3 times on unique-constraint collision
        for (let attempt = 0; attempt < 3; attempt++) {
          ticketNumber = generateTicketNumber();
          // Pre-check uniqueness to avoid relying solely on DB error parsing
          const { data: existing } = await supabaseAdmin
            .from("registrations")
            .select("id")
            .eq("ticket_number", ticketNumber)
            .maybeSingle();
          if (!existing) break;
          // Collision — try again
          if (attempt === 2) ticketNumber = null; // give up; row will still insert without ticket
        }
        if (ticketNumber) {
          ticketIssuedAt = new Date().toISOString();
        }
      }

      const userId = await findOrCreateUserId(data.email, data.firstName, data.lastName);

      const { data: row, error: insertError } = await supabaseAdmin
        .from("registrations")
        .insert({
          id,
          reference_code: referenceCode,
          user_id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          job_title: data.jobTitle,
          pass_type: passType,
          amount: amount,
          payment_status: paymentStatus,
          order_tracking_id: orderTrackingId,
          date_of_birth: data.dob,
          city: data.city,
          country: data.country,
          payload: payload,
          gender: data.gender,
          id_number: data.idNumber,
          whatsapp: data.whatsapp,
          linkedin: data.linkedin,
          industry: data.industry,
          website: data.website,
          business_type: data.businessType,
          experience: data.experience,
          interests: data.interests,
          wants_b2b: data.b2b,
          networking_targets: data.targets,
          needs_hotel: data.hotel,
          needs_pickup: data.pickup,
          needs_visa: data.visa,
          dietary: data.dietary,
          accessibility: data.accessibility,
          ticket_number: ticketNumber,
          ticket_issued_at: ticketIssuedAt,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (paymentStatus === "free") {
        // Generate QR PNG for the confirmation email
        let ticketQrBase64: string | null = null;
        if (row.ticket_number) {
          try {
            const qrBuffer = await generateTicketQrPng(row.ticket_number);
            ticketQrBase64 = qrBuffer.toString("base64");
          } catch (qrErr) {
            console.error("QR generation failed (non-fatal):", qrErr);
          }
        }

        await sendRegistrationNotification({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          company: row.company,
          passType: row.pass_type,
          amount: Number(row.amount),
          paymentStatus: row.payment_status,
          ticketNumber: row.ticket_number,
        });

        await sendRegistrantConfirmation({
          email: row.email,
          firstName: row.first_name,
          referenceCode: row.reference_code,
          passType: row.pass_type,
          lastName: row.last_name,
          company: row.company,
          jobTitle: row.job_title,
          industry: row.industry,
          interests: row.interests,
          networkingTargets: row.networking_targets,
          needsHotel: row.needs_hotel,
          needsPickup: row.needs_pickup,
          needsVisa: row.needs_visa,
          dietary: row.dietary,
          accessibility: row.accessibility,
          gender: row.gender,
          ticketNumber: row.ticket_number,
          ticketQrBase64,
        });
      }

      return {
        success: true,
        id: row.id,
        referenceCode: row.reference_code,
        passType,
        redirectUrl,
        ticketNumber: row.ticket_number as string | null,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Failed to save registration");
    }
  });

export const getRegistrationStatus = createServerFn({ method: "GET" })
  .validator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .select("id, reference_code, payment_status, pass_type, first_name, ticket_number")
      .eq("id", id)
      .maybeSingle();

    if (error || !row) {
      return null;
    }

    return {
      id: row.id as string,
      referenceCode: row.reference_code as string,
      paymentStatus: row.payment_status as string,
      passType: row.pass_type as string,
      firstName: row.first_name as string,
      ticketNumber: row.ticket_number as string | null,
    };
  });
