import { supabaseServer } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}

