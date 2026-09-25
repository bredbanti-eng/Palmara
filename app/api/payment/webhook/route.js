import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabase } from "@/lib/supabaseClient";

// Server-to-server backstop for the client-side /verify-payment call: if a
// user pays but closes the tab before the checkout handler fires (flaky
// network, browser killed, etc.), Razorpay still POSTs here directly, so the
// report gets marked paid either way.
//
// Only usable once deployed behind a public URL — register it in the
// Razorpay dashboard as https://<your-domain>/api/payment/webhook for the
// "payment.captured" event, which gives you the RAZORPAY_WEBHOOK_SECRET to
// set below. Can't be exercised on localhost.
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (process.env.RAZORPAY_WEBHOOK_SECRET) {
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");
    if (expected !== signature) {
      console.error("Razorpay webhook signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    console.warn("RAZORPAY_WEBHOOK_SECRET not set — webhook signature is NOT being verified");
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      const { error } = await getSupabase()
        .from("reports")
        .update({ paid: true })
        .eq("razorpay_order_id", orderId);
      if (error) console.error("Webhook: could not mark report paid:", error);
    }
  }

  return NextResponse.json({ received: true });
}
