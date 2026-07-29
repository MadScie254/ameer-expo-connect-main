import { getPesapalToken } from "./pesapal";
import db from "../lib/db";

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
        Authorization: `Bearer ${token}`
      }
    });

    const statusData = await statusReq.json();
    if (statusData.error) {
      throw new Error(statusData.error.message || "Failed to check status");
    }

    const paymentStatus = statusData.payment_status_description; // COMPLETED, FAILED, etc.
    const internalStatus = paymentStatus === "COMPLETED" ? "paid" : "failed";

    // 3. Update DB
    const update = db.prepare(`
      UPDATE registrations 
      SET paymentStatus = @status 
      WHERE orderTrackingId = @orderTrackingId
    `);
    
    update.run({
      status: internalStatus,
      orderTrackingId
    });

    return new Response(JSON.stringify({ 
      orderTrackingId,
      status: 200,
      message: "IPN handled successfully"
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "IPN Error";
    console.error("IPN Error:", err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
