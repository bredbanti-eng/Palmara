import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabase } from "@/lib/supabaseClient";

// Razorpay's checkout handler hands back an order id, payment id, and a
// signature computed server-side by Razorpay over "orderId|paymentId" using
// our key secret. Recomputing it here and comparing is how we confirm the
// payment actually happened and wasn't forged by a client-side call.
export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, reportId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !reportId) {
      return NextResponse.json({ verified: false, error: "Missing payment details" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch for report", reportId);
      return NextResponse.json({ verified: false, error: "Signature mismatch" }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from("reports")
      .update({ paid: true, razorpay_order_id })
      .eq("id", reportId);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ verified: false, error: "Could not update report" }, { status: 500 });
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ verified: false, error: "Unexpected error" }, { status: 500 });
  }
}
