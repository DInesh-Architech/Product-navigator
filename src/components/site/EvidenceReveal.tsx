import { useMediaUrl } from "@/lib/portfolio";

type Props = {
  path: string | null;
  evidenceType: string;
  title: string;
};

/**
 * Project evidence is a first-class part of the portfolio.
 * Real uploaded media is shown immediately; missing media stays explicit
 * rather than being replaced with fabricated product imagery.
 */
export function EvidenceReveal({ path, evidenceType, title }: Props) {
  const url = useMediaUrl(path);

  return (
    <figure className="group/evidence mt-7 overflow-hidden rounded-[1.35rem] border border-border bg-surface-2">
      <div className="relative aspect-[16/10] overflow-hidden">
        {url ? (
          <img
            src={url}
            alt={`${title} — ${evidenceType.toLowerCase()}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition duration-500 ease-out group-hover/evidence:scale-[1.015]"
          />
        ) : (
          <div className="relative flex h-full items-end overflow-hidden p-5 sm:p-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,var(--color-mint),transparent_24%),radial-gradient(circle_at_78%_35%,var(--color-cobalt),transparent_22%),linear-gradient(135deg,var(--color-surface-2),var(--color-background))]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-6 h-[62%] rounded-xl border border-border bg-background/35 shadow-2xl backdrop-blur-sm"
            />
            <p className="relative max-w-sm text-sm leading-relaxed text-muted-foreground">
              Evidence image not published yet. Add an anonymised project visual from the admin panel.
            </p>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-background/90 via-background/35 to-transparent px-5 pb-4 pt-12">
          <figcaption className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-foreground/80">
            {evidenceType}
          </figcaption>
          <span aria-hidden="true" className="text-lg text-mint">↗</span>
        </div>
      </div>
    </figure>
  );
}
