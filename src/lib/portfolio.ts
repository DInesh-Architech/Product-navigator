import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PortfolioTable = keyof Database["public"]["Tables"];

export type SiteSettings = {
  id: string;
  hero_headline: string;
  hero_supporting: string;
  capability_tags: string[];
  contact_email: string;
  linkedin_url: string;
  github_url: string;
  location: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  seo_title: string;
  seo_description: string;
};

export type About = {
  id: string;
  intro: string;
  transition_copy: string;
  portrait_path: string | null;
};

export type Resume = {
  id: string;
  file_path: string | null;
  file_name: string | null;
  uploaded_at: string | null;
};

export type CaseStudyDetails = {
  stage?: string;
  context?: string;
  decisions?: string[];
  product_workflow?: string[];
  evidence_caption?: string;
  evidence_items?: string[];
  shipped?: string[];
  learning?: string;
};

export type SelectedWork = {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  challenge: string;
  contribution: string;
  workflow: string[];
  outcome: string;
  tags: string[];
  featured: boolean;
  display_order: number;
  image_path: string | null;
  evidence_type: string;
  case_study?: CaseStudyDetails | null;
  visible: boolean;
};

export type IndependentWork = {
  id: string;
  title: string;
  status: string;
  description: string;
  capabilities: string[];
  image_path: string | null;
  live_url: string | null;
  repo_url: string | null;
  size_variant: string;
  visible: boolean;
  featured: boolean;
  display_order: number;
};

export type HealthcareStudy = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  image_path: string | null;
  visible: boolean;
};

export type VisualWork = {
  id: string;
  title: string;
  category: string;
  short_description: string;
  image_path: string | null;
  url: string | null;
  display_order: number;
  visible: boolean;
};

async function one<T>(table: PortfolioTable): Promise<T | null> {
  const { data, error } = await supabase.from(table).select("*").limit(1).maybeSingle();
  if (error) throw error;
  return (data as T) ?? null;
}

async function many<T>(table: PortfolioTable): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as T[];
}

export const useSiteSettings = () =>
  useQuery({ queryKey: ["site_settings"], queryFn: () => one<SiteSettings>("site_settings") });

export const useAbout = () => useQuery({ queryKey: ["about"], queryFn: () => one<About>("about") });

export const useResume = () =>
  useQuery({ queryKey: ["resume"], queryFn: () => one<Resume>("resume") });

export const useHealthcareStudy = () =>
  useQuery({
    queryKey: ["healthcare_study"],
    queryFn: () => one<HealthcareStudy>("healthcare_study"),
  });

export const useSelectedWork = () =>
  useQuery({
    queryKey: ["selected_work"],
    queryFn: () => many<SelectedWork>("selected_work"),
    placeholderData: [],
  });

export const useIndependentWork = () =>
  useQuery({
    queryKey: ["independent_work"],
    queryFn: () => many<IndependentWork>("independent_work"),
    placeholderData: [],
  });

export const useVisualWork = () =>
  useQuery({
    queryKey: ["visual_work"],
    queryFn: () => many<VisualWork>("visual_work"),
    placeholderData: [],
  });

const signedCache = new Map<string, string>();

export async function getMediaUrl(path: string): Promise<string | null> {
  if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith("/")) return path;
  if (signedCache.has(path)) return signedCache.get(path)!;
  try {
    const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 6);
    if (error || !data?.signedUrl) return null;
    signedCache.set(path, data.signedUrl);
    return data.signedUrl;
  } catch {
    return null;
  }
}

/** Resolves a stored media path into a temporary viewable URL. */
export function useMediaUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    getMediaUrl(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);

  return url;
}

export const ACCENTS = ["mint", "cobalt", "coral", "lilac", "turmeric", "sky"] as const;

export function accentBar(index: number) {
  const map = [
    "accent-bar-mint",
    "accent-bar-cobalt",
    "accent-bar-coral",
    "accent-bar-lilac",
    "accent-bar-turmeric",
    "accent-bar-sky",
  ];
  return map[index % map.length];
}
