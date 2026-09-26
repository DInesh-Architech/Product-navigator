import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, StateBlock } from "@/components/site/Section";
import { EvidenceReveal } from "@/components/site/EvidenceReveal";
import {
  accentBar,
  getMediaUrl,
  useAbout,
  useHealthcareStudy,
  useIndependentWork,
  useMediaUrl,
  useResume,
  useSelectedWork,
  useSiteSettings,
  useVisualWork,
} from "@/lib/portfolio";

const TITLE = "O. Dinesh Kumar — Technical Product Manager";
const DESCRIPTION =
  "Product Manager / Technical Product Manager turning ambiguous business needs into buildable products: workflows, product decisions and delivery plans engineering teams can act on.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

const NAV = [
  { href: "#selected-work", label: "Selected Work" },
  { href: "#independent-work", label: "Independent Work" },
  { href: "#how-i-work", label: "How I Work" },
  { href: "#visual-work", label: "Visual & Brand" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

function useResumeLink() {
  const { data: resume } = useResume();
  const [busy, setBusy] = useState(false);

  const open = async () => {
    if (!resume?.file_path) return;
    setBusy(true);
    const url = await getMediaUrl(resume.file_path);
    setBusy(false);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return { resume, open, busy, available: Boolean(resume?.file_path) };
}

function Portfolio() {
  const settings = useSiteSettings();
  const s = settings.data;
  const { open: openResume, busy: resumeBusy, available: resumeAvailable } = useResumeLink();

  return (
    <div className="min-h-screen">
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-mint focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8"
        >
          <a href="#hero" className="font-display text-sm font-semibold tracking-tight">
            O. Dinesh Kumar
            <span className="ml-2 hidden text-xs font-normal text-muted-foreground sm:inline">
              Technical Product Manager
            </span>
          </a>
          <ul className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition-colors hover:text-mint">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" className="btn-base btn-outline !px-3 !py-1.5 !text-xs">
            Get in touch
          </a>
        </nav>
      </header>

      <main id="hero">
        {/* HERO */}
        <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 md:pb-28 md:pt-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full opacity-[0.18] blur-3xl accent-bar-mint"
          />
          <div className="relative mx-auto max-w-6xl">
            <p className="eyebrow">PRODUCT · SYSTEMS · AI · DELIVERY</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.96] sm:text-6xl md:text-7xl lg:text-[6.5rem]">
              {s?.hero_headline ?? "I turn messy ideas into products people can actually use."}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {s?.hero_supporting ?? ""}
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {(s?.capability_tags ?? []).map((tag, i) => (
                <li key={tag} className="tag-chip">
                  <span
                    aria-hidden="true"
                    className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${accentBar(i)}`}
                  />
                  {tag}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#selected-work" className="btn-base btn-primary">
                {s?.cta_primary_label || "Selected Work"}
              </a>
              <button
                type="button"
                onClick={openResume}
                disabled={!resumeAvailable || resumeBusy}
                className="btn-base btn-outline"
                title={resumeAvailable ? "Open resume PDF" : "Resume will be available shortly"}
              >
                {resumeBusy ? "Opening…" : s?.cta_secondary_label || "Resume"}
              </button>
              {s?.linkedin_url ? (
                <a
                  href={s.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-base btn-outline"
                >
                  LinkedIn
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <SelectedWorkSection />
        <IndependentSection />
        <HowIWorkSection />
        <HealthcareSection />
        <VisualSection />
        <AboutSection />
        <ContactSection />
      </main>

      <footer className="border-t border-border px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} O. Dinesh Kumar</p>
          <p>Client, employer and product names are intentionally not disclosed.</p>
        </div>
      </footer>
    </div>
  );
}

function SelectedWorkSection() {
  const { data, isLoading, error } = useSelectedWork();
  const items = (data ?? []).slice(0, 5);

  return (
    <Section
      id="selected-work"
      eyebrow="01 — Selected Product Work"
      title="Products shaped from ambiguity to delivery"
      intro="A few products I’ve helped shape — from messy requirements to working systems."
      tone="quiet"
    >
      <StateBlock
        loading={isLoading}
        error={error}
        empty={items.length === 0}
        emptyText="Selected work will appear here."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {items.map((item, i) => (
            <article
              key={item.id}
              className="panel group relative min-h-[22rem] flex flex-col overflow-hidden p-6 sm:p-8 transition-colors hover:border-border-strong focus-within:border-border-strong"
            >
              <span
                aria-hidden="true"
                className={`absolute left-0 top-6 h-10 w-[3px] rounded-r ${accentBar(i)}`}
              />
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">{item.category}</p>
                {item.featured ? <span className="tag-chip !text-[0.68rem]">Featured</span> : null}
              </div>
              <h3 className="mt-4 max-w-2xl text-2xl font-semibold sm:text-3xl lg:text-4xl">{item.title}</h3>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {item.short_description}
              </p>

              <div className="mt-auto pt-6">
                <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
                  <div>
                    <p className="eyebrow">My role</p>
                    <p className="mt-1 line-clamp-2 max-w-xl text-sm text-foreground/90">{item.contribution}</p>
                  </div>
                  <span aria-hidden="true" className="text-2xl text-mint transition-transform group-hover:translate-x-1">↗</span>
                </div>
              </div>

              <EvidenceReveal
                path={item.image_path}
                evidenceType={item.evidence_type}
                title={item.title}
              />
            </article>
          ))}
        </div>
      </StateBlock>
    </Section>
  );
}

function IndependentSection() {
  const { data, isLoading, error } = useIndependentWork();
  const items = data ?? [];
  const standard = items.filter((i) => i.size_variant !== "small");
  const small = items.filter((i) => i.size_variant === "small");

  return (
    <Section
      id="independent-work"
      eyebrow="02 — Independent Product Work"
      title="Products I am building on my own terms"
      intro="Experiments, prototypes and products I’m building beyond the day job."
    >
      <StateBlock
        loading={isLoading}
        error={error}
        empty={items.length === 0}
        emptyText="Independent work will appear here."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {standard.map((item, i) => (
            <article key={item.id} className="panel flex flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="tag-chip !text-[0.7rem]">{item.status}</span>
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-10 rounded-full ${accentBar(i + 1)}`}
                />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              {item.capabilities.length ? (
                <ul className="mt-4 space-y-1.5 text-sm text-foreground/90">
                  {item.capabilities.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span aria-hidden="true" className="text-mint">
                        —
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                {item.live_url ? (
                  <a
                    href={item.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-base btn-outline !px-3 !py-1.5 !text-xs"
                  >
                    Live
                  </a>
                ) : null}
                {item.repo_url ? (
                  <a
                    href={item.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-base btn-outline !px-3 !py-1.5 !text-xs"
                  >
                    Repository
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {small.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {small.map((item) => (
              <article key={item.id} className="panel p-5">
                <div className="flex items-center gap-2">
                  <span className="tag-chip !text-[0.68rem]">Exploration · {item.status}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </StateBlock>
    </Section>
  );
}

const PRINCIPLES = [
  { title: "Map the system", body: "Roles, states, rules and edge cases before screens." },
  { title: "Make decisions visible", body: "Clear trade-offs, ownership and reasons — not vague handoffs." },
  { title: "Ship around risk", body: "Test the uncertain parts early and learn before polishing." },
  { title: "Design for reality", body: "Exceptions, overrides and imperfect data are part of the product." },
];

function HowIWorkSection() {
  return (
    <Section
      id="how-i-work"
      eyebrow="03 — Inside the Work"
      title="How I work"
      intro="Less process theatre. More clarity, decisions and shipped work."
      tone="quiet"
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {PRINCIPLES.map((p, i) => (
          <div key={p.title} className="bg-surface p-6">
            <span
              aria-hidden="true"
              className={`inline-block h-1 w-8 rounded-full ${accentBar(i)}`}
            />
            <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HealthcareSection() {
  const { data, isLoading } = useHealthcareStudy();
  if (isLoading || !data) return null;

  return (
    <section
      id="healthcare-study"
      aria-labelledby="healthcare-heading"
      className="px-5 py-16 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="panel p-6 sm:p-8">
          <p className="eyebrow">04 — Secondary Study</p>
          <h2 id="healthcare-heading" className="mt-3 text-2xl font-semibold sm:text-3xl">
            {data.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {data.summary}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {data.bullets.map((b, i) => (
              <li key={b} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                <span
                  aria-hidden="true"
                  className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${accentBar(i)}`}
                />
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            Product and client names are withheld. No confidential material is shown.
          </p>
        </div>
      </div>
    </section>
  );
}

function VisualCard({
  item,
  index,
}: {
  item: { id: string; title: string; category: string; short_description: string; image_path: string | null; url: string | null };
  index: number;
}) {
  const url = useMediaUrl(item.image_path);
  const body = (
    <>
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-2">
        {url ? (
          <img
            src={url}
            alt={`${item.title} — ${item.category}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              aria-hidden="true"
              className={`h-1 w-12 rounded-full ${accentBar(index)}`}
            />
          </div>
        )}
      </div>
      <p className="eyebrow mt-4">{item.category}</p>
      <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {item.short_description}
      </p>
    </>
  );

  return (
    <article>
      {item.url ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
          {body}
        </a>
      ) : (
        body
      )}
    </article>
  );
}

function VisualSection() {
  const { data, isLoading, error } = useVisualWork();
  const items = (data ?? []).slice(0, 6);

  return (
    <Section
      id="visual-work"
      eyebrow="05 — Visual & Brand Work"
      title="Design foundation"
      intro="A visual side of the work — identity, interfaces and experiments."
      tone="quiet"
    >
      <StateBlock
        loading={isLoading}
        error={error}
        empty={items.length === 0}
        emptyText="Visual work will appear here."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <VisualCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </StateBlock>
    </Section>
  );
}

function AboutSection() {
  const { data, isLoading } = useAbout();
  const portrait = useMediaUrl(data?.portrait_path);

  return (
    <Section
      id="about"
      eyebrow="06 — About"
      title="Product thinking, with a builder’s bias"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5 text-base leading-relaxed text-foreground/90">
          {isLoading ? (
            <div className="panel h-40 animate-pulse opacity-60" />
          ) : (
            <>
              <p>{data?.intro}</p>
              <p className="text-muted-foreground">{data?.transition_copy}</p>
            </>
          )}
        </div>
        <div className="panel overflow-hidden">
          {portrait ? (
            <img
              src={portrait}
              alt="Portrait of O. Dinesh Kumar"
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Portrait coming soon.
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

function ContactSection() {
  const { data: s } = useSiteSettings();
  const { open: openResume, available } = useResumeLink();

  return (
    <Section
      id="contact"
      eyebrow="07 — Contact"
      title="Have something interesting to build?"
      intro="Product roles, collaborations and ambitious ideas are welcome."
      tone="quiet"
    >
      <div className="flex flex-wrap items-center gap-3">
        {s?.contact_email ? (
          <a href={`mailto:${s.contact_email}`} className="btn-base btn-primary">
            {s.contact_email}
          </a>
        ) : null}
        {s?.linkedin_url ? (
          <a
            href={s.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base btn-outline"
          >
            LinkedIn
          </a>
        ) : null}
        {s?.github_url ? (
          <a
            href={s.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base btn-outline"
          >
            GitHub
          </a>
        ) : null}
        {available ? (
          <button type="button" onClick={openResume} className="btn-base btn-outline">
            Download resume
          </button>
        ) : null}
      </div>
      {s?.location ? <p className="mt-6 text-sm text-muted-foreground">{s.location}</p> : null}
    </Section>
  );
}