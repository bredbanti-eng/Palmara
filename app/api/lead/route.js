import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

export async function POST(request) {
  try {
    const { reportId, name, contact, interest } = await request.json();
    const { error } = await getSupabase().from("leads").insert({
      report_id: reportId,
      name,
      contact,
      interest: interest || "mahadasha",
    });
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
    }
    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
