import { getPesapalToken } from "./pesapal";
import { supabaseAdmin } from "../lib/supabase-server";
import { sendRegistrationNotification, sendRegistrantConfirmation } from "../lib/notify";

export async function handleIpn(request: Request) {
  try {
    const url = new URL(request.url);
    let orderTrackingId = url.searchParams.get("OrderTrackingId");
    let merchantReference = url.searchParams.get("OrderMerchantReference");

    // Fallback to body if not in query
    if (!orderTrackingId && request.method === "POST") {
      try {
        const body = await request.json();
        orderTrackingId = body.OrderTrackingId;
        merchantReference = body.OrderMerchantReference;
      } catch (e) {
        // ignore
      }
    }

    if (!orderTrackingId) {
      return new Response(JSON.stringify({ error: "Missing OrderTrackingId" }), { status: 400 });
    }

    // 1. Get token
    const token = await getPesapalToken();

    // 2. Check status
    const statusUrl = `https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;
    const statusReq = await fetch(statusUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const statusData = await statusReq.json();
    if (statusData.error) {
      throw new Error(statusData.error.message || "Failed to check status");
    }

    const paymentStatus = statusData.payment_status_description; // COMPLETED, FAILED, etc.
    const internalStatus = paymentStatus === "COMPLETED" ? "paid" : "failed";

    // 3. Read current registration to make notification idempotent.
    const { data: existingRow, error: findError } = await supabaseAdmin
      .from("registrations")
      .select("id, first_name, last_name, email, phone, company, pass_type, amount, payment_status")
      .eq("order_tracking_id", orderTrackingId)
      .maybeSingle();

    if (findError) {
      console.error("IPN Supabase lookup error:", findError);
      return new Response(JSON.stringify({ error: "Failed to lookup registration" }), {
        status: 500,
      });
    }

    if (!existingRow) {
      return new Response(JSON.stringify({ error: "Registration not found" }), { status: 404 });
    }

    const wasPaid = existingRow.payment_status === "paid";

    // 4. Update DB
    const { data: updatedRow, error } = await supabaseAdmin
      .from("registrations")
      .update({ payment_status: internalStatus })
      .eq("order_tracking_id", orderTrackingId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("IPN Supabase Error:", error);
    } else if (updatedRow && internalStatus === "paid" && !wasPaid) {
      // 5. Send notification only on transition to paid
      await sendRegistrationNotification({
        id: updatedRow.id,
        firstName: updatedRow.first_name,
        lastName: updatedRow.last_name,
        email: updatedRow.email,
        phone: updatedRow.phone,
        company: updatedRow.company,
        passType: updatedRow.pass_type,
        amount: Number(updatedRow.amount),
        paymentStatus: updatedRow.payment_status,
      });

      await sendRegistrantConfirmation({
        email: updatedRow.email,
        firstName: updatedRow.first_name,
        referenceCode: updatedRow.reference_code,
        passType: updatedRow.pass_type,
      });
    }

    return new Response(
      JSON.stringify({
        orderTrackingId,
        status: 200,
        message: "IPN handled successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "IPN Error";
    console.error("IPN Error:", err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
