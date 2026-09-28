import { useId, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  type SelectedWork,
  getEvidenceFallbackPath,
  getProjectPresentation,
  mergeCaseStudy,
  useMediaUrl,
} from "@/lib/portfolio";

const MODULE_CROPS = [
  { name: "HRMS", box: "6 10 280 204" },
  { name: "CRM", box: "306 10 280 204" },
  { name: "Timesheet", box: "606 10 280 204" },
  { name: "Payroll", box: "906 10 280 204" },
  { name: "Talent 360", box: "6 234 280 204" },
];

/** Crops the supplied artifact in the browser. No replacement UI is generated. */
function SourceCrop({ url, box, label }: { url: string; box: string; label: string }) {
  return (
    <svg viewBox={box} role="img" aria-label={label}>
      <image href={url} width="1205" height="445" />
    </svg>
  );
}

export function ProjectScene({ item, compact = false }: { item: SelectedWork; compact?: boolean }) {
  const [behind, setBehind] = useState(false);
  const details = mergeCaseStudy(item.slug, item.case_study);
  const style = getProjectPresentation(item);
  const path = details.hero_image_path || item.image_path || getEvidenceFallbackPath(item.slug);
  const url = useMediaUrl(path);
  const fallback = useMediaUrl(getEvidenceFallbackPath(item.slug));
  const image = url || fallback;
  const modules = style === "workspace" && path?.endsWith("enterprise-operations.webp");
  const steps = details.product_workflow?.length ? details.product_workflow : item.workflow;
  const caption = details.evidence_caption || item.evidence_type || "Project artifact";
  const id = useId();

  return (
    <div
      className={`project-scene scene-${style}${compact ? " scene-compact" : ""}${behind ? " scene-behind" : ""}`}
    >
      <div className="scene-toolbar">
        <span className="folio-label">
          {behind
            ? "The work beneath the interface"
            : modules
              ? "Interface fragments"
              : item.evidence_type || "Product artifact"}
        </span>
        {steps?.length ? (
          <button
            className="scene-toggle"
            aria-pressed={behind}
            aria-controls={id}
            onClick={() => setBehind(!behind)}
          >
            {behind ? "← Show the artifact" : "Behind the product ↗"}
          </button>
        ) : null}
      </div>
      <div id={id} className="scene-canvas">
        {behind ? (
          <div className="behind-canvas" key="behind">
            <p className="behind-heading">
              The interface is
              <br />
              only the surface.
            </p>
            <ol className="behind-steps">
              {steps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
            {details.decisions?.[0] ? <p className="behind-note">{details.decisions[0]}</p> : null}
          </div>
        ) : modules && image ? (
          <div className="module-canvas" key="modules">
            <div className="module-crosshair" aria-hidden="true">
              <span />
              <span />
            </div>
            <div className="module-axis" aria-hidden="true">
              Roles / approvals / shared data
            </div>
            {MODULE_CROPS.map((crop, index) => (
              <div className={`module-fragment module-fragment-${index}`} key={crop.name}>
                <SourceCrop
                  url={image}
                  box={crop.box}
                  label={`${crop.name} module — crop of the supplied product screen`}
                />
              </div>
            ))}
          </div>
        ) : image ? (
          <div
            className={`artifact-canvas ${path?.endsWith(".svg") ? "artifact-canvas--map" : ""}`}
            key="artifact"
          >
            <span className="artifact-axis" aria-hidden="true">
              {style === "flow"
                ? "Scope → sequence → review"
                : style === "map"
                  ? "Actors → states → handoffs"
                  : "Product / experience"}
            </span>
            <img
              src={image}
              alt={`${item.title}: ${caption}`}
              loading={compact ? "eager" : "lazy"}
            />
          </div>
        ) : (
          <div className="scene-no-image">
            <span className="folio-label">Product record</span>
            <p>{item.title}</p>
            <span>Explore the workflow and decisions below.</span>
          </div>
        )}
      </div>
      <div className="scene-footer">
        <span>
          {behind
            ? "Product and delivery workflow"
            : modules
              ? "Anonymized source screen · recomposed for this portfolio"
              : caption}
        </span>
        {image ? <EvidenceViewer url={image} title={item.title} caption={caption} /> : null}
      </div>
    </div>
  );
}

export function EvidenceViewer({
  url,
  title,
  caption,
  label = "View original ↗",
}: {
  url: string;
  title: string;
  caption: string;
  label?: string;
}) {
  const [zoom, setZoom] = useState(false);
  return (
    <Dialog.Root onOpenChange={() => setZoom(false)}>
      <Dialog.Trigger className="evidence-trigger">{label}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="evidence-overlay" />
        <Dialog.Content className="evidence-dialog">
          <div className="evidence-dialog-head">
            <Dialog.Title>{title}</Dialog.Title>
            <div>
              <button type="button" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>
                {zoom ? "Fit to view" : "Zoom in +"}
              </button>
              <Dialog.Close aria-label="Close evidence">Close ×</Dialog.Close>
            </div>
          </div>
          <div
            className={`evidence-dialog-canvas${zoom ? " is-zoomed" : ""}`}
            tabIndex={0}
            aria-label="Evidence image, scroll to explore when zoomed"
          >
            <img src={url} alt={caption || title} />
          </div>
          <Dialog.Description className="evidence-dialog-caption">{caption}</Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function WorkflowExplorer({ steps }: { steps: string[] }) {
  const [active, setActive] = useState(0);
  if (!steps.length) return null;
  const selected = Math.min(active, steps.length - 1);
  return (
    <div className="workflow-explorer">
      <div className="workflow-focus" aria-live="polite" aria-atomic="true">
        <span className="workflow-giant" aria-hidden="true">
          {String(selected + 1).padStart(2, "0")}
        </span>
        <div>
          <span className="folio-label">
            Step {selected + 1} of {steps.length}
          </span>
          <h3 key={selected}>{steps[selected]}</h3>
        </div>
        <button
          className="workflow-next"
          aria-label="Next workflow step"
          onClick={() => setActive((selected + 1) % steps.length)}
        >
          →
        </button>
      </div>
      <ol className="workflow-selector">
        {steps.map((step, index) => (
          <li key={step}>
            <button aria-pressed={index === selected} onClick={() => setActive(index)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
