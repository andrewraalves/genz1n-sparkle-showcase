import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type SiteSettings = Record<string, Record<string, unknown>>;

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    const out: SiteSettings = {};
    for (const row of data ?? []) out[row.key] = (row.value ?? {}) as Record<string, unknown>;
    return out;
  },
  staleTime: 30_000,
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 30_000,
});

export const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("job_openings")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 30_000,
});

export function getSetting<T = Record<string, unknown>>(
  s: SiteSettings | undefined,
  key: string,
  fallback: T,
): T {
  return ((s?.[key] as unknown) as T) ?? fallback;
}
