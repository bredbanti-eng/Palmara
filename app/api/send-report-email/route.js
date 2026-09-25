import { NextResponse } from "next/server";
import { sendReportEmail } from "@/lib/sendReportEmail";
import { getSupabase } from "@/lib/supabaseClient";

export async function POST(request) {
  try {
    const { to, name, lang, reportId, pdfBase64 } = await request.json();

    if (!to || !reportId) {
      return NextResponse.json({ sent: false, error: "Missing to or reportId" }, { status: 400 });
    }

    const { data: report } = await getSupabase()
      .from("reports")
      .select("teaser_text")
      .eq("id", reportId)
      .single();

    const result = await sendReportEmail({
      to,
      name,
      lang,
      reportId,
      teaserText: report?.teaser_text,
      pdfBase64,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ sent: false, error: "Unexpected error" }, { status: 500 });
  }
}
