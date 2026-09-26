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

const EVIDENCE_BY_SLUG: Record<string, string> = {
  "enterprise-workforce-platform": "/evidence/enterprise-operations.webp",
  "enterprise-operations-suite": "/evidence/enterprise-operations.webp",
  "construction-billing-sov": "/evidence/construction-progress-billing.svg",
  "construction-progress-billing": "/evidence/construction-progress-billing.svg",
  "healthcare-platform-enhancement": "/evidence/provider-current-state.svg",
  "provider-workflow-modernization": "/evidence/provider-current-state.svg",
  "school-management-saas": "/evidence/school-operations.svg",
  "school-operations-platform": "/evidence/school-operations.svg",
  "service-marketplace-booking": "/evidence/service-discovery.webp",
  "local-service-discovery": "/evidence/service-discovery.webp",
};

const CASE_STUDY_FALLBACKS: Record<string, CaseStudyDetails> = {
  "enterprise-workforce-platform": {
    stage: "Product definition and delivery",
    context:
      "A connected workforce platform spans HRMS, CRM, timesheets, payroll and talent operations. Its shared roles, approvals and data rules cross module boundaries.",
    decisions: [
      "Make roles, permissions and approvals explicit across modules.",
      "Treat shared data and cross-module handoffs as product requirements.",
      "Give design and engineering clear acceptance criteria before sequencing delivery.",
    ],
    product_workflow: [
      "Role and workflow mapping",
      "Requirements",
      "Acceptance criteria",
      "Handoffs",
      "QA and release readiness",
    ],
    evidence_caption: "An anonymized module selector from the workforce platform.",
    evidence_items: ["Module launcher screenshot, cropped to remove account and client details."],
    shipped: [
      "Requirements and user stories",
      "Acceptance criteria",
      "UI and engineering handoffs",
      "QA and release-readiness coordination",
    ],
    learning:
      "In a multi-module product, shared rules need an owner and a home. Making those dependencies visible early helps each team deliver a coherent part of the system.",
  },
  "construction-billing-sov": {
    stage: "Workflow definition and delivery coordination",
    context:
      "Progress billing connects contract setup, schedule of values, monthly applications, change orders, lien waivers and archived records.",
    decisions: [
      "Establish contract defaults and cost-code standards before creating phase-based schedules of values.",
      "Support bulk imports while keeping the resulting line items consistent with the contract structure.",
      "Make review and archive behavior specific to the roles involved in billing and closeout.",
    ],
    product_workflow: [
      "Contract defaults",
      "Phase-based schedule of values",
      "Monthly pay application",
      "Change orders and lien waivers",
      "Role-specific review and archive",
    ],
    evidence_caption:
      "Reconstructed workflow map based on the supplied product material; labels and amounts are not client data.",
    evidence_items: ["Workflow map covering contract setup through billing review and closeout."],
    shipped: [
      "Defined setup, billing and closeout workflows",
      "Mapped validation and role-based review points",
      "Coordinated delivery across the contract lifecycle",
    ],
    learning:
      "Billing rules are easier to reason about when the contract, each line item and each later change stay connected throughout the workflow.",
  },
  "healthcare-platform-enhancement": {
    stage: "Current-state mapping and delivery baseline",
    context:
      "Provider Web and Patient Mobile workflows needed a shared current-state reference for product, UX, QA and engineering discussions.",
    decisions: [
      "Document current behavior before proposing changes, so the baseline does not imply unvalidated future-state behavior.",
      "Keep provider and patient journeys distinct while showing their handoffs.",
      "Capture validation points and open questions for downstream QA and backlog work.",
    ],
    product_workflow: [
      "Provider dashboard",
      "Patients",
      "Search, register and edit",
      "Clinical record",
      "Appointments, messages, tasks and audit",
    ],
    evidence_caption:
      "An anonymized current-state provider and patient workflow map reconstructed from supplied source material.",
    evidence_items: ["Source flow map covering provider web and patient mobile journeys."],
    shipped: [
      "Versioned current-state workflow baseline",
      "Validation points for QA mapping",
      "Open questions for development and backlog discussions",
    ],
    learning:
      "A trustworthy current-state map separates observed behavior from assumptions. That gives design and engineering room to improve the flow without losing the baseline.",
  },
  "school-management-saas": {
    stage: "Product structure and workflow definition",
    context:
      "School operations bring administrators, teachers, families and support teams into shared records with different permissions and handoffs.",
    decisions: [
      "Organize the product around role-specific tasks while keeping the underlying records connected.",
      "Separate academic, family communication and service workflows so each role can find its next action.",
      "Represent handoffs explicitly instead of treating every role as the same user.",
    ],
    product_workflow: [
      "Administration",
      "Teaching",
      "Family updates",
      "Fees and services",
      "Support",
    ],
    evidence_caption:
      "Reconstructed role and workflow model from the supplied school operations work.",
    evidence_items: ["Product model showing shared school records with role-specific workflows."],
    shipped: [
      "Role-based product model",
      "Workflow grouping for academic, family and operational tasks",
    ],
    learning:
      "Role clarity matters most where several people act on the same record. Modeling those permissions and handoffs early keeps the product understandable as it grows.",
  },
  "service-marketplace-booking": {
    stage: "Product flow and interface definition",
    context:
      "A service booking experience asks people to narrow a local choice by location, service and date before moving forward.",
    decisions: [
      "Keep location, service and date visible as the core booking inputs.",
      "Present the choices in a clear sequence so people can orient themselves before continuing.",
    ],
    product_workflow: ["Choose location", "Choose service", "Choose date", "Continue booking"],
    evidence_caption:
      "A privacy-safe crop of the supplied service discovery and booking interface.",
    evidence_items: ["Location, service and date selection controls."],
    shipped: ["A booking-selection interface covering location, service and date inputs"],
    learning:
      "A local service flow benefits from making the next decision obvious while preserving enough context for people to change an earlier choice.",
  },
  "enterprise-operations-suite": {},
  "construction-progress-billing": {},
  "provider-workflow-modernization": {},
  "school-operations-platform": {},
  "local-service-discovery": {},
};

export function getEvidenceFallbackPath(slug: string): string | null {
  return EVIDENCE_BY_SLUG[slug] ?? null;
}

export function getCaseStudyFallback(slug: string): CaseStudyDetails {
  const alias: Record<string, string> = {
    "enterprise-operations-suite": "enterprise-workforce-platform",
    "construction-progress-billing": "construction-billing-sov",
    "provider-workflow-modernization": "healthcare-platform-enhancement",
    "school-operations-platform": "school-management-saas",
    "local-service-discovery": "service-marketplace-booking",
  };
  return CASE_STUDY_FALLBACKS[alias[slug] ?? slug] ?? {};
}

export function mergeCaseStudy(slug: string, stored?: CaseStudyDetails | null): CaseStudyDetails {
  return { ...getCaseStudyFallback(slug), ...(stored ?? {}) };
}

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
