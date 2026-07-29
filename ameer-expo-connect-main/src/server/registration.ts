import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import db from "../lib/db";
import { getPesapalToken, submitPesapalOrder } from "./pesapal";

const RegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string(),
  dob: z.string(),
  idNumber: z.string(),
  country: z.string(),
  city: z.string(),
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
  passType: z.string().optional(), // Added for Task 3
});

export const submitRegistration = createServerFn({ method: "POST" })
  .validator((data: unknown) => RegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const id = `AE26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const payload = JSON.stringify(data);

      let redirectUrl = null;
      let orderTrackingId = null;
      let paymentStatus = "free";

      const passType = data.passType || "general";

      if (passType === "vip") {
        paymentStatus = "pending";
        // Fetch pesapal token and submit order
        const token = await getPesapalToken();
        const pesapalRes = await submitPesapalOrder(token, {
          id,
          amount: 5000,
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
        });
        redirectUrl = pesapalRes.redirect_url;
        orderTrackingId = pesapalRes.order_tracking_id;
      }

      await db.execute({
        sql: `
          INSERT INTO registrations (
            id, firstName, lastName, email, phone, company, jobTitle, passType, amount, paymentStatus, orderTrackingId, payload
          ) VALUES (
            @id, @firstName, @lastName, @email, @phone, @company, @jobTitle, @passType, @amount, @paymentStatus, @orderTrackingId, @payload
          )
        `,
        args: {
          id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          jobTitle: data.jobTitle,
          passType,
          amount: passType === "vip" ? 5000 : 0,
          paymentStatus,
          orderTrackingId,
          payload,
        },
      });

      return { success: true, id, passType, redirectUrl };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Failed to save registration");
    }
  });

export const getRegistrationStatus = createServerFn({ method: "GET" })
  .validator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    const result = await db.execute({
      sql: `SELECT id, paymentStatus, passType, firstName FROM registrations WHERE id = @id`,
      args: { id },
    });

    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return {
      id: row.id as string,
      paymentStatus: row.paymentStatus as string,
      passType: row.passType as string,
      firstName: row.firstName as string,
    };
  });
