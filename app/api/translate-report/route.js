import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";
import { callGeminiWithRetry, extractGeminiText } from "@/lib/gemini";

// Reports created after the bilingual-generation update already store
// full_text as the flattened ENGLISH sections regardless of which language
// was submitted (both languages are generated up front — see
// /api/generate-reading). So for those rows this is just a cached lookup.
//
// Only a legacy row (written before that change, language: "hi", no
// sections_en) needs an actual on-demand translation — kept here as a
// fallback so old reports still work.
export async function POST(request) {
  try {
    const { reportId } = await request.json();
    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: report, error } = await supabase
      .from("reports")
      .select("language, full_text, full_text_en, sections_en")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Already English, already has English sections, or already translated
    // and cached — nothing to (re)do.
    if (report.language !== "hi" || report.sections_en) {
      return NextResponse.json({ englishText: report.full_text });
    }
    if (report.full_text_en) {
      return NextResponse.json({ englishText: report.full_text_en });
    }

    const prompt = `Translate the following Vedic astrology reading from Hindi to natural, fluent English. Keep the same structure, tone, and any tables formatted the same way. Do not add commentary — output only the translated reading.\n\n${report.full_text}`;

    const response = await callGeminiWithRetry(prompt);

    if (!response || response.quotaExceeded) {
      return NextResponse.json({ error: "Translation failed" }, { status: 502 });
    }

    const data = await response.json();
    const englishText = extractGeminiText(data);

    await supabase.from("reports").update({ full_text_en: englishText }).eq("id", reportId);

    return NextResponse.json({ englishText });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
