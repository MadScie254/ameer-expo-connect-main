import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase-server";
import { getPesapalToken, submitPesapalOrder } from "./pesapal";
import { sendRegistrationNotification, sendRegistrantConfirmation } from "../lib/notify";

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
});

async function findOrCreateUserId(email: string, firstName: string, lastName: string) {
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) return existingProfile.id;

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true, // trust the registration form itself; don't send a confirmation email
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (error) throw error;
  return created.user!.id;
}

export const submitRegistration = createServerFn({ method: "POST" })
  .validator((data: unknown) => RegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    try {
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
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (paymentStatus === "free") {
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
        });
      }

      return {
        success: true,
        id: row.id,
        referenceCode: row.reference_code,
        passType,
        redirectUrl,
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
      .select("id, reference_code, payment_status, pass_type, first_name")
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
    };
  });
