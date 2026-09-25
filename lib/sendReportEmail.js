// Sends the report via Resend (3,000 free emails/month, permanent free tier).
// Get RESEND_API_KEY from https://resend.com/api-keys after verifying a
// sending domain (e.g. hello@palmara.in) in their dashboard.
export async function sendReportEmail({ to, name, lang, reportId, teaserText, pdfBase64 }) {
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://palmara.in"}/report/${reportId}`;

  const subjectLine =
    lang === "hi" ? "आपकी पालमारा रीडिंग तैयार है" : "Your Palmara reading is ready";

  // PDF-first on purpose: it's attached right here, opens with zero
  // clicks/login. The "view online" link is kept as a lightweight secondary
  // mention (not a big CTA button) so the "revisit anytime via your link"
  // promise on-site still holds once this is deployed — just not the
  // headline action anymore.
  const bodyHtml =
    lang === "hi"
      ? `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background:#591019; padding:24px; text-align:center;">
            <h1 style="color:#FBF1DC; font-family: Georgia, serif; margin:0;">पालमारा</h1>
          </div>
          <div style="padding:24px; color:#2B1B12;">
            <p>नमस्ते ${name || ""},</p>
            <p>आपकी पूरी रीडिंग तैयार है — यह इस ईमेल के साथ PDF के रूप में संलग्न है, तुरंत खोलने या सहेजने के लिए तैयार।</p>
            <p style="font-size:13px; color:#5A4531; margin-top:20px;">आप इसे ऑनलाइन भी कभी भी <a href="${reportUrl}" style="color:#7A1220;">इस लिंक</a> पर देख सकते हैं।</p>
          </div>
        </div>`
      : `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background:#591019; padding:24px; text-align:center;">
            <h1 style="color:#FBF1DC; font-family: Georgia, serif; margin:0;">Palmara</h1>
          </div>
          <div style="padding:24px; color:#2B1B12;">
            <p>Hi ${name || ""},</p>
            <p>Your full reading is ready — it's attached to this email as a PDF, ready to open or save right away.</p>
            <p style="font-size:13px; color:#5A4531; margin-top:20px;">You can also view it online anytime at <a href="${reportUrl}" style="color:#7A1220;">this link</a>.</p>
          </div>
        </div>`;

  const payload = {
    from: "Palmara <hello@palmara.in>",
    to: [to],
    subject: subjectLine,
    html: bodyHtml,
  };

  if (pdfBase64) {
    payload.attachments = [
      {
        filename: "Palmara-reading.pdf",
        content: pdfBase64,
      },
    ];
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Resend send failed:", errText);
    return { sent: false };
  }

  return { sent: true };
}
