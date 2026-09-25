import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

export async function GET(request, { params }) {
  try {
    const { data: report, error } = await getSupabase()
      .from("reports")
      .select("name, dob, birth_time, birth_place, hand_shape, language, sections_en, sections_hi, full_text, teaser_text, paid")
      .eq("id", params.id)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
