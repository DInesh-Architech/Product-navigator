import { useId, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  type SelectedWork,
  getEvidenceFallbackPath,
  getProjectEvidencePath,
  getProjectPresentation,
  mergeCaseStudy,
  useMediaUrl,
} from "@/lib/portfolio";

export function ProjectScene({ item, compact = false }: { item: SelectedWork; compact?: boolean }) {
  const [behind, setBehind] = useState(false);
  const details = mergeCaseStudy(item.slug, item.case_study);
  const style = getProjectPresentation(item);
  const path = getProjectEvidencePath(item, true);
  const url = useMediaUrl(path);
  const fallback = useMediaUrl(getEvidenceFallbackPath(item.slug));
  const image = url || fallback;
  const enterpriseMap = path?.endsWith("enterprise-system.svg");
  const workflowCrop = path?.endsWith("construction-progress-billing.svg")
    ? { desktop: "55 285 1340 595", mobile: "55 290 1340 345" }
    : path?.endsWith("provider-current-state.svg")
      ? { desktop: "55 275 1350 585", mobile: "55 275 1350 220" }
      : enterpriseMap
        ? { desktop: "48 250 1344 585", mobile: "48 250 1344 585" }
        : null;
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
            ? "Product & delivery workflow"
            : enterpriseMap
              ? "System & delivery map"
              : item.evidence_type || "Product artifact"}
        </span>
        {steps?.length ? (
          <button
            className="scene-toggle"
            aria-pressed={behind}
            aria-controls={id}
            onClick={() => setBehind(!behind)}
          >
            {behind ? "← View product map" : "View workflow →"}
          </button>
        ) : null}
      </div>
      <div id={id} className="scene-canvas">
        {behind ? (
          <div className="behind-canvas" key="behind">
            <p className="behind-heading">
              From decisions
              <br />
              to delivery.
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
        ) : image ? (
          <div
            className={`artifact-canvas ${path?.endsWith(".svg") ? "artifact-canvas--map" : ""}${enterpriseMap ? " artifact-canvas--enterprise" : ""}`}
            key="artifact"
          >
            <span className="artifact-axis" aria-hidden="true">
              {style === "flow"
                ? "Scope → sequence → review"
                : style === "map"
                  ? "Actors → states → handoffs"
                  : enterpriseMap
                    ? "Modules → shared rules → delivery"
                    : "Product / experience"}
            </span>
            {workflowCrop ? (
              <div
                className="source-crop-scroll"
                tabIndex={0}
                role="region"
                aria-label="Workflow detail, scroll to explore"
              >
                <svg
                  className="source-crop-desktop"
                  viewBox={workflowCrop.desktop}
                  role="img"
                  aria-label={`${item.title}: ${caption}`}
                >
                  <image href={image} width="1440" height="960" />
                </svg>
                <svg
                  className="source-crop-mobile"
                  viewBox={workflowCrop.mobile}
                  role="img"
                  aria-label={`${item.title}: ${caption}`}
                >
                  <image href={image} width="1440" height="960" />
                </svg>
              </div>
            ) : (
              <img
                src={image}
                alt={`${item.title}: ${caption}`}
                loading={compact ? "eager" : "lazy"}
              />
            )}
          </div>
        ) : (
          <div className="scene-no-image">
            <span className="folio-label">Product record</span>
            <p>{item.title}</p>
            <span>Explore the workflow and decisions below.</span>
          </div>
        )}
        {!behind && workflowCrop ? (
          <span className="mobile-scene-cue">Scroll to explore the map →</span>
        ) : null}
      </div>
      <div className="scene-footer">
        <span>{behind ? "Product and delivery workflow" : caption}</span>
        {image ? <EvidenceViewer url={image} title={item.title} caption={caption} /> : null}
      </div>
    </div>
  );
}

export function EvidenceViewer({
  url,
  title,
  caption,
  label = "View full-size ↗",
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
