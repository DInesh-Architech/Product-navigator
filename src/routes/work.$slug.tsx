import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EvidenceViewer, ProjectScene, WorkflowExplorer } from "@/components/site/ProjectScene";
import {
  type SelectedWork,
  getEvidenceFallbackPath,
  getProjectPresentation,
  mergeCaseStudy,
  useSelectedWork,
  useMediaUrl,
} from "@/lib/portfolio";

export const Route = createFileRoute("/work/$slug")({
  head: () => ({
    meta: [
      { title: "Inside the work — O. Dinesh Kumar" },
      {
        name: "description",
        content: "The context, systems, decisions and evidence behind the product.",
      },
    ],
  }),
  component: CaseStudyPage,
});

const ALIASES: Record<string, string> = {
  "enterprise-operations-suite": "enterprise-workforce-platform",
  "construction-progress-billing": "construction-billing-sov",
  "provider-workflow-modernization": "healthcare-platform-enhancement",
  "school-operations-platform": "school-management-saas",
  "local-service-discovery": "service-marketplace-booking",
};

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const { data: work = [], isLoading, isFetching, isError, refetch } = useSelectedWork();
  const publicWork = work.filter((item) => item.visible);
  const item = publicWork.find(
    (project) => project.slug === slug || project.slug === ALIASES[slug],
  );
  if (isLoading || (!isError && isFetching && work.length === 0))
    return (
      <main className="exhibit-site case-state folio-wrap" aria-live="polite">
        <Link to="/">← Portfolio</Link>
        <p>Opening the project…</p>
      </main>
    );
  if (isError || !item)
    return (
      <main className="exhibit-site case-state folio-wrap">
        <Link to="/">← Portfolio</Link>
        <p className="folio-label">{isError ? "Connection interrupted" : "Project unavailable"}</p>
        <h1>{isError ? "The archive couldn’t load." : "That work isn’t public."}</h1>
        <p>
          {isError
            ? "Try loading the project again."
            : "It may have moved into the private archive."}
        </p>
        {isError ? (
          <button className="folio-link" onClick={() => void refetch()}>
            Try again ↗
          </button>
        ) : (
          <Link to="/" hash="work">
            Return to selected work ↗
          </Link>
        )}
      </main>
    );
  const next = publicWork[(publicWork.indexOf(item) + 1) % publicWork.length];
  return <CaseStudy item={item} next={next?.id === item.id ? undefined : next} key={item.id} />;
}

function CaseStudy({ item, next }: { item: SelectedWork; next: SelectedWork | undefined }) {
  const details = mergeCaseStudy(item.slug, item.case_study);
  const presentation = getProjectPresentation(item);
  const steps = details.product_workflow?.length ? details.product_workflow : item.workflow;
  const mainPath = item.image_path || getEvidenceFallbackPath(item.slug);
  const gallery = [
    ...(mainPath
      ? [
          {
            image_path: mainPath,
            caption: details.evidence_caption || item.evidence_type || "Project artifact",
          },
        ]
      : []),
    ...(details.gallery || []).filter((image) => image.image_path?.trim()),
  ];
  const [section, setSection] = useState("overview");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setSection(entry.target.id);
        });
      },
      { rootMargin: "-18% 0px -55% 0px" },
    );
    document
      .querySelectorAll("[data-case-section]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`exhibit-site project-case case-world-${presentation}`} id="top">
      <a className="skip-link" href="#overview">
        Skip to case study
      </a>
      <header className="case-header folio-wrap">
        <Link to="/" hash="work" className="folio-link">
          ← All work
        </Link>
        <span className="folio-label">Dinesh Kumar / Product practice</span>
        <a href="/#contact" className="folio-link">
          Let’s talk ↗
        </a>
      </header>
      <main>
        <section className="case-masthead folio-wrap">
          <p className="folio-label">{item.category} / Product case study</p>
          <h1>{item.title}</h1>
          <div className="case-masthead-bottom">
            <p>{item.short_description}</p>
            <div>
              <span className="folio-label">
                {details.role_label || "Product definition & delivery"}
              </span>
              {details.timeline ? <span className="folio-label">{details.timeline}</span> : null}
              <a href="#overview" className="folio-link">
                Inside the work ↓
              </a>
            </div>
          </div>
          <ProjectScene item={item} />
        </section>
        <nav className="case-contents" aria-label="Case study contents">
          <div className="folio-wrap">
            <span className="folio-label">Inside the work</span>
            {[
              ["overview", "01 / Context"],
              ["system", "02 / System"],
              ["decisions", "03 / Decisions"],
              ["outcome", "04 / Outcome"],
            ].map(([id, label]) => (
              <a href={`#${id}`} aria-current={section === id ? "location" : undefined} key={id}>
                {label}
              </a>
            ))}
          </div>
        </nav>

        <section
          className="case-overview folio-wrap case-chapter"
          id="overview"
          data-case-section
          tabIndex={-1}
        >
          <div className="case-chapter-title">
            <p className="folio-label">01 / Context & complexity</p>
            <h2>
              {presentation === "workspace"
                ? "The hard part lives between modules."
                : presentation === "flow"
                  ? "Every amount has a history."
                  : presentation === "map"
                    ? "First, understand what’s there."
                    : "Start with the real constraint."}
            </h2>
          </div>
          <div className="case-context-body">
            <div>
              <h3 className="folio-label">The problem</h3>
              <p className="case-problem">{item.challenge}</p>
            </div>
            <div>
              <h3 className="folio-label">The context</h3>
              <p>{details.context || item.short_description}</p>
            </div>
            <div className="case-ownership">
              <h3 className="folio-label">What I owned</h3>
              <p>{item.contribution}</p>
            </div>
          </div>
        </section>

        <section className="case-system" id="system" data-case-section>
          <div className="folio-wrap">
            <div className="case-system-heading">
              <p className="folio-label">
                02 / {presentation === "workspace" ? "Delivery system" : "Product workflow"}
              </p>
              <h2>
                {presentation === "workspace"
                  ? "From shared rules to release readiness."
                  : "Follow the work."}
              </h2>
              <p>Explore the sequence.</p>
            </div>
            <WorkflowExplorer steps={steps} />
          </div>
        </section>

        <section
          className="case-chapter case-decision-section folio-wrap"
          id="decisions"
          data-case-section
        >
          <div className="case-chapter-title">
            <p className="folio-label">03 / Important decisions</p>
            <h2>
              The choices
              <br />
              behind the work.
            </h2>
          </div>
          <div className="decision-records">
            {details.decisions?.length ? (
              details.decisions.map((decision, index) => (
                <article key={decision}>
                  <span className="folio-label">{String(index + 1).padStart(2, "0")}</span>
                  <p>{decision}</p>
                </article>
              ))
            ) : (
              <p>{item.contribution}</p>
            )}
          </div>
        </section>

        <section className="case-source folio-wrap" id="evidence">
          <div className="case-source-heading">
            <p className="folio-label">Evidence / Working material</p>
            <h2>Look closer.</h2>
            <span className="folio-label">
              {String(gallery.length).padStart(2, "0")} public{" "}
              {gallery.length === 1 ? "artifact" : "artifacts"}
            </span>
          </div>
          {gallery.length ? (
            <div className="source-gallery">
              {gallery.map((asset, index) => (
                <SourceArtifact
                  key={`${asset.image_path}-${index}`}
                  path={asset.image_path}
                  title={item.title}
                  caption={asset.caption}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="source-empty">
              The public record contains workflow and delivery notes. No public screen is attached.
            </p>
          )}
          {details.evidence_items?.length ? (
            <details className="evidence-inventory">
              <summary>
                Artifact notes <span aria-hidden="true">+</span>
              </summary>
              <ul>
                {details.evidence_items.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>

        <section className="case-outcome" id="outcome" data-case-section>
          <div className="folio-wrap">
            <p className="folio-label">04 / Delivery & outcome</p>
            <div className="outcome-grid">
              <div>
                <h2>
                  What moved
                  <br />
                  forward.
                </h2>
                {details.stage ? <p className="delivery-stage">{details.stage}</p> : null}
              </div>
              <div>
                <h3 className="folio-label">What shipped / advanced</h3>
                {details.shipped?.length ? (
                  <ul>
                    {details.shipped.map((deliverable) => (
                      <li key={deliverable}>{deliverable}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    The available record describes the product work without a public release state.
                  </p>
                )}
                <h3 className="folio-label">Outcome</h3>
                <p className="outcome-statement">{item.outcome}</p>
              </div>
            </div>
            {details.learning ? (
              <div className="learning-note">
                <span className="folio-label">What I carry forward</span>
                <p>{details.learning}</p>
              </div>
            ) : null}
            {details.live_url ? (
              <a className="folio-link" href={details.live_url} target="_blank" rel="noreferrer">
                Open the product ↗
              </a>
            ) : null}
          </div>
        </section>
        <section className="case-next-project folio-wrap">
          {next ? (
            <>
              <span className="folio-label">Continue exploring / {next.category}</span>
              <Link to="/work/$slug" params={{ slug: next.slug }}>
                <h2>{next.title}</h2>
                <span aria-hidden="true">↗</span>
              </Link>
            </>
          ) : (
            <Link to="/" hash="work" className="folio-link">
              Return to the work ↗
            </Link>
          )}
        </section>
      </main>
      <footer className="folio-footer folio-wrap">
        <Link to="/">O. Dinesh Kumar</Link>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}

function SourceArtifact({
  path,
  title,
  caption,
  index,
}: {
  path: string;
  title: string;
  caption: string;
  index: number;
}) {
  const url = useMediaUrl(path);
  return (
    <figure className="source-artifact">
      {url ? (
        <>
          <div className="source-image">
            <img src={url} alt={caption || `${title} evidence`} loading="lazy" />
            <EvidenceViewer url={url} title={title} caption={caption} label="Inspect artifact ↗" />
          </div>
          <figcaption>
            <span className="folio-label">{String(index + 1).padStart(2, "0")}</span>
            <p>{caption}</p>
          </figcaption>
        </>
      ) : (
        <p>Loading this artifact…</p>
      )}
    </figure>
  );
}
