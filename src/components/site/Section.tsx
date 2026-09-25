import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "default",
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  tone?: "default" | "quiet";
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`px-5 py-20 sm:px-8 md:py-28 ${tone === "quiet" ? "bg-surface/40" : ""}`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="mt-3 text-3xl font-semibold leading-[1.1] sm:text-4xl md:text-5xl"
          >
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {intro}
            </p>
          ) : null}
        </div>
        <div className="mt-6 rule-line" aria-hidden="true" />
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function StateBlock({
  loading,
  error,
  empty,
  emptyText,
  children,
}: {
  loading: boolean;
  error: unknown;
  empty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="panel h-40 animate-pulse opacity-60" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <p role="alert" className="panel p-6 text-sm text-muted-foreground">
        This section could not be loaded right now. Please refresh the page.
      </p>
    );
  }
  if (empty) {
    return <p className="panel p-6 text-sm text-muted-foreground">{emptyText}</p>;
  }
  return <>{children}</>;
}