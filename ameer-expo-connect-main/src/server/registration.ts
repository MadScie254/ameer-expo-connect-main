import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import db from "../lib/db";

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

export const submitRegistration = createServerFn({ method: 'POST' })
  .validator((data: unknown) => RegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const id = `AE26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const payload = JSON.stringify(data);
      
      const insert = db.prepare(`
        INSERT INTO registrations (
          id, firstName, lastName, email, phone, company, jobTitle, passType, payload
        ) VALUES (
          @id, @firstName, @lastName, @email, @phone, @company, @jobTitle, @passType, @payload
        )
      `);

      // For task 3, default to general pass type if missing
      const passType = data.passType || 'general';

      insert.run({
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        jobTitle: data.jobTitle,
        passType: passType,
        payload
      });

      return { success: true, id, passType };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Failed to save registration");
    }
  });
