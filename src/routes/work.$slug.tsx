import { createFileRoute, Link } from "@tanstack/react-router";
import {
  type SelectedWork,
  getEvidenceFallbackPath,
  mergeCaseStudy,
  useSelectedWork,
  useMediaUrl,
} from "@/lib/portfolio";

export const Route = createFileRoute("/work/$slug")({
  head: () => ({
    meta: [
      { title: "Selected work — O. Dinesh Kumar" },
      { name: "description", content: "Product decisions, workflows, evidence and learning." },
    ],
  }),
  component: CaseStudyPage,
});

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const { data: work = [], isLoading, isFetching, isError } = useSelectedWork();
  const item = work.find((project) => project.slug === slug && project.visible);

  if (isLoading || (!isError && isFetching && work.length === 0)) {
    return <main className="case-page page-wrap case-loading">Loading the case study…</main>;
  }

  if (isError || !item) {
    return (
      <main className="case-page page-wrap case-missing">
        <Link className="case-back" to="/">
          ← Portfolio
        </Link>
        <p className="section-kicker">Project unavailable</p>
        <h1>That work isn’t public.</h1>
        <p>The project may have been moved into the private archive.</p>
        <Link className="text-action" to="/">
          Return to selected work ↗
        </Link>
      </main>
    );
  }

  return <CaseStudy item={item} />;
}

function CaseStudy({ item }: { item: SelectedWork }) {
  const details = mergeCaseStudy(item.slug, item.case_study);
  const mediaUrl = useMediaUrl(item.image_path || getEvidenceFallbackPath(item.slug));
  const fallbackMediaUrl = useMediaUrl(item.image_path ? getEvidenceFallbackPath(item.slug) : null);
  const evidenceUrl = mediaUrl || fallbackMediaUrl;
  const decisions = details.decisions ?? [];
  const productWorkflow = details.product_workflow?.length
    ? details.product_workflow
    : item.workflow;
  const stage = details.stage || "Product definition";

  return (
    <main className="case-page">
      <div className="page-wrap">
        <div className="case-topline">
          <Link className="case-back" to="/">
            ← Portfolio
          </Link>
          <span className="case-page-number">Selected work / {item.category}</span>
        </div>
        <header className="case-hero">
          <p className="section-kicker">Product case study</p>
          <h1 className="case-title">{item.title}</h1>
          <p className="case-deck">{item.short_description}</p>
          <div className="case-summary-strip">
            <Summary
              label="My role"
              value={item.contribution || "Product definition and delivery"}
            />
            <Summary label="Stage" value={stage} />
            <Summary label="Evidence" value={item.evidence_type || "Project evidence"} />
          </div>
        </header>

        <div className="case-body">
          <CaseSection number="01" label="Problem" title="What needed to change">
            <p>{item.challenge}</p>
          </CaseSection>

          <CaseSection number="02" label="Context" title="The system around the work">
            <p>{details.context || item.short_description}</p>
          </CaseSection>

          <CaseSection number="03" label="What I owned" title="From ambiguity to a buildable plan">
            <p>{item.contribution}</p>
          </CaseSection>

          <CaseSection
            number="04"
            label="Important decisions"
            title="Decisions that shaped the product"
          >
            {decisions.length ? (
              <ol className="case-decisions">
                {decisions.map((decision, index) => (
                  <li key={decision}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{decision}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p>Decision detail is available in the project record and supporting artifacts.</p>
            )}
          </CaseSection>

          <CaseSection number="05" label="Product / workflow" title="The path through the product">
            {productWorkflow.length ? (
              <div className="workflow-rail">
                {productWorkflow.map((step, index) => (
                  <div className="workflow-step" key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p>Workflow detail has not been added to this project record.</p>
            )}
          </CaseSection>

          <CaseSection number="06" label="Evidence" title="A working artifact">
            {details.evidence_caption ? <p>{details.evidence_caption}</p> : null}
            {details.evidence_items?.length ? <List items={details.evidence_items} /> : null}
            {evidenceUrl ? (
              <figure className="case-evidence">
                <img
                  src={evidenceUrl}
                  alt={
                    item.title +
                    (details.evidence_caption ? ": " + details.evidence_caption : " evidence")
                  }
                />
                <figcaption>
                  {details.evidence_caption || item.evidence_type || "Project evidence"}
                </figcaption>
              </figure>
            ) : (
              <div className="evidence-note">
                <span className="mono-label">Evidence note</span>
                <p>
                  No public image is attached to this work. The project record and workflow notes
                  remain available here.
                </p>
              </div>
            )}
          </CaseSection>

          <CaseSection number="07" label="What shipped" title="What reached the team">
            {details.shipped?.length ? (
              <List items={details.shipped} />
            ) : (
              <p>
                The available project record describes the product work, but does not specify a
                public release state.
              </p>
            )}
          </CaseSection>

          <CaseSection number="08" label="Outcome" title="What the work made possible">
            <p>{item.outcome}</p>
          </CaseSection>

          <CaseSection number="09" label="Learning" title="What I carry forward">
            <p className="case-learning">
              {details.learning ||
                "Make the hidden rules visible early. It gives the team a stronger basis for scope, sequence and delivery."}
            </p>
          </CaseSection>
        </div>

        <div className="page-wrap case-next">
          <Link to="/" hash="work">
            Back to selected work <span aria-hidden="true">↗</span>
          </Link>
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="case-summary">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CaseSection({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="case-section">
      <div className="case-section-grid">
        <p className="case-section-label">
          {number} / {label}
        </p>
        <div className="case-section-content">
          <h2>{title}</h2>
          {children}
        </div>
      </div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="case-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
