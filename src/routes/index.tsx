import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProjectScene, EvidenceViewer } from "@/components/site/ProjectScene";
import {
  type IndependentWork,
  type SelectedWork,
  type VisualWork,
  getEvidenceFallbackPath,
  getBuildEvidence,
  getProjectPresentation,
  useAbout,
  useHealthcareStudy,
  useIndependentWork,
  useResume,
  useSelectedWork,
  useSiteSettings,
  useVisualWork,
  useMediaUrl,
} from "@/lib/portfolio";

const TITLE = "O. Dinesh Kumar — Product Manager × Product Builder";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "A product practice across enterprise systems, healthcare, construction and independent AI products. Explore the interfaces, workflows and decisions.",
      },
      { property: "og:title", content: TITLE },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { data: settings } = useSiteSettings();
  const { data: about } = useAbout();
  const { data: healthcare } = useHealthcareStudy();
  const { data: resume } = useResume();
  const workQuery = useSelectedWork();
  const { data: builds = [] } = useIndependentWork();
  const { data: visuals = [] } = useVisualWork();
  const visibleWork = (workQuery.data ?? []).filter((item) => item.visible);
  const projects = visibleWork.filter((item) => item.featured).slice(0, 5);
  const secondary = visibleWork.filter(
    (item) => !projects.some((project) => project.id === item.id),
  );
  const visibleVisuals = visuals.filter((item) => item.visible);
  const imageWork = [
    ...visibleVisuals.filter((item) => item.image_path),
    ...secondary.filter((item) => item.image_path || getEvidenceFallbackPath(item.slug)),
  ].slice(0, 6);
  const email = settings?.contact_email || "odkspav@gmail.com";
  const journey = about?.transition_copy?.includes("→")
    ? about.transition_copy
        .split("→")
        .map((s) => s.trim())
        .filter(Boolean)
    : ["Architecture", "Systems thinking", "Digital products", "Product delivery"];
  if (!journey.some((step) => /AI|building/i.test(step))) journey.push("AI product building");
  const savedHeadline = settings?.hero_headline?.trim();
  const headline =
    !savedHeadline || savedHeadline === "I turn ambiguous business needs into buildable products."
      ? "Complexity, made buildable."
      : savedHeadline;
  const words = headline.split(/\s+/);
  const lastWord = words.length > 2 ? words.pop() : "";

  return (
    <div className="exhibit-site" id="top">
      <a className="skip-link" href="#work">
        Skip to the work
      </a>
      <header className="exhibit-nav">
        <div className="folio-wrap exhibit-nav-inner">
          <a href="#top" className="exhibit-brand" aria-label="O. Dinesh Kumar, home">
            <span aria-hidden="true">d.</span>
            <strong>Dinesh Kumar</strong>
          </a>
          <nav aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#building">Lab</a>
            <a href="#about">About</a>
          </nav>
          <a href="#contact" className="nav-talk">
            Let’s talk <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      <main>
        <section className="folio-hero folio-wrap" aria-labelledby="hero-title">
          <div className="hero-ident">
            <p className="folio-label">Product Manager × Product Builder</p>
            <span className="folio-label hero-location">
              {settings?.location || "India"} / Open to conversations
            </span>
          </div>
          <div className="hero-type-row">
            <h1
              id="hero-title"
              className={headline.length > 80 ? "hero-type hero-type--long" : "hero-type"}
            >
              {words.join(" ")} {lastWord ? <em>{lastWord}</em> : null}
            </h1>
            <div className="hero-margin">
              <span className="hero-asterisk" aria-hidden="true">
                ✳
              </span>
              <p>
                Systems thinker.
                <br />
                Hands-on builder.
              </p>
              <a href="#work" aria-label="Explore selected work">
                Explore the work <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        <section id="work" className="folio-wrap exhibition" aria-labelledby="work-heading">
          <div className="exhibition-heading">
            <h2 id="work-heading" className="folio-label">
              01 / Selected work
            </h2>
            <span className="folio-label">Interfaces. Workflows. Decisions.</span>
          </div>
          {projects.length ? (
            <ProjectExhibition projects={projects} />
          ) : workQuery.isFetching ? (
            <div className="exhibition-loading" aria-live="polite">
              <span className="folio-label">Opening the project archive…</span>
              <div className="loading-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : (
            <div className="exhibition-loading">
              <p>
                {workQuery.isError
                  ? "The project archive couldn’t load."
                  : "Selected projects are being curated."}
              </p>
              {workQuery.isError ? (
                <button className="folio-link" onClick={() => void workQuery.refetch()}>
                  Try again ↗
                </button>
              ) : null}
            </div>
          )}
        </section>

        <section className="lab-section" id="building" aria-labelledby="lab-heading">
          <div className="folio-wrap">
            <div className="lab-heading">
              <p className="folio-label">02 / Things I’m building</p>
              <h2 id="lab-heading">
                In the
                <br />
                <em>making.</em>
              </h2>
              <p>
                Independent ideas.
                <br />
                Working prototypes.
                <br />
                Questions worth exploring.
              </p>
            </div>
            <div className="lab-grid">
              {builds
                .filter((item) => item.visible)
                .map((item, index) => (
                  <LabProject key={item.id} item={item} index={index} />
                ))}
            </div>
          </div>
        </section>

        <section
          className="practice-section folio-wrap"
          id="approach"
          aria-labelledby="practice-heading"
        >
          <h2 id="practice-heading" className="folio-label">
            03 / How I work
          </h2>
          <ol className="practice-line">
            <li>
              <span>01</span>
              <strong>Frame the system.</strong>
              <p>Actors, states, constraints.</p>
            </li>
            <li>
              <span>02</span>
              <strong>Make the call.</strong>
              <p>Rules, dependencies, trade-offs.</p>
            </li>
            <li>
              <span>03</span>
              <strong>Stay through delivery.</strong>
              <p>Handoffs, validation, feedback.</p>
            </li>
          </ol>
        </section>

        <section className="journey-section" id="about" aria-labelledby="about-heading">
          <div className="folio-wrap">
            <div className="journey-heading">
              <p className="folio-label">04 / About & journey</p>
              <h2 id="about-heading">
                Different materials.
                <br />
                <em>The same systems mind.</em>
              </h2>
            </div>
            <div
              className="journey-track"
              style={{ "--journey-count": journey.length } as React.CSSProperties}
              aria-label="Professional evolution"
            >
              {journey.map((step, index) => (
                <div
                  className="journey-stop"
                  style={{ "--step": index } as React.CSSProperties}
                  key={step}
                >
                  <span className="journey-node" aria-hidden="true" />
                  <span className="folio-label">
                    {index === journey.length - 1 ? "Now" : String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
            <div className="journey-bottom">
              <p>
                {about?.intro ||
                  "I work between business intent, user workflows, design and engineering. My focus is making the rules, decisions and handoffs clear enough to build."}
              </p>
              <div>
                {resume?.file_path ? <ResumeLink path={resume.file_path} /> : null}
                {settings?.linkedin_url ? (
                  <a
                    className="folio-link"
                    href={settings.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Connect on LinkedIn ↗
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section
          className="archive-section folio-wrap"
          id="visual-work"
          aria-labelledby="archive-heading"
        >
          <div className="archive-heading">
            <p className="folio-label">05 / Further explorations</p>
            <h2 id="archive-heading">
              A wider field
              <br />
              of view.
            </h2>
          </div>
          <div className="visual-wall">
            {imageWork.map((item) => (
              <VisualArtifact item={item} key={item.id} />
            ))}
          </div>
          {secondary.length || healthcare?.visible ? (
            <details className="archive-drawer">
              <summary>
                <span>Open the project archive</span>
                <span className="folio-label">
                  {String(secondary.length + (healthcare?.visible ? 1 : 0)).padStart(2, "0")}{" "}
                  records <b aria-hidden="true">+</b>
                </span>
              </summary>
              <div className="archive-list">
                {secondary.map((item) => (
                  <Link to="/work/$slug" params={{ slug: item.slug }} key={item.id}>
                    <strong>{item.title}</strong>
                    <span>{item.category}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
                {healthcare?.visible ? (
                  <Link to="/healthcare-study">
                    <strong>{healthcare.title}</strong>
                    <span>Research note</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                ) : null}
              </div>
            </details>
          ) : null}
          {visibleVisuals.some((item) => !item.image_path) ? (
            <div className="other-visuals">
              <span className="folio-label">Brand & spatial work</span>
              {visibleVisuals
                .filter((item) => !item.image_path)
                .map((item) =>
                  item.url ? (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer">
                      {item.title} ↗
                    </a>
                  ) : (
                    <span key={item.id}>{item.title}</span>
                  ),
                )}
            </div>
          ) : null}
        </section>

        <section className="folio-contact" id="contact">
          <div className="folio-wrap">
            <div className="contact-top">
              <p className="folio-label">06 / The next conversation</p>
              <span className="folio-label">Product roles & collaborations</span>
            </div>
            <h2>
              What’s next<span>?</span>
              <a href={`mailto:${email}`} aria-label={`Email ${email}`}>
                ↗
              </a>
            </h2>
            <div className="contact-bottom">
              <a href={`mailto:${email}`}>{email}</a>
              <p>
                Let’s turn a complex problem
                <br />
                into something people can use.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="folio-footer folio-wrap">
        <span>© {new Date().getFullYear()} O. Dinesh Kumar</span>
        <span>Always a work in progress.</span>
        <div>
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
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}

function ProjectExhibition({ projects }: { projects: SelectedWork[] }) {
  const [selected, setSelected] = useState<string>(projects[0]?.id || "");
  const active = projects.find((item) => item.id === selected) || projects[0];
  if (!active) return null;
  return (
    <div className={`project-exhibition exhibition-${getProjectPresentation(active)}`}>
      <div className="project-index" aria-label="Choose a project to preview">
        {projects.map((item, index) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={item.id === active.id}
            aria-controls="project-preview"
            onClick={() => setSelected(item.id)}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setSelected(item.id);
            }}
            onFocus={() => setSelected(item.id)}
          >
            <span className="index-number">{String(index + 1).padStart(2, "0")}</span>
            <span>
              <small>{item.category}</small>
              <strong>{item.case_study?.cover_title || item.title}</strong>
            </span>
            <span className="index-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
        <p className="index-note">
          Choose a project.
          <br />
          Look under the surface.
        </p>
      </div>
      <div className="project-preview" id="project-preview">
        <ProjectScene key={active.id} item={active} compact />
        <div className="project-preview-bottom">
          <p>{active.case_study?.cover_summary || active.short_description}</p>
          <Link
            to="/work/$slug"
            params={{ slug: active.slug }}
            className="case-entry"
            aria-label={`Explore ${active.title}`}
          >
            Explore the case <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LabProject({ item, index }: { item: IndependentWork; index: number }) {
  const evidence = getBuildEvidence(item);
  const image = useMediaUrl(evidence.path);
  const link = item.live_url || item.repo_url;
  return (
    <article
      className={`lab-project ${evidence.path ? "lab-project--visual" : "lab-project--concept"}`}
    >
      <div className="lab-project-meta">
        <span className="folio-label">Experiment {String(index + 1).padStart(2, "0")}</span>
        <span className="folio-label">{item.status}</span>
      </div>
      <div className="lab-project-title">
        <h3>{item.title}</h3>
        {link ? (
          <a href={link} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`}>
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="concept-mark" aria-hidden="true">
            ↳
          </span>
        )}
      </div>
      {image ? (
        <figure className="lab-image">
          <a
            href={link || image}
            target="_blank"
            rel="noreferrer"
            aria-label={`View ${item.title}`}
          >
            <img
              src={image}
              alt={`${item.title} — actual prototype interface`}
              loading="lazy"
              width="1363"
              height="936"
            />
          </a>
          <figcaption>{evidence.caption}</figcaption>
        </figure>
      ) : null}
      {image ? (
        <details className="lab-details">
          <summary>
            Inside the experiment <span aria-hidden="true">+</span>
          </summary>
          <p>{item.description}</p>
          {item.capabilities?.length ? (
            <p className="lab-capabilities">{item.capabilities.join(" / ")}</p>
          ) : null}
        </details>
      ) : (
        <div className="lab-concept-copy">
          <p>{item.description}</p>
          {item.capabilities?.length ? (
            <p className="lab-capabilities">{item.capabilities.join(" / ")}</p>
          ) : null}
        </div>
      )}
    </article>
  );
}

function VisualArtifact({ item }: { item: VisualWork | SelectedWork }) {
  const path = item.image_path || ("slug" in item ? getEvidenceFallbackPath(item.slug) : null);
  const image = useMediaUrl(path);
  if (!image) return null;
  const content = (
    <>
      <img src={image} alt={`${item.title} — ${item.category}`} loading="lazy" />
      <span className="visual-open" aria-hidden="true">
        ↗
      </span>
    </>
  );
  return (
    <figure
      className={`visual-artifact ${path?.endsWith("service-discovery.webp") ? "visual-artifact--wide" : ""}`}
    >
      <div className="visual-artifact-image">
        {"slug" in item ? (
          <Link to="/work/$slug" params={{ slug: item.slug }} aria-label={`Explore ${item.title}`}>
            {content}
          </Link>
        ) : item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer" aria-label={`View ${item.title}`}>
            {content}
          </a>
        ) : (
          <>
            <img src={image} alt={item.title} loading="lazy" />
            <EvidenceViewer url={image} title={item.title} caption={item.short_description} />
          </>
        )}
      </div>
      <figcaption>
        <strong>{item.title}</strong>
        <span className="folio-label">{item.category}</span>
      </figcaption>
    </figure>
  );
}
function ResumeLink({ path }: { path: string }) {
  const url = useMediaUrl(path);
  return url ? (
    <a className="folio-link" href={url} target="_blank" rel="noreferrer">
      Read my résumé ↗
    </a>
  ) : null;
}
