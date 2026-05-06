import { supabase } from "@/integrations/supabase/client";
import type { Ulb } from "./ulb-types";

export async function fetchUlbBySlug(slug: string): Promise<Ulb> {
  const { data, error } = await supabase
    .from("ulbs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Municipality not found");
  return data;
}