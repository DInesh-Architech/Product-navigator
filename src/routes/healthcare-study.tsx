import { createFileRoute, Link } from "@tanstack/react-router";
import { useHealthcareStudy, useMediaUrl } from "@/lib/portfolio";

export const Route = createFileRoute("/healthcare-study")({
  head: () => ({ meta: [{ title: "Healthcare product study — O. Dinesh Kumar" }] }),
  component: HealthcareStudyPage,
});

function HealthcareStudyPage() {
  const { data: study, isLoading } = useHealthcareStudy();
  const imageUrl = useMediaUrl(study?.image_path);
  if (isLoading)
    return <main className="case-page page-wrap case-loading">Loading the study…</main>;
  if (!study?.visible) {
    return (
      <main className="case-page page-wrap case-missing">
        <Link className="case-back" to="/">
          ← Portfolio
        </Link>
        <h1>This study isn’t public.</h1>
      </main>
    );
  }
  return (
    <main className="case-page">
      <div className="page-wrap">
        <div className="case-topline">
          <Link className="case-back" to="/">
            ← Portfolio
          </Link>
          <span className="case-page-number">Research note / Healthcare</span>
        </div>
        <header className="study-hero">
          <p className="section-kicker">Healthcare product study</p>
          <h1 className="case-title">{study.title}</h1>
          <p className="case-deck">{study.summary}</p>
        </header>
        <div className="case-body">
          <section className="case-section">
            <div className="case-section-grid">
              <p className="case-section-label">01 / Context</p>
              <div className="case-section-content">
                <h2>Correctness shapes the interaction.</h2>
                <p>
                  The study looks at clinical and operational workflows where a quick interaction is
                  only useful when the resulting state stays safe, explainable and attributable.
                </p>
              </div>
            </div>
          </section>
          <section className="case-section">
            <div className="case-section-grid">
              <p className="case-section-label">02 / Product principles</p>
              <div className="case-section-content">
                <h2>Constraints that should be visible.</h2>
                <ul className="study-list">
                  {study.bullets.map((bullet, index) => (
                    <li key={bullet}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <p>{bullet}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          <section className="case-section">
            <div className="case-section-grid">
              <p className="case-section-label">03 / Evidence</p>
              <div className="case-section-content">
                <h2>Workflows with an audit trail.</h2>
                <p>
                  Evidence provenance, authorship and state transitions stay connected to the
                  interaction so that clinical and administrative teams can review what happened.
                </p>
                {imageUrl ? (
                  <figure className="case-evidence">
                    <img src={imageUrl} alt={study.title + " evidence"} />
                    <figcaption>Supporting artifact attached in the admin panel.</figcaption>
                  </figure>
                ) : null}
              </div>
            </div>
          </section>
          <section className="case-section">
            <div className="case-section-grid">
              <p className="case-section-label">04 / Related project</p>
              <div className="case-section-content">
                <h2>See the current-state workflow.</h2>
                <p>
                  Provider Web and Patient Mobile flows document confirmed behavior and mark partial
                  areas for validation.
                </p>
                <Link
                  className="work-open"
                  to="/work/$slug"
                  params={{ slug: "provider-workflow-modernization" }}
                >
                  Provider workflow case study <span className="arrow">↗</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
        <div className="page-wrap case-next">
          <Link to="/" hash="visual-work">
            Back to portfolio <span>↗</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
