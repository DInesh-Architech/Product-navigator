import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  type IndependentWork,
  type HealthcareStudy,
  type SelectedWork,
  type VisualWork,
  getEvidenceFallbackPath,
  mergeCaseStudy,
  useAbout,
  useHealthcareStudy,
  useIndependentWork,
  useResume,
  useSelectedWork,
  useSiteSettings,
  useVisualWork,
  useMediaUrl,
} from "@/lib/portfolio";

const TITLE = "O. Dinesh Kumar — Product Manager & Product Builder";
const DESCRIPTION =
  "Product Manager and Product Builder shaping complex workflows into products teams can ship.";

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

const DEFAULT_ABOUT =
  "I work at the point where business intent becomes a product people can build, use and improve.";
const DEFAULT_JOURNEY =
  "Architecture → Design and Business Leadership → Product Discovery and Delivery → Technical Product Management";

const FALLBACK_FEATURED: SelectedWork[] = [
  {
    id: "enterprise-operations-suite",
    title: "Enterprise Operations Suite",
    slug: "enterprise-operations-suite",
    category: "Enterprise SaaS",
    short_description: "A multi-module platform across HRMS, CRM, Timesheets, Payroll and Talent.",
    challenge: "Separate modules had different roles, states, approvals and data ownership rules.",
    contribution:
      "Product definition across module boundaries, roles, workflow states and delivery sequence.",
    workflow: ["Discovery", "Roles", "Shared data", "Module workflows", "Phased delivery"],
    outcome: "A clearer system model and an incremental path to delivery.",
    tags: [],
    featured: true,
    display_order: 1,
    image_path: "/evidence/enterprise-operations.webp",
    evidence_type: "Anonymized product screen",
    case_study: {},
    visible: true,
  },
  {
    id: "construction-progress-billing",
    title: "Construction Progress Billing",
    slug: "construction-progress-billing",
    category: "Enterprise Workflow",
    short_description:
      "Contract setup, schedule of values, change orders and monthly pay applications.",
    challenge:
      "Billing rules, retention, stored materials and lien waivers affect the same line item.",
    contribution: "Workflow rules, role access, validation, auditability and release coordination.",
    workflow: ["Contract setup", "SOV", "Change orders", "Monthly billing", "Closeout"],
    outcome: "More explicit billing rules and review points across the contract lifecycle.",
    tags: [],
    featured: true,
    display_order: 2,
    image_path: "/evidence/construction-progress-billing.svg",
    evidence_type: "Reconstructed workflow map",
    case_study: {},
    visible: true,
  },
  {
    id: "school-operations-platform",
    title: "School Operations Platform",
    slug: "school-operations-platform",
    category: "Operations SaaS",
    short_description:
      "Role-aware school operations across administration, teachers, families and support teams.",
    challenge:
      "Many school roles use the same records but need different actions, permissions and handoffs.",
    contribution:
      "Role modelling, modules and user flows for academic, family and day-to-day operations.",
    workflow: ["Administration", "Teaching", "Family updates", "Fees and services", "Support"],
    outcome: "A product structure for school operations across distinct user roles.",
    tags: [],
    featured: true,
    display_order: 3,
    image_path: "/evidence/school-operations.svg",
    evidence_type: "Reconstructed product model",
    case_study: {},
    visible: true,
  },
  {
    id: "provider-workflow-modernization",
    title: "Provider Workflow Modernization",
    slug: "provider-workflow-modernization",
    category: "Healthcare Product Delivery",
    short_description:
      "A current-state map of Provider Web and Patient Mobile workflows for UX, QA and delivery.",
    challenge:
      "Teams needed a reliable baseline for validation and backlog planning without inventing future-state behavior.",
    contribution:
      "Documented current-state flows, validation boundaries, Jira baseline and open questions.",
    workflow: [
      "Provider dashboard",
      "Patients",
      "Search / register / edit",
      "Clinical record",
      "Appointments · messages · tasks · audit",
    ],
    outcome:
      "A versioned baseline for QA mapping, development discussions and Jira backlog creation.",
    tags: [],
    featured: true,
    display_order: 4,
    image_path: "/evidence/provider-current-state.svg",
    evidence_type: "Anonymized current-state map",
    case_study: {},
    visible: true,
  },
];

function useReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((target) => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -28px 0px" },
    );
    const observe = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)").forEach((target) => {
        observer.observe(target);
      });
    };
    observe(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-reveal]:not(.is-visible)")) observer.observe(node);
          observe(node);
        });
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
}

function Portfolio() {
  const { data: settings } = useSiteSettings();
  const { data: about } = useAbout();
  const { data: healthcare } = useHealthcareStudy();
  const { data: resume } = useResume();
  const { data: work } = useSelectedWork();
  const { data: builds } = useIndependentWork();
  const { data: visuals } = useVisualWork();
  useReveal();

  const visibleWork = (work ?? []).filter((item) => item.visible);
  const featured = visibleWork.filter((item) => item.featured).slice(0, 5);
  const projects = featured.length ? featured : FALLBACK_FEATURED;
  const secondaryWork = visibleWork.filter((item) => !item.featured);
  const visibleBuilds = (builds ?? []).filter((item) => item.visible);
  const visibleVisuals = (visuals ?? []).filter((item) => item.visible);
  const imageWork = buildImageWork(visibleVisuals, secondaryWork);

  const savedHeadline = settings?.hero_headline?.trim();
  const headline =
    savedHeadline && savedHeadline.split(/\s+/).length <= 7
      ? savedHeadline
      : "I make complex work buildable.";
  const headlineParts = splitLastWord(headline);
  const email = settings?.contact_email || "odkspav@gmail.com";
  const savedJourney = (about?.transition_copy || "")
    .split("→")
    .map((step) => step.trim())
    .filter(Boolean);
  const journey = savedJourney.length > 1 ? savedJourney : DEFAULT_JOURNEY.split("→");

  return (
    <div className="site-shell" id="top">
      <SiteNav />
      <main>
        <section className="hero page-wrap" aria-labelledby="hero-title">
          <p className="hero-topline">Product management · systems thinking · delivery</p>
          <div className="hero-grid">
            <h1 id="hero-title" className="hero-heading">
              {headlineParts[0]} <em>{headlineParts[1]}</em>
            </h1>
            <div className="hero-side">
              <p className="hero-role">
                O. Dinesh Kumar
                <br />
                Product Manager &amp; Product Builder
              </p>
              <p>
                {settings?.hero_supporting && settings.hero_supporting.split(/\s+/).length <= 18
                  ? settings.hero_supporting
                  : "From discovery to delivery, I make complex work clear enough to build."}
              </p>
              <div className="hero-actions">
                <a className="text-action" href="#work">
                  Explore selected work <span aria-hidden="true">↘</span>
                </a>
                {resume?.file_path ? (
                  <ResumeAction path={resume.file_path} fileName={resume.file_name || "Resume"} />
                ) : null}
              </div>
            </div>
          </div>
          <div className="hero-baseline">
            <span className="availability">Open to product conversations</span>
            <span>
              <strong>{settings?.location || "India · Remote-friendly"}</strong>
            </span>
            <span>Strategy to implementation</span>
          </div>
        </section>

        <section className="content-section page-wrap" id="work">
          <div className="section-head">
            <p className="section-kicker">01 / Selected work</p>
            <div>
              <h2 className="section-title">Complex systems, made buildable.</h2>
            </div>
          </div>
          <div className="work-list">
            {projects.map((item, index) => (
              <ProjectRow key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        <section className="content-section building-section" id="building">
          <div className="page-wrap">
            <div className="section-head building-head">
              <p className="section-kicker">02 / Things I’m building</p>
              <div>
                <h2 className="section-title">Small bets, real questions.</h2>
              </div>
            </div>
            <div className="build-grid">
              {visibleBuilds.map((item, index) => (
                <BuildItem key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="content-section approach-section" id="approach">
          <div className="page-wrap">
            <div className="section-head">
              <p className="section-kicker">03 / How I work</p>
              <div>
                <h2 className="section-title">Make the hard parts visible.</h2>
              </div>
            </div>
            <div className="approach-grid">
              <ApproachStep
                number="01"
                title="Frame the system"
                text="Map actors, states and handoffs before scoping."
              />
              <ApproachStep
                number="02"
                title="Make decisions explicit"
                text="Name dependencies, rules and trade-offs."
              />
              <ApproachStep
                number="03"
                title="Stay through delivery"
                text="Validate behavior and carry feedback forward."
              />
            </div>
          </div>
        </section>

        <section className="content-section about-section page-wrap" id="about">
          <div className="section-head">
            <p className="section-kicker">04 / About &amp; journey</p>
            <div>
              <h2 className="section-title">A systems thinker by training.</h2>
            </div>
          </div>
          <div className="about-grid">
            <p className="about-intro">{about?.intro || DEFAULT_ABOUT}</p>
            <div>
              <div className="journey-line" aria-label="Career journey">
                {journey.map((step, index) => (
                  <span key={step}>
                    <b>{step}</b>
                    {index < journey.length - 1 ? <i aria-hidden="true">→</i> : null}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="content-section support-section" id="visual-work">
          <div className="page-wrap">
            <div className="section-head">
              <p className="section-kicker">05 / Supporting visual work</p>
              <div>
                <h2 className="section-title">More products, different constraints.</h2>
              </div>
            </div>
            {imageWork.length ? (
              <div className="support-grid">
                {imageWork.map((item) => (
                  <SupportTile key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="support-copy">
                Additional screens and brand explorations are being organized.
              </p>
            )}
            {secondaryWork.length ? (
              <div className="more-work">
                <div className="more-work-title">
                  <h3>Other product work</h3>
                  <span>
                    {secondaryWork.length + (healthcare?.visible ? 1 : 0)} projects · all details
                    preserved
                  </span>
                </div>
                <div className="more-work-list">
                  {secondaryWork.map((item, index) => (
                    <MoreWorkRow key={item.id} item={item} index={index + 1} />
                  ))}
                  {healthcare?.visible ? (
                    <HealthcareLink item={healthcare} index={secondaryWork.length + 1} />
                  ) : null}
                </div>
              </div>
            ) : null}
            {visibleVisuals.filter((item) => !item.image_path).length ? (
              <p className="brand-credits">
                <strong>Brand &amp; spatial work</strong>
                {visibleVisuals
                  .filter((item) => !item.image_path)
                  .map((item) => item.title)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="page-wrap contact-grid">
            <div>
              <p className="section-kicker">06 / Contact</p>
              <h2 className="contact-title">
                Working through a <em>hard problem?</em>
              </h2>
              <a className="contact-email" href={"mailto:" + email}>
                {email} <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className="contact-note">
              Product roles where clear thinking and steady delivery matter.
            </p>
          </div>
        </section>
      </main>
      <footer className="site-footer page-wrap">
        <span>© {new Date().getFullYear()} O. Dinesh Kumar</span>
        <span>Product work · systems · delivery</span>
        {settings?.linkedin_url ? (
          <a href={settings.linkedin_url} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
        ) : null}
        {settings?.github_url ? (
          <a href={settings.github_url} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        ) : null}
        <Link to="/admin">Admin</Link>
      </footer>
    </div>
  );
}

function SiteNav() {
  return (
    <header className="site-nav">
      <div className="nav-inner">
        <a href="#top" className="brand-mark" aria-label="O. Dinesh Kumar, home">
          <span className="brand-symbol" aria-hidden="true">
            OD
          </span>
          <span className="brand-name">
            <strong>Dinesh Kumar</strong>
            <span>Product / delivery</span>
          </span>
        </a>
        <nav className="site-nav-links" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#building">Building</a>
          <a href="#about">About</a>
          <a href="#visual-work">Visuals</a>
        </nav>
        <a href="#contact" className="nav-contact">
          Let’s talk ↗
        </a>
      </div>
    </header>
  );
}

function ProjectRow({ item, index }: { item: SelectedWork; index: number }) {
  const details = mergeCaseStudy(item.slug, item.case_study);
  const caption = details.evidence_caption || item.evidence_type || "Project evidence";
  const role = item.contribution || "Product definition and delivery";
  return (
    <article
      className={"work-row " + (index % 2 ? "work-row--reverse" : "") + " reveal"}
      data-reveal
    >
      <div className="work-copy">
        <div className="work-meta">
          <span className="work-order">{String(index + 1).padStart(2, "0")}</span>
          <span className="work-category">{item.category}</span>
        </div>
        <h3 className="work-title">{item.title}</h3>
        <p className="work-description">{item.short_description}</p>
        <div className="work-role">
          <span>My role</span>
          <span>{role}</span>
        </div>
        <Link className="work-open" to="/work/$slug" params={{ slug: item.slug }}>
          Read the case{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>
      <ProjectImage
        path={item.image_path}
        fallbackPath={getEvidenceFallbackPath(item.slug)}
        title={item.title}
        caption={caption}
        index={index}
      />
    </article>
  );
}

function ProjectImage({
  path,
  fallbackPath,
  title,
  caption,
  index,
}: {
  path: string | null;
  fallbackPath: string | null;
  title: string;
  caption: string;
  index: number;
}) {
  const url = useMediaUrl(path);
  const fallbackUrl = useMediaUrl(path ? fallbackPath : null);
  const imageUrl = url || fallbackUrl;
  const fitClass = (path || fallbackPath)?.endsWith("enterprise-operations.webp")
    ? " work-visual--contain"
    : "";
  return (
    <div className={"work-visual" + fitClass} aria-label={"Evidence for " + title}>
      {imageUrl ? (
        <img src={imageUrl} alt={title + ": " + caption} loading={index === 0 ? "eager" : "lazy"} />
      ) : null}
      <span className="work-visual-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="work-visual-caption">{caption}</span>
    </div>
  );
}

function BuildItem({ item, index }: { item: IndependentWork; index: number }) {
  const link = item.live_url || item.repo_url;
  const inner = (
    <>
      <div className="build-topline">
        <span>{String(index + 1).padStart(2, "0")} / Independent</span>
        <span className="build-status">{item.status}</span>
      </div>
      <h3 className="build-title">{item.title}</h3>
      <p className="build-description">{item.description}</p>
      {item.capabilities?.length ? (
        <p className="build-capabilities">{item.capabilities.join(" · ")}</p>
      ) : null}
      {link ? <span className="build-link">Open project ↗</span> : null}
    </>
  );
  return link ? (
    <a className="build-item" href={link} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <article className="build-item">{inner}</article>
  );
}

function ApproachStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="approach-step reveal" data-reveal>
      <span className="approach-number">{number}</span>
      <h3 className="approach-title">{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function SupportTile({ item }: { item: VisualWork | SelectedWork }) {
  const fallbackPath = "slug" in item ? getEvidenceFallbackPath(item.slug) : null;
  const path = item.image_path || fallbackPath;
  const url = useMediaUrl(item.image_path);
  const fallbackUrl = useMediaUrl(item.image_path ? fallbackPath : path);
  const imageUrl = url || fallbackUrl;
  const category = "category" in item ? item.category : "Product work";
  const panorama = path?.endsWith("service-discovery.webp");
  return (
    <article
      className={"support-item reveal" + (panorama ? " support-item--panorama" : "")}
      data-reveal
    >
      <div className="support-image">
        {imageUrl ? (
          <img src={imageUrl} alt={item.title + " — " + category} loading="lazy" />
        ) : null}
      </div>
      <div className="support-caption">
        <strong>{item.title}</strong>
        <span>{category}</span>
      </div>
    </article>
  );
}

function MoreWorkRow({ item, index }: { item: SelectedWork; index: number }) {
  return (
    <Link className="more-work-row" to="/work/$slug" params={{ slug: item.slug }}>
      <span className="num">{String(index).padStart(2, "0")}</span>
      <span>
        <strong>{item.title}</strong>
        <small>{item.short_description}</small>
      </span>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}

function HealthcareLink({ item, index }: { item: HealthcareStudy; index: number }) {
  return (
    <Link className="more-work-row" to="/healthcare-study">
      <span className="num">{String(index).padStart(2, "0")}</span>
      <span>
        <strong>{item.title}</strong>
        <small>{item.summary}</small>
      </span>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}

function ResumeAction({ path, fileName }: { path: string; fileName: string }) {
  const url = useMediaUrl(path);
  return url ? (
    <a
      className="text-action"
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={"Open " + fileName}
    >
      Résumé <span aria-hidden="true">↗</span>
    </a>
  ) : null;
}

function buildImageWork(
  visuals: VisualWork[],
  projects: SelectedWork[],
): Array<VisualWork | SelectedWork> {
  return [
    ...visuals.filter((item) => item.image_path),
    ...projects.filter((item) => item.image_path || getEvidenceFallbackPath(item.slug)),
  ].slice(0, 6);
}

function splitLastWord(value: string): [string, string] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return [value, ""];
  const last = words.pop() || "";
  return [words.join(" "), last];
}
