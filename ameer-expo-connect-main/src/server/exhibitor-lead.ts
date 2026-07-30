import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase-server";
import { sendExhibitorLeadNotification } from "../lib/notify";

const ExhibitorLeadSchema = z.object({
  company: z.string().min(1, "Company is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional(),
  interest: z.enum(["booth", "sponsorship"]),
  tierOrSize: z.string().optional(),
  message: z.string().optional(),
});

export const submitExhibitorLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => ExhibitorLeadSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { data: row, error } = await supabaseAdmin
        .from("exhibitor_leads")
        .insert({
          company: data.company,
          contact_name: data.contactName,
          email: data.email,
          phone: data.phone || null,
          interest: data.interest,
          tier_or_size: data.tierOrSize || null,
          message: data.message || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      await sendExhibitorLeadNotification({
        id: row.id,
        company: row.company,
        contactName: row.contact_name,
        email: row.email,
        phone: row.phone,
        interest: row.interest,
        tierOrSize: row.tier_or_size,
        message: row.message,
      });

      return { success: true };
    } catch (error) {
      console.error("Exhibitor lead error:", error);
      throw new Error("Failed to save exhibitor lead");
    }
  });
