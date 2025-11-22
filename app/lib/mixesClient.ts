"use client";

import { supabase } from "@/app/lib/supabaseClient";

export async function saveMix(name: string, settings: any) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not logged in");

  const { data, error } = await supabase.from("mixes").insert({
    user_id: user.id,
    name,
    settings,
  });

  if (error) throw error;
  return data;
}

export async function getMyMixes() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from("mixes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteMix(id: string) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not logged in");

  const { error } = await supabase
    .from("mixes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

