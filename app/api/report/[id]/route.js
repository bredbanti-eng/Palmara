import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

export async function GET(request, { params }) {
  try {
    let { data: report, error } = await getSupabase()
      .from("reports")
      .select("name, dob, birth_time, birth_place, hand_shape, seed, language, sections_en, sections_hi, chart, full_text, teaser_text, paid")
      .eq("id", params.id)
      .single();

    // PGRST204/42703 = the `chart` column doesn't exist yet in this
    // environment (migration not run) — fall back to selecting without it
    // rather than making every report page 404.
    if (error && /chart/i.test(error.message || "")) {
      console.error("`chart` column missing on `reports` — retrying select without it. Run: alter table reports add column if not exists chart jsonb;");
      ({ data: report, error } = await getSupabase()
        .from("reports")
        .select("name, dob, birth_time, birth_place, hand_shape, seed, language, sections_en, sections_hi, full_text, teaser_text, paid")
        .eq("id", params.id)
        .single());
    }

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
