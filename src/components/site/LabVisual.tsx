import { useState } from "react";
import type { IndependentWork } from "@/lib/portfolio";

/** The placeholder follows the actual image load, including cached images and failures. */
export function LabScreenshot({
  image,
  title,
  href,
  crop,
}: {
  image: string | null;
  title: string;
  href?: string | null;
  crop?: boolean;
}) {
  const [loaded, setLoaded] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const ready = Boolean(image && loaded === image);
  const error = Boolean(image && failed === image);
  const content = (
    <>
      {!ready && (
        <div className="lab-image-skeleton" role="status">
          <span className="skeleton-line" aria-hidden="true" />
          <span className="skeleton-line" aria-hidden="true" />
          <span className="skeleton-block" aria-hidden="true" />
          <span className="skeleton-label">
            {error ? "Preview unavailable · open the prototype ↗" : "Loading project preview…"}
          </span>
        </div>
      )}
      {image && !error ? (
        <img
          src={image}
          alt={`${title} — actual prototype interface`}
          className={`${ready ? "is-ready" : ""}${crop ? " lab-preview-crop" : ""}`}
          width="1363"
          height="936"
          loading="lazy"
          decoding="async"
          ref={(node) => {
            if (node?.complete && node.naturalWidth && loaded !== image) setLoaded(image);
          }}
          onLoad={() => setLoaded(image)}
          onError={() => setFailed(image)}
        />
      ) : null}
    </>
  );
  return href ? (
    <a
      className="lab-image-window"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`View ${title}`}
      aria-busy={!ready && !error}
    >
      {content}
    </a>
  ) : (
    <div className="lab-image-window" aria-busy={!ready && !error}>
      {content}
    </div>
  );
}

/** Concept models describe the supplied idea. They are explicitly not product screenshots. */
export function LabConcept({ item }: { item: IndependentWork }) {
  const archy = /^archy$/i.test(item.title.trim());
  const wayu = /^wa+yu$/i.test(item.title.trim());
  const steps = archy
    ? ["Research", "Planning", "Documentation"]
    : wayu
      ? ["Message / URL", "Check evidence", "Finding + sources"]
      : item.capabilities.slice(0, 3);
  return (
    <div className="lab-concept-model">
      <p className="folio-label">
        {archy
          ? "Architectural workflow assistance"
          : wayu
            ? "Evidence verification"
            : "Concept model"}
      </p>
      <ol className="concept-sequence">
        {steps.map((step, index) => (
          <li key={step}>
            <span className="concept-step-number">{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
            {index < steps.length - 1 && (
              <span className="concept-connector" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="concept-principle">
        <span aria-hidden="true">↳</span>
        <p>
          {archy
            ? "Professional judgment stays with the architect."
            : wayu
              ? "Every finding points back to its evidence."
              : item.description}
        </p>
      </div>
    </div>
  );
}
