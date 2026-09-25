"use client";

import { useState } from "react";

// Same Razorpay checkout flow previously embedded directly in PaymentButton,
// lifted into a hook so every unlock entry point (main CTA, sticky bar, each
// locked section's own overlay) can trigger the identical flow rather than
// each needing its own copy of the order/verify/checkout wiring.
export function useRazorpayCheckout({ reportId, name, onPaid }) {
  const [loading, setLoading] = useState(false);

  async function payNow() {
    setLoading(true);
    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInRupees: 99, receiptId: reportId }),
      });
      const { order, keyId } = await orderRes.json();

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Palmara",
          order_id: order.id,
          prefill: { name },
          theme: { color: "#7A1220" },
          handler: async function (response) {
            const verifyRes = await fetch("/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, reportId }),
            });
            const result = await verifyRes.json();
            if (result.verified) {
              onPaid();
            }
            setLoading(false);
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
        });
        rzp.open();
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return { payNow, loading };
}
