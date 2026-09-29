import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSupabase } from "@/lib/supabaseClient";

export async function POST(request) {
  try {
    const { amountInRupees, receiptId, addonMantra } = await request.json();

    if (!amountInRupees || !receiptId) {
      return NextResponse.json({ error: "Missing amountInRupees or receiptId" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100), // Razorpay expects paise
      currency: "INR",
      receipt: receiptId,
    });

    // Stored now so the webhook (which only knows the order id, not the
    // reportId) can later look up which report to mark paid. The addon flag
    // is captured here too — before payment even completes — so it survives
    // the webhook-only success path, which never sees the client's request.
    await getSupabase()
      .from("reports")
      .update({ razorpay_order_id: order.id, addon_mantra: !!addonMantra })
      .eq("id", receiptId);

    return NextResponse.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
