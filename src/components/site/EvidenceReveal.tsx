import { useState } from "react";
import { useMediaUrl } from "@/lib/portfolio";

type Props = {
  path: string | null;
  evidenceType: string;
  title: string;
};

/**
 * One representative image per case.
 * Desktop: revealed on hover/focus of the case card (controlled by `open` via CSS group).
 * Mobile/tablet: an explicit toggle expands the image inline below the case.
 */
export function EvidenceReveal({ path, evidenceType, title }: Props) {
  const [expanded, setExpanded] = useState(false);
  const url = useMediaUrl(path);

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="btn-base btn-outline !px-3 !py-1.5 !text-xs"
      >
        {expanded ? "Hide visual" : "View visual"}
        <span className="eyebrow !text-[0.6rem] !tracking-[0.12em]">{evidenceType}</span>
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
          expanded ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <figure className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-2">
          {url ? (
            <img
              src={url}
              alt={`${title} — ${evidenceType.toLowerCase()}`}
              loading="lazy"
              className="w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center px-6 text-center">
              <p className="text-sm text-muted-foreground">
                Visual placeholder — an anonymised {evidenceType.toLowerCase()} for {title} will be
                published here.
              </p>
            </div>
          )}
          <figcaption className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            {evidenceType}
            {evidenceType !== "Actual UI"
              ? " — not a screenshot of a client product."
              : " — anonymised before publication."}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}