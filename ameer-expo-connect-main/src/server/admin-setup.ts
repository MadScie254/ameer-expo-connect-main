import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

export const setAdminPassword = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({ email: z.string().email(), password: z.string().min(8), pin: z.string().min(1) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { email, password, pin } = data;

    const expectedPin = process.env.ADMIN_SETUP_PIN;
    if (!expectedPin || pin !== expectedPin) {
      return { success: false as const, error: "invalid_pin" as const };
    }

    try {
      // List users and find matching email
      const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (listErr) throw listErr;

      const match = usersData.users.find((u) => u.email === email);
      if (!match) return { success: false as const, error: "user_not_found" as const };

      // Update user password
      const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(match.id, {
        password,
      });
      if (updateErr) throw updateErr;

      return { success: true as const };
    } catch (err) {
      console.error("setAdminPassword error:", err);
      return { success: false as const, error: "failed" as const };
    }
  });
